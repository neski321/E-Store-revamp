from django.core.management.base import BaseCommand
from products.models import Product
import random

class Command(BaseCommand):
    help = 'Fix product images by only updating products with invalid images'

    def handle(self, *args, **options):
        # Categories and their corresponding image themes
        category_images = {
            'electronics': [
                'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=300&fit=crop',
                'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=300&h=300&fit=crop',
                'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop',
            ],
            'clothing': [
                'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=300&fit=crop',
                'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop',
                'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=300&h=300&fit=crop',
            ],
            'groceries': [
                'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=300&fit=crop',
                'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop',
                'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop',
            ],
            'home': [
                'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop',
                'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=300&h=300&fit=crop',
                'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&h=300&fit=crop',
            ],
            'sports': [
                'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop',
                'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=300&fit=crop',
                'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=300&h=300&fit=crop',
            ],
            'books': [
                'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=300&fit=crop',
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
                'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=300&fit=crop',
            ],
            'automotive': [
                'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=300&h=300&fit=crop',
                'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=300&h=300&fit=crop',
                'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=300&h=300&fit=crop',
            ],
            'health': [
                'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=300&h=300&fit=crop',
                'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=300&fit=crop',
                'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop',
            ],
        }

        products = Product.objects.all()
        updated_count = 0
        skipped_count = 0

        for product in products:
            # Check if the product has a valid image
            has_valid_image = (
                product.thumbnail and 
                product.thumbnail != 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' and
                not product.thumbnail.startswith('https://via.placeholder.com') and
                not product.thumbnail.startswith('https://picsum.photos')
            )

            if has_valid_image:
                # Skip products that already have valid images
                skipped_count += 1
                continue

            # Get category-specific images or default images
            category = product.category.lower()
            if category in category_images:
                images = category_images[category]
            else:
                # Default images for unknown categories
                images = [
                    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=300&fit=crop',
                    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop',
                    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop',
                ]

            # Update thumbnail and images
            product.thumbnail = random.choice(images)
            product.images = images
            
            product.save()
            updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully updated {updated_count} products with realistic images\n'
                f'Skipped {skipped_count} products that already had valid images'
            )
        ) 