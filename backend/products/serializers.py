from rest_framework import serializers
from .models import Product, Review, Dimension

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

    class Meta:
        model = Product
        fields = '__all__'
        
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