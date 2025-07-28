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
        reviews = self.reviews.filter(status='approved')
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
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
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
        
        # Update product rating if this is a new approved review
        if is_new and self.status == 'approved':
            self.product.update_average_rating()

class Dimension(models.Model):
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='dimensions')
    width = models.FloatField()
    height = models.FloatField()
    depth = models.FloatField()