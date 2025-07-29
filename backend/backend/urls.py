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
    product_list, product_detail, categories, brands, add_review,
    create_payment_intent, send_order_confirmation, webhook
)

router = DefaultRouter()

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    
    # Product endpoints
    path('api/products/', product_list, name='product_list'),
    path('api/products/<int:pk>/', product_detail, name='product_detail'),
    path('api/categories/', categories, name='categories'),
    path('api/brands/', brands, name='brands'),
    path('api/products/<int:product_id>/reviews/', add_review, name='add_review'),
    
    # Payment endpoints
    path('api/create-payment-intent/', create_payment_intent, name='create_payment_intent'),
    path('api/send-order-confirmation/', send_order_confirmation, name='send_order_confirmation'),
    path('api/webhook/', webhook, name='webhook'),
]

# Serve static files FIRST (before React catch-all)
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Serve React app for all other routes (LAST)
urlpatterns += [
    re_path(r'^.*', TemplateView.as_view(template_name='index.html')),
]
