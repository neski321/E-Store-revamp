# products/management/commands/create_initial_categories.py

from django.core.management.base import BaseCommand
from products.models import Product

class Command(BaseCommand):
    help = 'Create initial categories by adding sample products'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be created without actually doing it',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        initial_categories = [
            'Electronics',
            'Clothing',
            'Home & Garden',
            'Sports & Fitness',
            'Books & Media',
            'Toys & Games',
            'Beauty & Personal Care',
            'Automotive',
            'Health & Wellness',
            'Food & Beverage',
            'Office Supplies',
            'Pet Supplies'
        ]
        
        self.stdout.write(
            self.style.SUCCESS(f'Creating initial categories...')
        )
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING('DRY RUN MODE - No actual changes will be made')
            )
        
        created_count = 0
        
        for category in initial_categories:
            # Check if category already exists
            existing_products = Product.objects.filter(category=category).exists()
            
            if not existing_products:
                if not dry_run:
                    # Create a placeholder product to establish the category
                    Product.objects.create(
                        title=f'Sample {category} Product',
                        description=f'This is a placeholder product to establish the {category} category.',
                        category=category,
                        price=0.01,
                        stock=0,
                        brand='System',
                        sku=f'SAMPLE-{category.upper().replace(" ", "-")}',
                        weight=0.1,
                        availability_status='Discontinued',
                        thumbnail='https://via.placeholder.com/150',
                        images={}
                    )
                    created_count += 1
                    self.stdout.write(f'  ✅ Created category: {category}')
                else:
                    self.stdout.write(f'  [DRY RUN] Would create category: {category}')
            else:
                self.stdout.write(f'  ⏭️  Category already exists: {category}')
        
        # Summary
        self.stdout.write('\n' + '='*50)
        if dry_run:
            self.stdout.write(
                self.style.SUCCESS(f'DRY RUN COMPLETE: Would create {len(initial_categories)} categories')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(f'COMPLETE: Created {created_count} new categories')
            )
        
        self.stdout.write(
            self.style.WARNING('Note: These are placeholder products. You can delete them after creating real products in these categories.')
        )
