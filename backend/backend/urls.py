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
    ProductViewSet, server_status, restricted_view, 
    pending_reviews, moderate_review
)

router = DefaultRouter()
router.register(r'products', ProductViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('server-status/', server_status, name='server_status'),
    path('restricted/', restricted_view),
    path('api/reviews/pending/', pending_reviews, name='pending_reviews'),
    path('api/reviews/<int:review_id>/moderate/', moderate_review, name='moderate_review'),
]

# Serve React app for all other routes
urlpatterns += [
    re_path(r'^.*', TemplateView.as_view(template_name='index.html')),
]

# Serve static files in both development and production
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
