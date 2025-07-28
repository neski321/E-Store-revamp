# products/management/commands/populate_products.py

import requests
from django.core.management.base import BaseCommand
from products.models import Product, Review, Dimension
from datetime import datetime

class Command(BaseCommand):
    help = 'Populate the database with products from the dummy JSON URL'

    def handle(self, *args, **kwargs):
        url = 'https://dummyjson.com/products?limit=0'
        response = requests.get(url)
        data = response.json()

        products = data.get('products', [])

        for item in products:
            # Create or update Product
            product, created = Product.objects.update_or_create(
                title=item['title'],
                category=item['category'],
                defaults={
                    'id': item['id'],
                    'price': item['price'],
                    'thumbnail': item['thumbnail'],
                    'images': item['images'],
                    'description': item['description'],
                    'availability_status': item['availabilityStatus'],
                    'discount_percentage': item['discountPercentage'],
                    'warranty_information': item['warrantyInformation'],
                    'stock': item['stock'],
                    'weight': item['weight'],
                    'rating': item['rating'],
                    'brand': item.get('brand', ''),
                    'sku': item['sku'],
                    'shipping_information': item['shippingInformation'],
                    'minimum_order_quantity': item['minimumOrderQuantity'],
                    'return_policy': item['returnPolicy'],
                }
            )

            # Create or update Dimensions
            dimensions_data = item.get('dimensions', {})
            if dimensions_data:
                dimension, dim_created = Dimension.objects.update_or_create(
                    product=product,
                    defaults={
                        'width': dimensions_data.get('width', 0),
                        'height': dimensions_data.get('height', 0),
                        'depth': dimensions_data.get('depth', 0),
                    }
                )

            # Create or update Reviews
            reviews_data = item.get('reviews', [])
            for review_data in reviews_data:
                review_date = datetime.strptime(review_data['date'], '%Y-%m-%dT%H:%M:%S.%fZ')
                review, review_created = Review.objects.update_or_create(
                    product=product,
                    rating=review_data['rating'],
                    comment=review_data['comment'],
                    date=review_date,
                    reviewer_name=review_data['reviewerName'],
                    reviewer_email=review_data['reviewerEmail'],
                )

            if created:
                self.stdout.write(self.style.SUCCESS(f"Created product: {product.title}"))
            else:
                self.stdout.write(self.style.WARNING(f"Updated product: {product.title}"))

