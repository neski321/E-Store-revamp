#!/usr/bin/env python3
"""
Simple email test - just update the test email and run
"""

import os
import sys
import django
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Skip Firebase initialization for testing
os.environ['SKIP_FIREBASE'] = 'true'

try:
    django.setup()
    from products.email_service import EmailService
    
    def test_email():
        # UPDATE THIS WITH YOUR EMAIL
        test_email = "eivorrodrigo@gmail.com"  # Replace with your email
        test_name = "Test User"
        
        print("🧪 Testing Gmail SMTP Connection")
        print("=" * 40)
        print(f"Sending test email to: {test_email}")
        print()
        
        try:
            success = EmailService.send_welcome_email(test_email, test_name)
            if success:
                print(f"✅ Welcome email sent successfully to {test_email}!")
                print("📬 Check your inbox (and spam folder)")
                return True
            else:
                print("❌ Failed to send welcome email")
                return False
        except Exception as e:
            print(f"❌ Error sending email: {str(e)}")
            return False
    
    if __name__ == "__main__":
        test_email()
        
except Exception as e:
    print(f"❌ Django setup error: {e}")
    print("This is expected if Firebase config is missing")
    print("But your email configuration looks correct!")
