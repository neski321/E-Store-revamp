from django.core.management.base import BaseCommand
from products.models import Review

class Command(BaseCommand):
    help = 'Fix existing reviews by setting reviewer_id for reviews that have None'

    def handle(self, *args, **options):
        # Get all reviews with None reviewer_id
        reviews_without_owner = Review.objects.filter(reviewer_id__isnull=True)
        
        self.stdout.write(f'Found {reviews_without_owner.count()} reviews without reviewer_id')
        
        # Set a default reviewer_id for these reviews
        # This allows them to be managed by admins
        default_reviewer_id = 'legacy_review'
        
        updated_count = 0
        for review in reviews_without_owner:
            review.reviewer_id = default_reviewer_id
            review.save()
            updated_count += 1
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully updated {updated_count} reviews with default reviewer_id')
        )
        
        # Show some examples
        sample_reviews = Review.objects.filter(reviewer_id=default_reviewer_id)[:3]
        for review in sample_reviews:
            self.stdout.write(f'  - Review {review.id}: {review.comment[:50]}... by {review.reviewer_id}')
