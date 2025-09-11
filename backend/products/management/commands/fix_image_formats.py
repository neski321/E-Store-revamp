from django.core.management.base import BaseCommand
from products.models import Product

class Command(BaseCommand):
    help = 'Fix image formats in products - convert object format to array format'

    def handle(self, *args, **options):
        # Get all products with images
        products_with_images = Product.objects.filter(images__isnull=False).exclude(images={})
        
        self.stdout.write(f'Found {products_with_images.count()} products with images')
        
        updated_count = 0
        for product in products_with_images:
            images = product.images
            
            # Check if images are in object format (like {image_1: 'url1', image_2: 'url2'})
            if isinstance(images, dict) and not isinstance(images, list):
                # Convert object format to array format
                image_urls = []
                for key, value in images.items():
                    if isinstance(value, str) and value.startswith('http'):
                        image_urls.append(value)
                
                if image_urls:
                    product.images = image_urls
                    product.save()
                    updated_count += 1
                    self.stdout.write(f'  - Updated product {product.id}: {product.title}')
                    self.stdout.write(f'    Images: {len(image_urls)} URLs converted to array format')
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully updated {updated_count} products to use array format for images')
        )
        
        # Show some examples
        sample_products = Product.objects.filter(images__isnull=False).exclude(images={})[:3]
        for product in sample_products:
            if isinstance(product.images, list):
                self.stdout.write(f'  - Product {product.id}: {product.title} - {len(product.images)} images (array format)')
            else:
                self.stdout.write(f'  - Product {product.id}: {product.title} - {len(product.images)} images (object format)')
