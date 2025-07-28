from django.core.management.base import BaseCommand
from products.models import Product
import random

class Command(BaseCommand):
    help = 'Restore appropriate images based on product categories and titles'

    def handle(self, *args, **options):
        # Map product titles/categories to appropriate images
        product_image_mapping = {
            # Water and beverages
            'water': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop',
            'bottle': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop',
            'drink': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop',
            'beverage': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop',
            
            # Food items
            'bread': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=300&fit=crop',
            'milk': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&h=300&fit=crop',
            'cheese': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=300&h=300&fit=crop',
            'apple': 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=300&fit=crop',
            'banana': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=300&fit=crop',
            'orange': 'https://images.unsplash.com/photo-1547514701-42782101795e?w=300&h=300&fit=crop',
            'tomato': 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=300&h=300&fit=crop',
            'potato': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300&h=300&fit=crop',
            'carrot': 'https://images.unsplash.com/photo-1447175008436-1701707fdd98?w=300&h=300&fit=crop',
            'lettuce': 'https://images.unsplash.com/photo-1622205313162-be1d57166791?w=300&h=300&fit=crop',
            'cucumber': 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=300&h=300&fit=crop',
            'onion': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300&h=300&fit=crop',
            'garlic': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300&h=300&fit=crop',
            'rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=300&fit=crop',
            'pasta': 'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=300&h=300&fit=crop',
            'chicken': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=300&h=300&fit=crop',
            'beef': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=300&h=300&fit=crop',
            'fish': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=300&h=300&fit=crop',
            'egg': 'https://images.unsplash.com/photo-1569288063648-5d8453b604a4?w=300&h=300&fit=crop',
            'butter': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&h=300&fit=crop',
            'oil': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
            'sugar': 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=300&h=300&fit=crop',
            'salt': 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=300&h=300&fit=crop',
            'flour': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=300&fit=crop',
            
            # Electronics
            'laptop': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=300&fit=crop',
            'computer': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=300&fit=crop',
            'phone': 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=300&h=300&fit=crop',
            'smartphone': 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=300&h=300&fit=crop',
            'tablet': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop',
            'headphone': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
            'camera': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&h=300&fit=crop',
            'tv': 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=300&h=300&fit=crop',
            'television': 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=300&h=300&fit=crop',
            
            # Clothing
            'shirt': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=300&fit=crop',
            'pants': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop',
            'dress': 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=300&h=300&fit=crop',
            'shoes': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop',
            'jacket': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop',
            'hat': 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=300&h=300&fit=crop',
            'socks': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop',
            
            # Home items
            'chair': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop',
            'table': 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=300&h=300&fit=crop',
            'lamp': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&h=300&fit=crop',
            'sofa': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&h=300&fit=crop',
            'bed': 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=300&h=300&fit=crop',
            'mirror': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&h=300&fit=crop',
            'vase': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&h=300&fit=crop',
            
            # Sports
            'ball': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop',
            'basketball': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=300&fit=crop',
            'football': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=300&h=300&fit=crop',
            'tennis': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=300&fit=crop',
            'golf': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=300&h=300&fit=crop',
            'yoga': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=300&h=300&fit=crop',
            'gym': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=300&h=300&fit=crop',
            
            # Books
            'book': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=300&fit=crop',
            'novel': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
            'magazine': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=300&fit=crop',
            'dictionary': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=300&fit=crop',
            
            # Automotive
            'car': 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=300&h=300&fit=crop',
            'tire': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=300&h=300&fit=crop',
            'battery': 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=300&h=300&fit=crop',
            'oil': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
            
            # Health
            'vitamin': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=300&h=300&fit=crop',
            'medicine': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=300&fit=crop',
            'bandage': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop',
            'toothpaste': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=300&fit=crop',
            'soap': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=300&fit=crop',
            'shampoo': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=300&fit=crop',
        }

        # Category-specific default images
        category_defaults = {
            'groceries': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=300&fit=crop',
            'electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=300&fit=crop',
            'clothing': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=300&fit=crop',
            'home': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop',
            'sports': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop',
            'books': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=300&fit=crop',
            'automotive': 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=300&h=300&fit=crop',
            'health': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=300&h=300&fit=crop',
        }

        products = Product.objects.all()
        updated_count = 0

        for product in products:
            # Try to find a matching image based on product title
            title_lower = product.title.lower()
            category_lower = product.category.lower()
            
            # Look for exact matches in product title
            matched_image = None
            for keyword, image_url in product_image_mapping.items():
                if keyword in title_lower:
                    matched_image = image_url
                    break
            
            # If no match found, use category default
            if not matched_image:
                matched_image = category_defaults.get(category_lower, 
                    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=300&fit=crop')
            
            # Update the product
            product.thumbnail = matched_image
            product.images = [matched_image]  # Use the same image for all slots for now
            
            product.save()
            updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(f'Successfully updated {updated_count} products with appropriate images')
        ) 