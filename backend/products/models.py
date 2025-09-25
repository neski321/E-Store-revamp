# backend/models.py

import random
from django.db import models
from django.utils import timezone

class Product(models.Model):
    id = models.IntegerField(primary_key=True, editable=False)
    title = models.CharField(max_length=255, db_index=True)
    description = models.TextField()
    category = models.CharField(max_length=100, db_index=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, db_index=True)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    rating = models.FloatField(default=0.0, db_index=True)
    stock = models.IntegerField(default=0, db_index=True)
    brand = models.CharField(max_length=100, default='N/A')
    sku = models.CharField(max_length=50, default='N/A')
    weight = models.FloatField(default=0.0)
    warranty_information = models.CharField(max_length=255, default='To be determined')
    shipping_information = models.CharField(max_length=255, default='To be determined')
    availability_status = models.CharField(max_length=50, default='In progress')
    return_policy = models.CharField(max_length=255, default='To be determined')
    minimum_order_quantity = models.IntegerField(default=1)
    thumbnail = models.URLField(default='XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')
    images = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['category', 'price']),
            models.Index(fields=['rating', 'price']),
            models.Index(fields=['stock', 'price']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if not self.id:  # Check if this is a new product
            self.id = self.generate_unique_id()  # a unique random ID
        super(Product, self).save(*args, **kwargs)

    def generate_unique_id(self):
        while True:
            random_id = random.randint(10000, 99999)  # random 5-digit number
            if not Product.objects.filter(id=random_id).exists():  # unique
                return random_id
    
    def update_average_rating(self):
        """Update the product's average rating based on reviews"""
        # Include all reviews (both approved and pending) for rating calculation
        reviews = self.reviews.all()
        if reviews.exists():
            avg_rating = reviews.aggregate(avg=models.Avg('rating'))['avg']
            self.rating = round(avg_rating, 1)
        else:
            self.rating = 0.0
        self.save(update_fields=['rating'])

class Review(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    product = models.ForeignKey(Product, related_name='reviews', on_delete=models.CASCADE)
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField()
    date = models.DateTimeField(default=timezone.now)
    reviewer_name = models.CharField(max_length=100)
    reviewer_email = models.EmailField()
    reviewer_id = models.CharField(max_length=100, blank=True, null=True)  # For user identification
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='approved')
    helpful_votes = models.IntegerField(default=0)
    total_votes = models.IntegerField(default=0)
    is_verified_purchase = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date']
        indexes = [
            models.Index(fields=['product', 'status']),
            models.Index(fields=['rating']),
            models.Index(fields=['date']),
        ]
    
    def __str__(self):
        return f"Review by {self.reviewer_name} for {self.product.title}"
    
    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        # Update product rating if this is a new review
        if is_new:
            self.product.update_average_rating()

class Dimension(models.Model):
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='dimensions')
    width = models.FloatField()
    height = models.FloatField()
    depth = models.FloatField()


class EmailTemplate(models.Model):
    TEMPLATE_TYPES = [
        ('welcome', 'Welcome Email'),
        ('promotional', 'Promotional'),
        ('newsletter', 'Newsletter'),
        ('announcement', 'Announcement'),
        ('custom', 'Custom'),
    ]
    
    USAGE_PURPOSES = [
        ('new_user_welcome', 'New User Welcome'),
        ('newsletter_send', 'Newsletter Sending'),
        ('promotional_campaign', 'Promotional Campaign'),
        ('product_announcement', 'Product Announcement'),
        ('system_notification', 'System Notification'),
        ('custom_use', 'Custom Use'),
    ]
    
    name = models.CharField(max_length=200, unique=True)
    template_type = models.CharField(max_length=50, choices=TEMPLATE_TYPES, default='newsletter')
    subject = models.CharField(max_length=300)
    html_content = models.TextField()
    plain_text_content = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.CharField(max_length=100, blank=True, null=True)  # Admin user ID
    variables = models.JSONField(default=dict, blank=True)  # Available template variables
    description = models.TextField(blank=True, null=True)
    usage_count = models.PositiveIntegerField(default=0)  # Track how many times used

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['template_type', 'is_active']),
            models.Index(fields=['is_active']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"Template: {self.name} ({self.get_template_type_display()})"

    def increment_usage(self):
        """Increment usage count when template is used"""
        self.usage_count += 1
        self.save(update_fields=['usage_count'])

    def save(self, *args, **kwargs):
        # Ensure only one default template per type
        if self.is_default:
            EmailTemplate.objects.filter(
                template_type=self.template_type,
                is_default=True
            ).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)


