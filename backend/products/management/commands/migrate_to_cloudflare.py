# products/management/commands/migrate_to_cloudflare.py

from django.core.management.base import BaseCommand
from products.models import Product
from products.cloudflare_service import cloudflare_r2
import requests
import os
from urllib.parse import urlparse

class Command(BaseCommand):
    help = 'Migrate existing product images to Cloudflare R2'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be migrated without actually doing it',
        )
        parser.add_argument(
            '--limit',
            type=int,
            default=10,
            help='Limit number of products to process (default: 10)',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        limit = options['limit']
        
        self.stdout.write(
            self.style.SUCCESS(f'Starting migration to Cloudflare R2...')
        )
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING('DRY RUN MODE - No actual changes will be made')
            )
        
        # Get products with existing images
        products = Product.objects.filter(
            thumbnail__isnull=False
        ).exclude(
            thumbnail='XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
        )[:limit]
        
        self.stdout.write(f'Found {products.count()} products to process')
        
        migrated_count = 0
        error_count = 0
        
        for product in products:
            try:
                self.stdout.write(f'Processing product: {product.title}')
                
                # Process thumbnail
                if product.thumbnail and not product.thumbnail.startswith('http'):
                    self.stdout.write(f'  Skipping thumbnail (not a URL): {product.thumbnail}')
                elif product.thumbnail and not self.is_cloudflare_url(product.thumbnail):
                    if not dry_run:
                        new_thumbnail = self.migrate_image(product.thumbnail, f'products/{product.id}/thumbnail')
                        if new_thumbnail:
                            product.thumbnail = new_thumbnail
                            self.stdout.write(f'  ✅ Migrated thumbnail: {new_thumbnail}')
                        else:
                            self.stdout.write(f'  ❌ Failed to migrate thumbnail')
                    else:
                        self.stdout.write(f'  [DRY RUN] Would migrate thumbnail: {product.thumbnail}')
                
                # Process images JSON
                if product.images and isinstance(product.images, dict):
                    new_images = {}
                    for key, image_url in product.images.items():
                        if isinstance(image_url, str) and not self.is_cloudflare_url(image_url):
                            if not dry_run:
                                new_url = self.migrate_image(image_url, f'products/{product.id}/images/{key}')
                                if new_url:
                                    new_images[key] = new_url
                                    self.stdout.write(f'  ✅ Migrated image {key}: {new_url}')
                                else:
                                    new_images[key] = image_url  # Keep original if migration fails
                                    self.stdout.write(f'  ❌ Failed to migrate image {key}')
                            else:
                                self.stdout.write(f'  [DRY RUN] Would migrate image {key}: {image_url}')
                                new_images[key] = image_url
                        else:
                            new_images[key] = image_url
                    
                    if not dry_run:
                        product.images = new_images
                
                # Save product if not dry run
                if not dry_run:
                    product.save()
                    migrated_count += 1
                    self.stdout.write(f'  ✅ Saved product: {product.title}')
                else:
                    self.stdout.write(f'  [DRY RUN] Would save product: {product.title}')
                
            except Exception as e:
                error_count += 1
                self.stdout.write(
                    self.style.ERROR(f'  ❌ Error processing {product.title}: {str(e)}')
                )
        
        # Summary
        self.stdout.write('\n' + '='*50)
        if dry_run:
            self.stdout.write(
                self.style.SUCCESS(f'DRY RUN COMPLETE: Would migrate {migrated_count} products')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(f'MIGRATION COMPLETE: Migrated {migrated_count} products')
            )
        
        if error_count > 0:
            self.stdout.write(
                self.style.ERROR(f'Errors encountered: {error_count}')
            )
    
    def is_cloudflare_url(self, url):
        """Check if URL is already a Cloudflare URL"""
        if not url or not isinstance(url, str):
            return False
        return 'cloudflare' in url.lower() or 'r2.dev' in url.lower()
    
    def migrate_image(self, image_url, folder_path):
        """Download and upload image to Cloudflare R2"""
        try:
            # Download image
            response = requests.get(image_url, timeout=30)
            response.raise_for_status()
            
            # Create a file-like object
            from io import BytesIO
            image_file = BytesIO(response.content)
            image_file.name = os.path.basename(urlparse(image_url).path) or 'image.jpg'
            
            # Upload to Cloudflare R2
            result = cloudflare_r2.upload_image(image_file, folder=folder_path, optimize=True)
            
            if result.get('success'):
                return result['url']
            else:
                self.stdout.write(f'    Upload failed: {result.get("error")}')
                return None
                
        except Exception as e:
            self.stdout.write(f'    Migration failed: {str(e)}')
            return None
