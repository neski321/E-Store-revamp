# backend/products/views.py

import stripe
import os
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.mail import send_mail
from django.template.loader import render_to_string
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Product
from .serializers import ProductSerializer, ReviewSerializer
import json

# Configure Stripe
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

@api_view(['GET'])
def product_list(request):
    """Get all products with optional filtering"""
    products = Product.objects.all()
    
    # Apply filters
    category = request.GET.get('category')
    if category:
        products = products.filter(category=category)
    
    min_price = request.GET.get('min_price')
    if min_price:
        products = products.filter(price__gte=min_price)
    
    max_price = request.GET.get('max_price')
    if max_price:
        products = products.filter(price__lte=max_price)
    
    search = request.GET.get('search')
    if search:
        products = products.filter(title__icontains=search)
    
    # Apply ordering
    sort_by = request.GET.get('sort', 'title')
    if sort_by in ['price', '-price', 'rating', '-rating', 'created_at', '-created_at']:
        products = products.order_by(sort_by)
    else:
        products = products.order_by('title')
    
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

@api_view(['GET'])
def product_detail(request, pk):
    """Get a specific product by ID"""
    try:
        product = Product.objects.get(pk=pk)
        serializer = ProductSerializer(product)
        return Response(serializer.data)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def categories(request):
    """Get all available categories"""
    categories = Product.objects.values_list('category', flat=True).distinct()
    return Response(list(categories))

@api_view(['POST'])
def add_review(request, product_id):
    """Add a review to a product"""
    try:
        product = Product.objects.get(pk=product_id)
        serializer = ReviewSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(product=product)
            
            # Update product rating
            product.update_average_rating()
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

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
