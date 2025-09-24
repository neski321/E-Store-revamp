from django.contrib import admin
from .models import Product, Review, Dimension, NewsletterSubscription, EmailTemplate, EmailTemplateAssignment

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

@admin.register(EmailTemplate)
class EmailTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'template_type', 'is_active', 'is_default', 'usage_count', 'created_at']
    list_filter = ['template_type', 'is_active', 'is_default', 'created_at']
    search_fields = ['name', 'subject', 'description']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at', 'usage_count']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'template_type', 'description', 'is_active', 'is_default')
        }),
        ('Content', {
            'fields': ('subject', 'html_content', 'plain_text_content')
        }),
        ('Variables', {
            'fields': ('variables',),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_by', 'usage_count', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )

    def get_queryset(self, request):
        return super().get_queryset(request)


@admin.register(EmailTemplateAssignment)
class EmailTemplateAssignmentAdmin(admin.ModelAdmin):
    list_display = ['purpose', 'template', 'is_active', 'created_at']
    list_filter = ['purpose', 'is_active', 'created_at']
    search_fields = ['purpose', 'template__name']
    ordering = ['purpose']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Assignment', {
            'fields': ('purpose', 'template', 'is_active')
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        if not change:  # Only set created_by for new objects
            obj.created_by = request.user.username if request.user.is_authenticated else 'admin'
        super().save_model(request, obj, form, change)
