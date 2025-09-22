#!/usr/bin/env python3
"""
Test script for email functionality
Run this to test your email setup before deploying
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
django.setup()

from products.email_service import EmailService

def test_email_setup():
    """Test email configuration"""
    print("🧪 Testing Email Configuration...")
    
    # Check environment variables
    required_vars = [
        'EMAIL_HOST',
        'EMAIL_HOST_USER', 
        'EMAIL_HOST_PASSWORD',
        'DEFAULT_FROM_EMAIL'
    ]
    
    missing_vars = []
    for var in required_vars:
        value = os.getenv(var)
        if not value:
            missing_vars.append(var)
        else:
            # Mask sensitive info
            if 'PASSWORD' in var:
                print(f"✅ {var}: {'*' * len(value)}")
            else:
                print(f"✅ {var}: {value}")
    
    if missing_vars:
        print(f"\n❌ Missing environment variables: {', '.join(missing_vars)}")
        print("\n📋 Required environment variables:")
        print("EMAIL_HOST=smtp.gmail.com")
        print("EMAIL_PORT=587")
        print("EMAIL_USE_TLS=True")
        print("EMAIL_HOST_USER=your-gmail@gmail.com")
        print("EMAIL_HOST_PASSWORD=your-16-digit-app-password")
        print("DEFAULT_FROM_EMAIL=your-gmail@gmail.com")
        print("\n🔐 To get Gmail App Password:")
        print("1. Enable 2-Factor Authentication on Gmail")
        print("2. Go to Google Account Settings → Security → App passwords")
        print("3. Generate password for 'Mail'")
        return False
    
    print("\n🎯 All email configuration variables found!")
    return True

def test_send_welcome_email():
    """Test sending welcome email"""
    print("\n📧 Testing Welcome Email...")
    
    # Use a test email (replace with your email for testing)
    test_email = input("Enter your email address for testing: ").strip()
    test_name = input("Enter your name (optional): ").strip() or "Test User"
    
    if not test_email:
        print("❌ Email address is required for testing")
        return False
    
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

def test_send_verification_reminder():
    """Test sending verification reminder email"""
    print("\n📧 Testing Verification Reminder Email...")
    
    test_email = input("Enter your email address for testing: ").strip()
    test_name = input("Enter your name (optional): ").strip() or "Test User"
    
    if not test_email:
        print("❌ Email address is required for testing")
        return False
    
    try:
        success = EmailService.send_verification_reminder_email(test_email, test_name)
        if success:
            print(f"✅ Verification reminder sent successfully to {test_email}!")
            print("📬 Check your inbox (and spam folder)")
            return True
        else:
            print("❌ Failed to send verification reminder")
            return False
    except Exception as e:
        print(f"❌ Error sending email: {str(e)}")
        return False

def main():
    """Main test function"""
    print("🚀 Email Service Test Suite")
    print("=" * 50)
    
    # Test configuration
    if not test_email_setup():
        print("\n❌ Email configuration test failed!")
        print("Please set up the required environment variables and try again.")
        return
    
    # Test welcome email
    if test_send_welcome_email():
        print("\n🎉 Welcome email test passed!")
    else:
        print("\n❌ Welcome email test failed!")
        return
    
    # Ask if user wants to test verification reminder
    test_reminder = input("\nWould you like to test verification reminder email? (y/n): ").strip().lower()
    if test_reminder == 'y':
        if test_send_verification_reminder():
            print("\n🎉 Verification reminder test passed!")
        else:
            print("\n❌ Verification reminder test failed!")
    
    print("\n✅ Email service testing completed!")
    print("\n📋 Next steps:")
    print("1. If tests passed, your email setup is ready!")
    print("2. Deploy to Railway with the same environment variables")
    print("3. Test the signup flow on your deployed app")

if __name__ == "__main__":
    main()
