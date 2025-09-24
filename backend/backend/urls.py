"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include(blog.urls))
"""

# backend/urls.py

from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from products.views import (
    product_list, product_detail, categories, create_category, brands, add_review, review_detail,
    upload_product_images, upload_single_image, delete_image, upload_profile_picture,
    create_payment_intent, send_order_confirmation, webhook, send_welcome_email, send_verification_reminder,
    update_stock_after_order, subscribe_newsletter, unsubscribe_newsletter, check_newsletter_subscription,
    get_newsletter_subscribers, admin_unsubscribe_newsletter, send_newsletter_to_subscriber,
    get_email_templates, create_email_template, get_email_template, update_email_template,
    delete_email_template, send_email_with_template, get_template_assignments, 
    create_template_assignment, update_template_assignment, delete_template_assignment,
    get_template_for_purpose
)

router = DefaultRouter()

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    
    # Product endpoints
    path('api/products/', product_list, name='product_list'),
    path('api/products/<int:pk>/', product_detail, name='product_detail'),
    path('api/categories/', categories, name='categories'),
    path('api/categories/create/', create_category, name='create_category'),
    path('api/brands/', brands, name='brands'),
    path('api/products/<int:product_id>/reviews/', add_review, name='add_review'),
    path('api/products/<int:product_id>/reviews/<int:review_id>/', review_detail, name='review_detail'),
    
    # Image upload endpoints
    path('api/upload/images/', upload_product_images, name='upload_product_images'),
    path('api/upload/image/', upload_single_image, name='upload_single_image'),
    path('api/upload-profile-picture/', upload_profile_picture, name='upload_profile_picture'),
    path('api/delete/image/', delete_image, name='delete_image'),
    
    # Payment endpoints
    path('api/create-payment-intent/', create_payment_intent, name='create_payment_intent'),
    path('api/send-order-confirmation/', send_order_confirmation, name='send_order_confirmation'),
    path('api/update-stock/', update_stock_after_order, name='update_stock_after_order'),
    path('api/webhook/', webhook, name='webhook'),
    
    # Email endpoints
    path('api/send-welcome-email/', send_welcome_email, name='send_welcome_email'),
    path('api/send-verification-reminder/', send_verification_reminder, name='send_verification_reminder'),
    
        # Newsletter endpoints
        path('api/newsletter/subscribe/', subscribe_newsletter, name='subscribe_newsletter'),
        path('api/newsletter/unsubscribe/', unsubscribe_newsletter, name='unsubscribe_newsletter'),
        path('api/newsletter/check/', check_newsletter_subscription, name='check_newsletter_subscription'),
        path('api/newsletter/subscribers/', get_newsletter_subscribers, name='get_newsletter_subscribers'),
        path('api/newsletter/admin-unsubscribe/', admin_unsubscribe_newsletter, name='admin_unsubscribe_newsletter'),
        path('api/newsletter/send-to-subscriber/', send_newsletter_to_subscriber, name='send_newsletter_to_subscriber'),
        
        # Email template endpoints
        path('api/email/templates/', get_email_templates, name='get_email_templates'),
        path('api/email/templates/create/', create_email_template, name='create_email_template'),
        path('api/email/templates/<int:template_id>/', get_email_template, name='get_email_template'),
        path('api/email/templates/<int:template_id>/update/', update_email_template, name='update_email_template'),
        path('api/email/templates/<int:template_id>/delete/', delete_email_template, name='delete_email_template'),
        path('api/email/send-with-template/', send_email_with_template, name='send_email_with_template'),
        
        # Template assignment endpoints
        path('api/email/template-assignments/', get_template_assignments, name='get_template_assignments'),
        path('api/email/template-assignments/create/', create_template_assignment, name='create_template_assignment'),
        path('api/email/template-assignments/<int:assignment_id>/update/', update_template_assignment, name='update_template_assignment'),
        path('api/email/template-assignments/<int:assignment_id>/delete/', delete_template_assignment, name='delete_template_assignment'),
        path('api/email/template-for-purpose/<str:purpose>/', get_template_for_purpose, name='get_template_for_purpose'),
]

# Serve static files FIRST (before React catch-all)
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Serve React app for all other routes (LAST)
urlpatterns += [
    re_path(r'^.*', TemplateView.as_view(template_name='index.html')),
]
