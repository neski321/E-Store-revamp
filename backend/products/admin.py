from django.contrib import admin
from .models import Product, Review, Dimension, NewsletterSubscription

# Register your models here.

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'category', 'price', 'stock', 'rating', 'created_at']
    list_filter = ['category', 'created_at', 'rating']
    search_fields = ['title', 'description', 'category']
    ordering = ['-created_at']
    readonly_fields = ['id', 'created_at', 'updated_at']

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['id', 'product', 'reviewer_name', 'rating', 'status', 'date']
    list_filter = ['status', 'rating', 'date']
    search_fields = ['reviewer_name', 'reviewer_email', 'comment']
    ordering = ['-date']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(Dimension)
class DimensionAdmin(admin.ModelAdmin):
    list_display = ['product', 'width', 'height', 'depth']
    search_fields = ['product__title']

@admin.register(NewsletterSubscription)
class NewsletterSubscriptionAdmin(admin.ModelAdmin):
    list_display = ['email', 'is_active', 'subscription_source', 'subscribed_at', 'unsubscribed_at']
    list_filter = ['is_active', 'subscription_source', 'subscribed_at']
    search_fields = ['email', 'user_id']
    ordering = ['-subscribed_at']
    readonly_fields = ['subscribed_at', 'unsubscribed_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related()
