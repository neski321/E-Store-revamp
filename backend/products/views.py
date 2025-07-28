# products/views.py

from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from django.db import models
from django.core.cache import cache
from .models import Product
from .serializers import ProductSerializer, ReviewSerializer, DimensionSerializer
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
                    Q(price__icontains=search_query)
                )

        # Category filtering
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)

        # Price range filtering
        min_price = self.request.query_params.get('min_price', None)
        max_price = self.request.query_params.get('max_price', None)
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        # Rating filtering
        min_rating = self.request.query_params.get('min_rating', None)
        if min_rating:
            queryset = queryset.filter(rating__gte=min_rating)

        # Stock filtering
        in_stock = self.request.query_params.get('in_stock', None)
        if in_stock == 'true':
            queryset = queryset.filter(stock__gt=0)

        # Sorting
        sort_by = self.request.query_params.get('sort', 'id')
        order = self.request.query_params.get('order', 'desc')
        
        if sort_by in ['price', 'rating', 'title', 'id']:
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

def server_status(request):
    return JsonResponse({'status': 'Server is running fine'})

@api_view(['GET'])
def restricted_view(request):
    if request.user_role != 'admin':
        return Response({'error': 'Forbidden'}, status=403)
    return Response({'message': 'Welcome, admin!'})

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
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = ProductSerializer(product, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    else:
        # Debug: Print the errors in the console
        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['PATCH'])
def update_product_partial(request, pk):
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

    # Use partial=True to allow partial updates
    serializer = ProductSerializer(product, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