class EmailTemplateAssignment(models.Model):
    """
    Model to assign specific templates to different usage purposes.
    This allows admins to select which template to use for each email purpose.
    """
    PURPOSE_CHOICES = [
        ('new_user_welcome', 'New User Welcome'),
        ('newsletter_send', 'Newsletter Sending'),
        ('promotional_campaign', 'Promotional Campaign'),
        ('product_announcement', 'Product Announcement'),
        ('system_notification', 'System Notification'),
        ('custom_use', 'Custom Use'),
    ]
    
    purpose = models.CharField(max_length=50, choices=PURPOSE_CHOICES, unique=True)
    template = models.ForeignKey(EmailTemplate, on_delete=models.CASCADE, related_name='assignments')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.CharField(max_length=100, blank=True, null=True)
    
    class Meta:
        ordering = ['purpose']
        verbose_name = 'Email Template Assignment'
        verbose_name_plural = 'Email Template Assignments'
    
    def __str__(self):
        return f"{self.get_purpose_display()}: {self.template.name}"
    
    @classmethod
    def get_template_for_purpose(cls, purpose):
        """Get the assigned template for a specific purpose"""
        try:
            assignment = cls.objects.get(purpose=purpose, is_active=True)
            return assignment.template
        except cls.DoesNotExist:
            # Fallback to default template of the appropriate type
            if purpose == 'new_user_welcome':
                return EmailTemplate.objects.filter(
                    template_type='welcome',
                    is_active=True,
                    is_default=True
                ).first()
            elif purpose == 'newsletter_send':
                return EmailTemplate.objects.filter(
                    template_type='newsletter',
                    is_active=True,
                    is_default=True
                ).first()
            elif purpose == 'promotional_campaign':
                return EmailTemplate.objects.filter(
                    template_type='promotional',
                    is_active=True,
                    is_default=True
                ).first()
            elif purpose == 'product_announcement':
                return EmailTemplate.objects.filter(
                    template_type='announcement',
                    is_active=True,
                    is_default=True
                ).first()
            return None


class NewsletterSubscription(models.Model):
    """
    Model for managing newsletter subscriptions
    """
    email = models.EmailField(db_index=True, max_length=254, unique=True)
    is_active = models.BooleanField(default=True)
    subscribed_at = models.DateTimeField(auto_now_add=True)
    unsubscribed_at = models.DateTimeField(blank=True, null=True)
    subscription_source = models.CharField(default='footer', max_length=100)
    user_id = models.CharField(blank=True, max_length=100, null=True)
    preferences = models.JSONField(default=dict)
    
    class Meta:
        ordering = ['-subscribed_at']
        indexes = [
            models.Index(fields=['email', 'is_active'], name='products_ne_email_ef14a8_idx'),
            models.Index(fields=['is_active'], name='products_ne_is_acti_8cfd57_idx'),
            models.Index(fields=['subscribed_at'], name='products_ne_subscri_ecc807_idx'),
        ]
        verbose_name = 'Newsletter Subscription'
        verbose_name_plural = 'Newsletter Subscriptions'
    
    def __str__(self):
        return f"{self.email} ({'Active' if self.is_active else 'Inactive'})"
    
    def unsubscribe(self):
        """Mark subscription as inactive"""
        self.is_active = False
        self.unsubscribed_at = timezone.now()
        self.save()