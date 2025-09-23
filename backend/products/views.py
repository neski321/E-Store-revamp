# backend/products/views.py

import stripe
import os
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.mail import send_mail
from .email_service import EmailService
from django.template.loader import render_to_string
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import Product, Review, NewsletterSubscription
from .serializers import ProductSerializer, ReviewSerializer, NewsletterSubscriptionSerializer
from .cloudflare_service import cloudflare_r2
import json

# Configure Stripe
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

@api_view(['GET', 'POST'])
def product_list(request):
    """Get all products with optional filtering or create a new product"""
    if request.method == 'POST':
        # Handle product creation
        try:
            # Check if user is authenticated
            user_id = request.headers.get('X-User-ID')
            user_role = request.headers.get('X-User-Role', 'user')
            
            if not user_id:
                return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
            
            # Check if user has permission (admin or authenticated user)
            if user_role not in ['admin', 'user']:
                return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
            
            # Create product
            serializer = ProductSerializer(data=request.data)
            if serializer.is_valid():
                product = serializer.save()
                return Response(ProductSerializer(product).data, status=status.HTTP_201_CREATED)
            else:
                # Format validation errors for better user experience
                formatted_errors = {}
                for field, errors in serializer.errors.items():
                    if isinstance(errors, list):
                        formatted_errors[field] = errors[0] if errors else "Invalid value"
                    else:
                        formatted_errors[field] = str(errors)
                
                return Response({
                    'error': 'Validation failed',
                    'message': 'Please fix the following errors before submitting the product.',
                    'details': formatted_errors,
                    'field_errors': formatted_errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            print(f"Error creating product: {e}")
            return Response({
                'error': 'Internal server error',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # Handle GET request (existing logic)
    products = Product.objects.all()
    
    # Apply filters
    category = request.GET.get('category')
    if category:
        products = products.filter(category=category)
    
    # Add title filter
    title = request.GET.get('title')
    if title:
        products = products.filter(title__icontains=title)
    
    # Add brand filter
    brand = request.GET.get('brand')
    if brand:
        products = products.filter(brand=brand)
    
    min_price = request.GET.get('min_price')
    if min_price:
        products = products.filter(price__gte=min_price)
    
    max_price = request.GET.get('max_price')
    if max_price:
        products = products.filter(price__lte=max_price)
    
    # Add rating filters
    min_rating = request.GET.get('min_rating')
    if min_rating:
        products = products.filter(rating__gte=min_rating)
    
    max_rating = request.GET.get('max_rating')
    if max_rating:
        products = products.filter(rating__lte=max_rating)
    
    # Add stock filter
    in_stock = request.GET.get('in_stock')
    if in_stock == 'true':
        products = products.filter(stock__gt=0)
    
    # Add discount filter
    has_discount = request.GET.get('has_discount')
    if has_discount == 'true':
        products = products.filter(discount_percentage__gt=0)
    
    search = request.GET.get('search')
    if search:
        products = products.filter(title__icontains=search)
    
    # Add support for filtering by multiple IDs
    ids = request.GET.get('ids')
    if ids:
        try:
            # Split comma-separated IDs and convert to integers
            id_list = [int(id.strip()) for id in ids.split(',') if id.strip()]
            if id_list:
                products = products.filter(id__in=id_list)
        except ValueError:
            # If any ID is not a valid integer, ignore the filter
            pass
    
    # Apply ordering
    sort_by = request.GET.get('sort', 'id')
    order = request.GET.get('order', 'desc')
    
    # Handle sort field mapping
    if sort_by == 'id':
        sort_field = 'id'
    elif sort_by == 'price':
        sort_field = 'price'
    elif sort_by == 'rating':
        sort_field = 'rating'
    elif sort_by == 'created_at':
        sort_field = 'created_at'
    elif sort_by == 'title':
        sort_field = 'title'
    else:
        sort_field = 'id'
    
    # Apply order
    if order == 'desc':
        sort_field = f'-{sort_field}'
    
    products = products.order_by(sort_field)
    
    # Apply pagination
    page = request.GET.get('page', '1')
    page_size = request.GET.get('page_size', '12')
    
    try:
        page = int(page)
        page_size = int(page_size)
    except ValueError:
        page = 1
        page_size = 12
    
    # Calculate pagination
    total_count = products.count()
    start = (page - 1) * page_size
    end = start + page_size
    
    # Apply pagination
    products = products[start:end]
    
    # Prepare response with pagination info
    response_data = {
        'count': total_count,
        'next': f'?page={page + 1}&page_size={page_size}' if end < total_count else None,
        'previous': f'?page={page - 1}&page_size={page_size}' if page > 1 else None,
        'results': ProductSerializer(products, many=True).data
    }
    
    return Response(response_data)

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def product_detail(request, pk):
    """Get, update, or delete a specific product by ID"""
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = ProductSerializer(product)
        return Response(serializer.data)
    
    elif request.method in ['PUT', 'PATCH']:
        # Handle product update
        try:
            # Check if user is authenticated
            user_id = request.headers.get('X-User-ID')
            user_role = request.headers.get('X-User-Role', 'user')
            
            if not user_id:
                return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
            
            # Check if user has permission (admin or product owner)
            if user_role not in ['admin', 'user']:
                return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
            
            # For partial updates (PATCH), use partial=True
            partial = request.method == 'PATCH'
            serializer = ProductSerializer(product, data=request.data, partial=partial)
            
            if serializer.is_valid():
                # Store old images for cleanup (before database update)
                old_images = []
                if 'images' in request.data:
                    # Handle different image formats for backward compatibility
                    if isinstance(product.images, list):
                        old_images = product.images
                    elif isinstance(product.images, dict) and 'urls' in product.images:
                        old_images = product.images['urls']
                    elif isinstance(product.images, dict):
                        old_images = list(product.images.values())
                    
                    # Get new images - handle both array and object formats
                    new_images_data = request.data.get('images', [])
                    if isinstance(new_images_data, list):
                        new_images = new_images_data
                    elif isinstance(new_images_data, dict) and 'urls' in new_images_data:
                        new_images = new_images_data['urls']
                    elif isinstance(new_images_data, dict):
                        new_images = list(new_images_data.values())
                    else:
                        new_images = []
                    
                    # Find images to delete
                    images_to_delete = [img for img in old_images if img not in new_images]
                
                # Update the product in database FIRST
                updated_product = serializer.save()
                
                # Clean up old images from Cloudflare AFTER successful database update
                if 'images' in request.data and images_to_delete:
                    for image_url in images_to_delete:
                        try:
                            from .cloudflare_service import cloudflare_r2
                            if cloudflare_r2.is_configured:
                                # Extract filename from URL
                                filename = image_url.split('/')[-1]
                                cloudflare_r2.delete_image(filename)
                                pass  # Image deleted successfully
                        except Exception as e:
                            print(f"Error deleting old image {image_url}: {e}")
                
                return Response(ProductSerializer(updated_product).data, status=status.HTTP_200_OK)
            else:
                # Format validation errors for better user experience
                formatted_errors = {}
                for field, errors in serializer.errors.items():
                    if isinstance(errors, list):
                        formatted_errors[field] = errors[0] if errors else "Invalid value"
                    else:
                        formatted_errors[field] = str(errors)
                
                return Response({
                    'error': 'Validation failed',
                    'message': 'Please fix the following errors before updating the product.',
                    'details': formatted_errors,
                    'field_errors': formatted_errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            print(f"Error updating product: {e}")
            return Response({
                'error': 'Internal server error',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    elif request.method == 'DELETE':
        # Handle product deletion
        try:
            # Check if user is authenticated
            user_id = request.headers.get('X-User-ID')
            user_role = request.headers.get('X-User-Role', 'user')
            
            if not user_id:
                return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
            
            # Check if user has permission (admin or product owner)
            if user_role not in ['admin', 'user']:
                return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
            
            # Delete all product images from Cloudflare
            try:
                from .cloudflare_service import cloudflare_r2
                if cloudflare_r2.is_configured:
                    product_images = product.images.get('urls', [])
                    for image_url in product_images:
                        try:
                            # Extract filename from URL
                            filename = image_url.split('/')[-1]
                            cloudflare_r2.delete_image(filename)
                            print(f"Deleted product image: {filename}")
                        except Exception as e:
                            print(f"Error deleting image {image_url}: {e}")
            except Exception as e:
                print(f"Error during image cleanup: {e}")
            
            # Delete the product
            product.delete()
            
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        except Exception as e:
            print(f"Error deleting product: {e}")
            return Response({
                'error': 'Internal server error',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def categories(request):
    """Get all available categories"""
    categories = Product.objects.values_list('category', flat=True).distinct()
    return Response(list(categories))

@api_view(['POST'])
def create_category(request):
    """Create a new category"""
    try:
        # Check if user is authenticated
        user_id = request.headers.get('X-User-ID')
        user_role = request.headers.get('X-User-Role', 'user')
        
        if not user_id:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check if user has permission (admin or authenticated user)
        if user_role not in ['admin', 'user']:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        category_name = request.data.get('name', '').strip()
        
        if not category_name:
            return Response({'error': 'Category name is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if category already exists
        existing_categories = Product.objects.values_list('category', flat=True).distinct()
        if category_name in existing_categories:
            return Response({'error': 'Category already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        # For now, we'll just return success since categories are stored as strings
        # In a more complex system, you might want to create a Category model
        return Response({
            'success': True,
            'message': f'Category "{category_name}" is now available',
            'category': category_name
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        print(f"Error creating category: {e}")
        return Response({
            'error': 'Internal server error',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def brands(request):
    """Get all available brands, optionally filtered by category"""
    category = request.GET.get('category')
    
    if category:
        # Filter brands by category
        brands = Product.objects.filter(category=category).values_list('brand', flat=True).distinct()
    else:
        # Get all brands
        brands = Product.objects.values_list('brand', flat=True).distinct()
    
    # Filter out None/empty values and sort
    brands = sorted([brand for brand in brands if brand])
    
    return Response(brands)

@api_view(['POST'])
def add_review(request, product_id):
    """Add a review to a product"""
    try:
        product = Product.objects.get(pk=product_id)
        
        # Get user info from request headers (Firebase token)
        user_id = request.headers.get('X-User-ID')
        user_email = request.headers.get('X-User-Email')
        
        # Prepare review data with user info
        review_data = request.data.copy()
        if user_id:
            review_data['reviewer_id'] = user_id
        if user_email:
            review_data['reviewer_email'] = user_email
        
        serializer = ReviewSerializer(data=review_data)
        
        if serializer.is_valid():
            serializer.save(product=product)
            
            # Update product rating
            product.update_average_rating()
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['PUT', 'DELETE'])
def review_detail(request, product_id, review_id):
    """Update or delete a specific review"""
    try:
        product = Product.objects.get(pk=product_id)
        review = Review.objects.get(pk=review_id, product=product)
        
        # Get user info from request headers
        user_id = request.headers.get('X-User-ID')
        user_role = request.headers.get('X-User-Role', 'user')
        
        # Check permissions
        is_owner = user_id and review.reviewer_id == user_id
        is_admin = user_role == 'admin'
        
        if not is_owner and not is_admin:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        if request.method == 'PUT':
            # Only the review owner can edit (not admins)
            if not is_owner:
                return Response({'error': 'Only the review author can edit their review'}, status=status.HTTP_403_FORBIDDEN)
            
            # Update review
            serializer = ReviewSerializer(review, data=request.data, partial=True)
            if serializer.is_valid():
                # Don't allow updating reviewer_id or reviewer_email for security
                update_data = serializer.validated_data
                if 'reviewer_id' in update_data:
                    del update_data['reviewer_id']
                if 'reviewer_email' in update_data:
                    del update_data['reviewer_email']
                
                # Update only the allowed fields
                for field, value in update_data.items():
                    setattr(review, field, value)
                review.save()
                
                # Update product rating
                product.update_average_rating()
                return Response(ReviewSerializer(review).data)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        elif request.method == 'DELETE':
            # Delete review
            review.delete()
            # Update product rating
            product.update_average_rating()
            return Response(status=status.HTTP_204_NO_CONTENT)
            
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
    except Review.DoesNotExist:
        return Response({'error': 'Review not found'}, status=status.HTTP_404_NOT_FOUND)

# Image Upload Endpoints

@api_view(['POST'])
def upload_product_images(request):
    """Upload product images to Cloudflare R2"""
    try:
        # Check if user is authenticated
        user_id = request.headers.get('X-User-ID')
        user_role = request.headers.get('X-User-Role', 'user')
        
        if not user_id:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check if user has permission (admin or authenticated user)
        if user_role not in ['admin', 'user']:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get images and product title from request
        images = request.FILES.getlist('images')
        product_title = request.data.get('product_title', '').strip()
        is_update = request.data.get('is_update', 'false').lower() == 'true'
        
        if not images:
            return Response({'error': 'No images provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate image count
        if len(images) > 10:  # Limit to 10 images per upload
            return Response({'error': 'Too many images. Maximum 10 allowed.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate image sizes (5MB limit)
        max_size = 10 * 1024 * 1024  # 5MB in bytes
        for i, image in enumerate(images):
            if image.size > max_size:
                return Response({
                    'error': f'Image {i + 1} is too large. Maximum size is 10MB.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate file type
            allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
            if image.content_type not in allowed_types:
                return Response({
                    'error': f'Image {i + 1} has invalid format. Only JPEG, PNG, and WebP are allowed.'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Upload images to Cloudflare R2
        upload_results = cloudflare_r2.upload_multiple_images(images, folder='products', product_title=product_title, update_tag=is_update)
        
        # Check for upload errors
        failed_uploads = [result for result in upload_results if not result.get('success')]
        if failed_uploads:
            return Response({
                'error': 'Some images failed to upload',
                'details': failed_uploads
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Extract URLs from successful uploads
        uploaded_urls = [result['url'] for result in upload_results if result.get('success')]
        
        return Response({
            'success': True,
            'message': f'Successfully uploaded {len(uploaded_urls)} images',
            'urls': uploaded_urls,
            'count': len(uploaded_urls)
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        print(f"Error in upload_product_images: {e}")
        return Response({
            'error': 'Internal server error',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def upload_single_image(request):
    """Upload a single image to Cloudflare R2"""
    try:
        # Check if user is authenticated
        user_id = request.headers.get('X-User-ID')
        user_role = request.headers.get('X-User-Role', 'user')
        
        if not user_id:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check if user has permission
        if user_role not in ['admin', 'user']:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get image and product title from request
        image = request.FILES.get('image')
        product_title = request.data.get('product_title', '').strip()
        
        if not image:
            return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate image size (5MB limit)
        max_size = 10 * 1024 * 1024  # 5MB in bytes
        if image.size > max_size:
            return Response({
                'error': 'Image is too large. Maximum size is 10MB.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate file type
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if image.content_type not in allowed_types:
            return Response({
                'error': 'Invalid image format. Only JPEG, PNG, and WebP are allowed.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Upload image to Cloudflare R2
        upload_result = cloudflare_r2.upload_image(image, folder='products', product_title=product_title)
        
        if not upload_result.get('success'):
            return Response({
                'error': 'Failed to upload image',
                'details': upload_result.get('error')
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'success': True,
            'message': 'Image uploaded successfully',
            'url': upload_result['url'],
            'filename': upload_result['filename']
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        print(f"Error in upload_single_image: {e}")
        return Response({
            'error': 'Internal server error',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def upload_profile_picture(request):
    """Upload a profile picture to Cloudflare R2"""
    try:
        # Check if user is authenticated
        user_id = request.headers.get('X-User-ID')
        user_role = request.headers.get('X-User-Role', 'user')
        
        if not user_id:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check if user has permission
        if user_role not in ['admin', 'user']:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get image from request
        image = request.FILES.get('image')
        folder = request.data.get('folder', 'profile-pictures')
        
        if not image:
            return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate image size (10MB limit)
        max_size = 10 * 1024 * 1024  # 10MB in bytes
        if image.size > max_size:
            return Response({
                'error': 'Image is too large. Maximum size is 10MB.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate file type
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if image.content_type not in allowed_types:
            return Response({
                'error': 'Invalid image format. Only JPEG, PNG, and WebP are allowed.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Upload image to Cloudflare R2 with user-specific naming
        upload_result = cloudflare_r2.upload_image(
            image, 
            folder=folder, 
            product_title=f"user_{user_id}",
            optimize=True
        )
        
        if not upload_result.get('success'):
            return Response({
                'error': 'Failed to upload profile picture',
                'details': upload_result.get('error')
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'success': True,
            'message': 'Profile picture uploaded successfully',
            'url': upload_result['url'],
            'filename': upload_result['filename']
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        print(f"Error in upload_profile_picture: {e}")
        return Response({
            'error': 'Internal server error',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['DELETE'])
def delete_image(request):
    """Delete an image from Cloudflare R2"""
    try:
        # Check if user is authenticated
        user_id = request.headers.get('X-User-ID')
        user_role = request.headers.get('X-User-Role', 'user')
        
        if not user_id:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Only admins can delete images
        if user_role != 'admin':
            return Response({'error': 'Admin permission required'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get image URL from request
        image_url = request.data.get('url')
        if not image_url:
            return Response({'error': 'No image URL provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Delete image from Cloudflare R2
        delete_result = cloudflare_r2.delete_image(image_url)
        
        if not delete_result.get('success'):
            return Response({
                'error': 'Failed to delete image',
                'details': delete_result.get('error')
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'success': True,
            'message': 'Image deleted successfully'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f"Error in delete_image: {e}")
        return Response({
            'error': 'Internal server error',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Payment Processing Endpoints

@csrf_exempt
@require_http_methods(["POST"])
def create_payment_intent(request):
    """Create a Stripe payment intent"""
    try:
        data = json.loads(request.body)
        amount = data.get('amount')
        currency = data.get('currency', 'usd')
        
        if not amount:
            return JsonResponse({'error': 'Amount is required'}, status=400)
        
        # Create payment intent
        intent = stripe.PaymentIntent.create(
            amount=amount,
            currency=currency,
            automatic_payment_methods={
                'enabled': True,
            },
        )
        
        return JsonResponse({
            'client_secret': intent.client_secret
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def send_order_confirmation(request):
    """Send order confirmation email"""
    try:
        data = json.loads(request.body)
        order_id = data.get('orderId')
        order_data = data.get('orderData')
        user_email = data.get('userEmail')
        
        if not user_email:
            return JsonResponse({'error': 'User email is required'}, status=400)
        
        # Create email content
        subject = f'Order Confirmation - Order #{order_id}'
        
        # Calculate total
        total = 0
        for item in order_data.get('cartItems', []):
            price = float(item.get('price', 0))
            quantity = int(item.get('quantity', 1))
            total += price * quantity
        
        # Add tax
        tax = total * 0.13
        total_with_tax = total + tax
        
        # Email template
        html_message = f"""
        <html>
        <body>
            <h2>Order Confirmation</h2>
            <p>Thank you for your order! Your order has been confirmed and is being processed.</p>
            
            <h3>Order Details:</h3>
            <p><strong>Order ID:</strong> {order_id}</p>
            <p><strong>Order Date:</strong> {order_data.get('orderDate', 'N/A')}</p>
            
            <h3>Items Ordered:</h3>
            <ul>
        """
        
        for item in order_data.get('cartItems', []):
            html_message += f"""
                <li>{item.get('name', 'N/A')} - Quantity: {item.get('quantity', 1)} - ${item.get('price', 0)}</li>
            """
        
        html_message += f"""
            </ul>
            
            <h3>Billing Address:</h3>
            <p>{order_data.get('billingInfo', {}).get('line1', 'N/A')}</p>
            <p>{order_data.get('billingInfo', {}).get('line2', '')}</p>
            <p>{order_data.get('billingInfo', {}).get('city', 'N/A')}, {order_data.get('billingInfo', {}).get('state', 'N/A')} {order_data.get('billingInfo', {}).get('zip', 'N/A')}</p>
            
            <h3>Shipping Address:</h3>
            <p>{order_data.get('shippingInfo', {}).get('line1', 'N/A')}</p>
            <p>{order_data.get('shippingInfo', {}).get('line2', '')}</p>
            <p>{order_data.get('shippingInfo', {}).get('city', 'N/A')}, {order_data.get('shippingInfo', {}).get('state', 'N/A')} {order_data.get('shippingInfo', {}).get('zip', 'N/A')}</p>
            
            <h3>Order Summary:</h3>
            <p><strong>Subtotal:</strong> ${total:.2f}</p>
            <p><strong>Tax (13%):</strong> ${tax:.2f}</p>
            <p><strong>Total:</strong> ${total_with_tax:.2f}</p>
            
            <p>We'll send you tracking information once your order ships.</p>
            
            <p>Thank you for shopping with us!</p>
        </body>
        </html>
        """
        
        # Send email
        send_mail(
            subject=subject,
            message='',  # Plain text version
            from_email=os.getenv('DEFAULT_FROM_EMAIL', 'noreply@yourstore.com'),
            recipient_list=[user_email],
            html_message=html_message,
            fail_silently=False,
        )
        
        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def send_welcome_email(request):
    """Send welcome email to new user"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method allowed'}, status=405)
    
    try:
        data = json.loads(request.body)
        user_email = data.get('userEmail')
        display_name = data.get('displayName', '')
        
        if not user_email:
            return JsonResponse({'error': 'User email is required'}, status=400)
        
        # Send welcome email
        success = EmailService.send_welcome_email(user_email, display_name)
        
        if success:
            return JsonResponse({'message': 'Welcome email sent successfully'})
        else:
            return JsonResponse({'error': 'Failed to send welcome email'}, status=500)
            
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def send_verification_reminder(request):
    """Send email verification reminder"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method allowed'}, status=405)
    
    try:
        data = json.loads(request.body)
        user_email = data.get('userEmail')
        display_name = data.get('displayName', '')
        
        if not user_email:
            return JsonResponse({'error': 'User email is required'}, status=400)
        
        # Send verification reminder
        success = EmailService.send_verification_reminder_email(user_email, display_name)
        
        if success:
            return JsonResponse({'message': 'Verification reminder sent successfully'})
        else:
            return JsonResponse({'error': 'Failed to send verification reminder'}, status=500)
            
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def update_stock_after_order(request):
    """Update product stock after successful order completion"""
    try:
        data = json.loads(request.body)
        order_items = data.get('orderItems', [])
        
        if not order_items:
            return JsonResponse({'error': 'No order items provided'}, status=400)
        
        updated_products = []
        failed_updates = []
        
        for item in order_items:
            product_id = item.get('productId')
            quantity = item.get('quantity', 1)
            
            if not product_id or quantity <= 0:
                failed_updates.append({
                    'productId': product_id,
                    'error': 'Invalid product ID or quantity'
                })
                continue
            
            try:
                # Get the product
                product = Product.objects.get(id=product_id)
                
                # Check if sufficient stock is available
                if product.stock < quantity:
                    failed_updates.append({
                        'productId': product_id,
                        'productName': product.title,
                        'requestedQuantity': quantity,
                        'availableStock': product.stock,
                        'error': 'Insufficient stock'
                    })
                    continue
                
                # Update stock
                product.stock -= quantity
                product.save(update_fields=['stock', 'updated_at'])
                
                updated_products.append({
                    'productId': product_id,
                    'productName': product.title,
                    'quantitySold': quantity,
                    'remainingStock': product.stock
                })
                
            except Product.DoesNotExist:
                failed_updates.append({
                    'productId': product_id,
                    'error': 'Product not found'
                })
            except Exception as e:
                failed_updates.append({
                    'productId': product_id,
                    'error': f'Update failed: {str(e)}'
                })
        
        # Prepare response
        response_data = {
            'success': True,
            'updatedProducts': updated_products,
            'failedUpdates': failed_updates,
            'totalUpdated': len(updated_products),
            'totalFailed': len(failed_updates)
        }
        
        # If all updates failed, return error status
        if len(updated_products) == 0 and len(failed_updates) > 0:
            return JsonResponse(response_data, status=400)
        
        return JsonResponse(response_data)
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    except Exception as e:
        return JsonResponse({'error': f'Server error: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def webhook(request):
    """Handle Stripe webhooks"""
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, os.getenv('STRIPE_WEBHOOK_SECRET')
        )
    except ValueError as e:
        return JsonResponse({'error': 'Invalid payload'}, status=400)
    except stripe.error.SignatureVerificationError as e:
        return JsonResponse({'error': 'Invalid signature'}, status=400)
    
    # Handle the event
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        # Handle successful payment
        print(f"Payment succeeded: {payment_intent['id']}")
    elif event['type'] == 'payment_intent.payment_failed':
        payment_intent = event['data']['object']
        # Handle failed payment
        print(f"Payment failed: {payment_intent['id']}")
    
    return JsonResponse({'success': True})

# Newsletter Views
@api_view(['POST'])
def subscribe_newsletter(request):
    """Subscribe to newsletter"""
    try:
        data = request.data
        email = data.get('email', '').strip().lower()
        subscription_source = data.get('source', 'footer')
        user_id = request.headers.get('X-User-ID', '')
        
        if not email:
            return Response({'error': 'Email address is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create subscription data
        subscription_data = {
            'email': email,
            'subscription_source': subscription_source,
            'user_id': user_id if user_id else None,
            'preferences': data.get('preferences', {})
        }
        
        serializer = NewsletterSubscriptionSerializer(data=subscription_data)
        
        if serializer.is_valid():
            subscription = serializer.save()
            
            # Send welcome email for newsletter (with delay if welcome email was recently sent)
            try:
                EmailService.send_newsletter_welcome_email_delayed(email, delay_minutes=2)
            except Exception as e:
                print(f"Failed to send newsletter welcome email: {e}")
                # Don't fail the subscription if email fails
            
            return Response({
                'message': 'Successfully subscribed to newsletter',
                'subscription': NewsletterSubscriptionSerializer(subscription).data
            }, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def unsubscribe_newsletter(request):
    """Unsubscribe from newsletter"""
    try:
        data = request.data
        email = data.get('email', '').strip().lower()
        
        if not email:
            return Response({'error': 'Email address is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            subscription = NewsletterSubscription.objects.get(email=email)
            subscription.unsubscribe()
            
            return Response({
                'message': 'Successfully unsubscribed from newsletter'
            }, status=status.HTTP_200_OK)
            
        except NewsletterSubscription.DoesNotExist:
            return Response({
                'error': 'Email address not found in our newsletter list'
            }, status=status.HTTP_404_NOT_FOUND)
            
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def check_newsletter_subscription(request):
    """Check if email is subscribed to newsletter"""
    try:
        email = request.GET.get('email', '').strip().lower()
        
        if not email:
            return Response({'error': 'Email address is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            subscription = NewsletterSubscription.objects.get(email=email)
            return Response({
                'is_subscribed': subscription.is_active,
                'subscribed_at': subscription.subscribed_at,
                'unsubscribed_at': subscription.unsubscribed_at
            }, status=status.HTTP_200_OK)
            
        except NewsletterSubscription.DoesNotExist:
            return Response({
                'is_subscribed': False
            }, status=status.HTTP_200_OK)
            
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_newsletter_subscribers(request):
    """Get all newsletter subscribers (admin only)"""
    try:
        # Check if user is admin
        user_role = request.headers.get('X-User-Role', 'user')
        if user_role != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        active_only = request.GET.get('active_only', 'true').lower() == 'true'
        
        if active_only:
            subscribers = NewsletterSubscription.objects.filter(is_active=True)
        else:
            subscribers = NewsletterSubscription.objects.all()
        
        serializer = NewsletterSubscriptionSerializer(subscribers, many=True)
        
        return Response({
            'subscribers': serializer.data,
            'total_count': subscribers.count(),
            'active_count': NewsletterSubscription.objects.filter(is_active=True).count()
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def admin_unsubscribe_newsletter(request):
    """Admin unsubscribe from newsletter (admin only)"""
    try:
        # Check if user is admin
        user_role = request.headers.get('X-User-Role', 'user')
        if user_role != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

        data = request.data
        email = data.get('email', '').strip().lower()

        if not email:
            return Response({'error': 'Email address is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            subscription = NewsletterSubscription.objects.get(email=email)
            subscription.unsubscribe()

            return Response({
                'message': f'Successfully unsubscribed {email} from newsletter'
            }, status=status.HTTP_200_OK)

        except NewsletterSubscription.DoesNotExist:
            return Response({
                'error': 'Email address not found in our newsletter list'
            }, status=status.HTTP_404_NOT_FOUND)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def send_newsletter_to_subscriber(request):
    """Send newsletter to specific subscriber (admin only)"""
    try:
        # Check if user is admin
        user_role = request.headers.get('X-User-Role', 'user')
        if user_role != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

        data = request.data
        email = data.get('email', '').strip().lower()
        subject = data.get('subject', '').strip()
        content = data.get('content', '').strip()
        is_html = data.get('is_html', True)

        if not email:
            return Response({'error': 'Email address is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not subject:
            return Response({'error': 'Subject is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not content:
            return Response({'error': 'Content is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Get the subscriber
            subscription = NewsletterSubscription.objects.get(email=email)
            
            if not subscription.is_active:
                return Response({
                    'error': 'Subscriber is not active. Cannot send newsletter to unsubscribed users.'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Send newsletter email
            success = EmailService.send_newsletter_email(subject, content, [subscription], is_html)
            
            if success:
                return Response({
                    'message': f'Newsletter sent successfully to {email}'
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': 'Failed to send newsletter email'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except NewsletterSubscription.DoesNotExist:
            return Response({
                'error': 'Email address not found in our newsletter list'
            }, status=status.HTTP_404_NOT_FOUND)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
