# backend/models.py

import random
from django.db import models

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
    
class Review(models.Model):
    product = models.ForeignKey(Product, related_name='reviews', on_delete=models.CASCADE)
    rating = models.IntegerField()
    comment = models.TextField()
    date = models.DateTimeField()
    reviewer_name = models.CharField(max_length=100)
    reviewer_email = models.EmailField()

class Dimension(models.Model):
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='dimensions')
    width = models.FloatField()
    height = models.FloatField()
    depth = models.FloatField()