# products/management/commands/remove_products.py
from django.core.management.base import BaseCommand
from products.models import Product

class Command(BaseCommand):
    help = 'Remove all products from the database'

    def handle(self, *args, **kwargs):
        products_count = Product.objects.all().count()
        Product.objects.all().delete()
        self.stdout.write(self.style.SUCCESS(f'Successfully removed {products_count} products'))
