# products/views.py

from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q, Avg, Count
from django.db import models
from django.core.cache import cache
from .models import Product, Review
from .serializers import ProductSerializer, ReviewSerializer, ReviewModerationSerializer, DimensionSerializer
from django.http import JsonResponse

class ProductPagination(PageNumberPagination):
    page_size = 12  # Show 12 products per page
    page_size_query_param = 'page_size'
    max_page_size = 50

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    pagination_class = ProductPagination

    def get_queryset(self):
        queryset = Product.objects.select_related().prefetch_related('reviews', 'dimensions')

        # Filter by specific IDs
        ids_param = self.request.query_params.get('ids', None)
        if ids_param:
            try:
                ids_list = [int(id.strip()) for id in ids_param.split(',') if id.strip()]
                if ids_list:
                    queryset = queryset.filter(id__in=ids_list)
                    # Preserve the order of IDs as provided
                    preserved = models.Case(*[models.When(pk=pk, then=pos) for pos, pk in enumerate(ids_list)])
                    queryset = queryset.order_by(preserved)
                    return queryset
            except (ValueError, TypeError):
                pass

        # Search by title or other parameters
        search_query = self.request.query_params.get('search', None)
        if search_query:
            search_type = self.request.query_params.get('type', 'regular')
            if search_type == 'regular':
                queryset = queryset.filter(Q(title__icontains=search_query))
            elif search_type == 'advanced':
                queryset = queryset.filter(
                    Q(title__icontains=search_query) |
                    Q(description__icontains=search_query) |
                    Q(category__icontains=search_query) |
                    Q(brand__icontains=search_query)
                )

        # Title filter (specific product title search)
        title_filter = self.request.query_params.get('title', None)
        if title_filter:
            queryset = queryset.filter(title__icontains=title_filter)

        # Category filtering
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)

        # Brand filtering
        brand = self.request.query_params.get('brand', None)
        if brand:
            queryset = queryset.filter(brand__icontains=brand)

        # Price range filtering
        min_price = self.request.query_params.get('min_price', None)
        max_price = self.request.query_params.get('max_price', None)
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        # Rating filtering
        min_rating = self.request.query_params.get('min_rating', None)
        max_rating = self.request.query_params.get('max_rating', None)
        if min_rating:
            queryset = queryset.filter(rating__gte=min_rating)
        if max_rating:
            queryset = queryset.filter(rating__lte=max_rating)

        # Stock filtering
        in_stock = self.request.query_params.get('in_stock', None)
        if in_stock == 'true':
            queryset = queryset.filter(stock__gt=0)

        # Discount filtering
        has_discount = self.request.query_params.get('has_discount', None)
        if has_discount == 'true':
            queryset = queryset.filter(discount_percentage__gt=0)

        # Sorting
        sort_by = self.request.query_params.get('sort', 'id')
        order = self.request.query_params.get('order', 'desc')
        
        if sort_by in ['price', 'rating', 'title', 'id', 'created_at', 'stock']:
            if order == 'desc':
                queryset = queryset.order_by(f'-{sort_by}')
            else:
                queryset = queryset.order_by(sort_by)

        return queryset

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured products (first 8 products)"""
        featured_products = self.get_queryset()[:8]
        serializer = self.get_serializer(featured_products, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Get all available categories"""
        categories = Product.objects.values_list('category', flat=True).distinct()
        return Response(list(categories))

    @action(detail=False, methods=['get'])
    def brands(self, request):
        """Get all available brands"""
        brands = Product.objects.values_list('brand', flat=True).distinct()
        return Response(list(brands))

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get product statistics"""
        total_products = Product.objects.count()
        categories_count = Product.objects.values('category').distinct().count()
        avg_price = Product.objects.aggregate(avg_price=models.Avg('price'))
        avg_rating = Product.objects.aggregate(avg_rating=models.Avg('rating'))
        
        return Response({
            'total_products': total_products,
            'categories_count': categories_count,
            'avg_price': avg_price['avg_price'],
            'avg_rating': avg_rating['avg_rating']
        })

    @action(detail=True, methods=['get'])
    def reviews(self, request, pk=None):
        """Get reviews for a specific product"""
        try:
            product = self.get_object()
            reviews = product.reviews.filter(status='approved').order_by('-date')
            
            # Filter by rating
            min_rating = request.query_params.get('min_rating', None)
            if min_rating:
                reviews = reviews.filter(rating__gte=min_rating)
            
            # Sort reviews
            sort_by = request.query_params.get('sort', 'date')
            order = request.query_params.get('order', 'desc')
            
            if sort_by in ['date', 'rating', 'helpful_votes']:
                if order == 'desc':
                    reviews = reviews.order_by(f'-{sort_by}')
                else:
                    reviews = reviews.order_by(sort_by)
            
            serializer = ReviewSerializer(reviews, many=True)
            return Response(serializer.data)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def add_review(self, request, pk=None):
        """Add a review to a product"""
        try:
            product = self.get_object()
            review_data = request.data.copy()
            
            serializer = ReviewSerializer(data=review_data)
            if serializer.is_valid():
                # Save the review with the product instance
                review = serializer.save(product=product)
                # Update product rating
                product.update_average_rating()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def vote_review(self, request, pk=None):
        """Vote on a review (helpful/not helpful)"""
        try:
            product = self.get_object()
            review_id = request.data.get('review_id')
            is_helpful = request.data.get('is_helpful', True)
            
            try:
                review = product.reviews.get(id=review_id)
                if is_helpful:
                    review.helpful_votes += 1
                review.total_votes += 1
                review.save()
                
                return Response({
                    'helpful_votes': review.helpful_votes,
                    'total_votes': review.total_votes
                })
            except Review.DoesNotExist:
                return Response({'error': 'Review not found'}, status=status.HTTP_404_NOT_FOUND)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def restricted_view(request):
    return JsonResponse({"message": "This is a restricted view"})

@api_view(['POST'])
def add_product(request):
    serializer = ProductSerializer(data=request.data)
    if serializer.is_valid():
        product = serializer.save()
        
        # product_url = request.build_absolute_uri(f'/products/{product.id}/')
        
        # Handling reviews if provided
        reviews_data = request.data.get('reviews', [])
        for review_data in reviews_data:
            review_data['product'] = product.id
            review_serializer = ReviewSerializer(data=review_data)
            if review_serializer.is_valid():
                review_serializer.save()
        
        # Handling dimensions if provided
        dimensions_data = request.data.get('dimensions', {})
        if dimensions_data:
            dimensions_data['product'] = product.id
            dimension_serializer = DimensionSerializer(data=dimensions_data)
            if dimension_serializer.is_valid():
                dimension_serializer.save()
        
        return Response({
            'product_url': f'/products/{product.id}/',
            'product': serializer.data
        }, status=status.HTTP_201_CREATED)
    else:
        print("Validation Errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
def update_product(request, pk):
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    serializer = ProductSerializer(product, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH'])
def update_product_partial(request, pk):
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    # Use partial=True to allow partial updates
    serializer = ProductSerializer(product, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Review moderation endpoints
@api_view(['GET'])
def pending_reviews(request):
    """Get all pending reviews for moderation"""
    reviews = Review.objects.filter(status='pending').order_by('-created_at')
    serializer = ReviewModerationSerializer(reviews, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def moderate_review(request, review_id):
    """Moderate a review (approve/reject)"""
    try:
        review = Review.objects.get(id=review_id)
        new_status = request.data.get('status')
        
        if new_status in ['approved', 'rejected']:
            review.status = new_status
            review.save()
            
            # Update product rating if approved
            if new_status == 'approved':
                review.product.update_average_rating()
            
            return Response({'message': f'Review {new_status}'})
        else:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
    except Review.DoesNotExist:
        return Response({'error': 'Review not found'}, status=status.HTTP_404_NOT_FOUND)

def server_status(request):
    return JsonResponse({"status": "ok"})
