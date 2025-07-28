# products/management/commands/clear_database.py
from django.core.management.base import BaseCommand
from django.db import connection

class Command(BaseCommand):
    help = 'Clear the entire database by dropping all tables'

    def handle(self, *args, **kwargs):
        with connection.cursor() as cursor:
            cursor.execute("SELECT tablename FROM pg_tables WHERE schemaname = 'public';")
            tables = cursor.fetchall()
            
            for table in tables:
                cursor.execute(f"DROP TABLE IF EXISTS {table[0]} CASCADE;")
                self.stdout.write(self.style.SUCCESS(f'Dropped table: {table[0]}'))

        self.stdout.write(self.style.SUCCESS('Successfully cleared the database'))
