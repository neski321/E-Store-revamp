from django.core.management.base import BaseCommand
from products.models import Product
from products.cloudflare_service import cloudflare_r2

class Command(BaseCommand):
    help = 'Test image deletion process to verify both database and Cloudflare are updated'

    def handle(self, *args, **options):
        # Get a product with images
        product = Product.objects.filter(images__isnull=False).exclude(images={}).first()
        
        if not product:
            self.stdout.write(self.style.ERROR('No products with images found'))
            return
        
        self.stdout.write(f'Testing with product {product.id}: {product.title}')
        self.stdout.write(f'Current images: {product.images}')
        
        if isinstance(product.images, list) and len(product.images) > 0:
            # Test direct image deletion from Cloudflare
            image_url = product.images[0]
            filename = image_url.split('/')[-1]
            
            self.stdout.write(f'Testing deletion of: {filename}')
            
            # Delete from Cloudflare
            delete_result = cloudflare_r2.delete_image(image_url)
            self.stdout.write(f'Cloudflare deletion result: {delete_result}')
            
            if delete_result.get('success'):
                # Update database to remove the image
                remaining_images = product.images[1:]  # Remove first image
                product.images = remaining_images
                product.save()
                
                self.stdout.write(f'Updated database. Remaining images: {product.images}')
                self.stdout.write(self.style.SUCCESS('Image deletion test completed successfully!'))
            else:
                self.stdout.write(self.style.ERROR(f'Failed to delete from Cloudflare: {delete_result.get("error")}'))
        else:
            self.stdout.write(self.style.ERROR('Product images are not in expected format'))
