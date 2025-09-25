from rest_framework import serializers
from .models import Product, Review, Dimension, NewsletterSubscription, EmailTemplate, EmailTemplateAssignment

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = [
            'id', 'rating', 'comment', 'date', 'reviewer_name', 
            'reviewer_email', 'reviewer_id', 'status', 'helpful_votes', 
            'total_votes', 'is_verified_purchase', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'helpful_votes', 'total_votes']

class ReviewModerationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['id', 'status', 'comment', 'rating', 'reviewer_name', 'date']
        read_only_fields = ['id', 'comment', 'rating', 'reviewer_name', 'date']

class DimensionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dimension
        fields = ['width', 'height', 'depth']

class ProductSerializer(serializers.ModelSerializer):
    reviews = ReviewSerializer(many=True, required=False)
    dimensions = DimensionSerializer(required=False)
    id = serializers.ReadOnlyField()
    review_count = serializers.SerializerMethodField()
    images = serializers.JSONField(required=False)

    class Meta:
        model = Product
        fields = '__all__'
    
    def get_review_count(self, obj):
        return obj.reviews.count()
    
    def validate_title(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Product title is required.")
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Product title must be at least 3 characters long.")
        if len(value.strip()) > 255:
            raise serializers.ValidationError("Product title must be less than 255 characters.")
        return value.strip()
    
    def validate_description(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Product description is required.")
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Product description must be at least 10 characters long.")
        if len(value.strip()) > 2000:
            raise serializers.ValidationError("Product description must be less than 2000 characters.")
        return value.strip()
    
    def validate_category(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Product category is required.")
        if len(value.strip()) > 100:
            raise serializers.ValidationError("Category must be less than 100 characters.")
        return value.strip()
    
    def validate_price(self, value):
        if value is None or value <= 0:
            raise serializers.ValidationError("Price must be greater than 0.")
        if value > 999999.99:
            raise serializers.ValidationError("Price must be less than $999,999.99.")
        return value
    
    def validate_discount_percentage(self, value):
        if value is not None and (value < 0 or value > 100):
            raise serializers.ValidationError("Discount percentage must be between 0 and 100.")
        return value
    
    def validate_stock(self, value):
        if value is None or value < 0:
            raise serializers.ValidationError("Stock quantity must be 0 or greater.")
        if value > 999999:
            raise serializers.ValidationError("Stock quantity must be less than 1,000,000.")
        return value
    
    def validate_brand(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Brand is required.")
        if len(value.strip()) > 100:
            raise serializers.ValidationError("Brand name must be less than 100 characters.")
        return value.strip()
    
    def validate_sku(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("SKU is required.")
        if len(value.strip()) > 50:
            raise serializers.ValidationError("SKU must be less than 50 characters.")
        return value.strip()
    
    def validate_weight(self, value):
        if value is None or value <= 0:
            raise serializers.ValidationError("Weight must be greater than 0.")
        if value > 9999.99:
            raise serializers.ValidationError("Weight must be less than 10,000 lbs.")
        return value
    
    def validate_minimum_order_quantity(self, value):
        if value is not None and value < 1:
            raise serializers.ValidationError("Minimum order quantity must be at least 1.")
        return value
    
    def validate_thumbnail(self, value):
        if value and not value.startswith('http'):
            raise serializers.ValidationError("Thumbnail must be a valid URL.")
        return value
    
    def validate_images(self, value):
        if value is not None:
            # Handle both array and object formats for backward compatibility
            if isinstance(value, list):
                # Array format - keep as is (current standard)
                return value
            elif isinstance(value, dict) and 'urls' in value:
                # Object with urls array - convert to array
                return value['urls']
            elif isinstance(value, dict):
                # Object with keys like image_1, image_2 - convert to array
                return list(value.values())
        return value
        
    def create(self, validated_data):
        # Handle dimensions and reviews
        dimensions_data = validated_data.pop('dimensions', None)
        reviews_data = validated_data.pop('reviews', [])

        # Create the product
        product = Product.objects.create(**validated_data)

        # dimensions 
        if dimensions_data:
            Dimension.objects.create(product=product, **dimensions_data)

        #  reviews 
        for review_data in reviews_data:
            review_data.pop('product', None)  #  Avoid conflict
            Review.objects.create(product=product, **review_data)

        return product

    def update(self, instance, validated_data):
        # Update or create dimensions
        dimensions_data = validated_data.pop('dimensions', None)
        if dimensions_data:
            Dimension.objects.update_or_create(product=instance, defaults=dimensions_data)

        # Update reviews
        reviews_data = validated_data.pop('reviews', [])
        if reviews_data:
            instance.reviews.all().delete()
            for review_data in reviews_data:
                review_data.pop('product', None)  # Avoid conflict
                Review.objects.create(product=instance, **review_data)

        # Update other product fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance

class NewsletterSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterSubscription
        fields = ['email', 'is_active', 'subscribed_at', 'unsubscribed_at', 'subscription_source', 'user_id', 'preferences']
        read_only_fields = ['subscribed_at', 'unsubscribed_at']
    
    def validate_email(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Email address is required.")
        return value.strip().lower()
    
    def create(self, validated_data):
        email = validated_data['email']
        # Check if subscription already exists
        existing_subscription = NewsletterSubscription.objects.filter(email=email).first()
        
        if existing_subscription:
            if existing_subscription.is_active:
                raise serializers.ValidationError("This email is already subscribed to our newsletter.")
            else:
                # Reactivate existing subscription
                existing_subscription.is_active = True
                existing_subscription.unsubscribed_at = None
                existing_subscription.subscription_source = validated_data.get('subscription_source', 'footer')
                existing_subscription.user_id = validated_data.get('user_id')
                existing_subscription.preferences = validated_data.get('preferences', {})
                existing_subscription.save()
                return existing_subscription
        else:
            # Create new subscription
            return super().create(validated_data)


class EmailTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailTemplate
        fields = [
            'id', 'name', 'template_type', 'subject', 'html_content', 
            'plain_text_content', 'is_active', 'is_default', 'created_at', 
            'updated_at', 'created_by', 'variables', 'description', 'usage_count'
        ]
        read_only_fields = ['created_at', 'updated_at', 'usage_count']

    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Template name is required.")
        return value.strip()

    def validate_subject(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Subject is required.")
        return value.strip()

    def validate_html_content(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("HTML content is required.")
        return value.strip()

    def create(self, validated_data):
        # Set created_by from request context if available
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user:
            validated_data['created_by'] = getattr(request.user, 'uid', None)
        return super().create(validated_data)


class EmailTemplateAssignmentSerializer(serializers.ModelSerializer):
    template_name = serializers.CharField(source='template.name', read_only=True)
    template_type = serializers.CharField(source='template.template_type', read_only=True)
    purpose_display = serializers.CharField(source='get_purpose_display', read_only=True)
    
    class Meta:
        model = EmailTemplateAssignment
        fields = [
            'id', 'purpose', 'purpose_display', 'template', 'template_name', 
            'template_type', 'is_active', 'created_at', 'updated_at', 'created_by'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def create(self, validated_data):
        # Set created_by from request context if available
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user:
            validated_data['created_by'] = getattr(request.user, 'uid', None)
        return super().create(validated_data)