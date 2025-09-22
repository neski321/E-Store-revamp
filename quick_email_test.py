#!/usr/bin/env python3
"""
Quick email test - update the credentials below and run
"""

import smtplib
from email.mime.text import MIMEText

def test_gmail():
    # UPDATE THESE WITH YOUR CREDENTIALS
    EMAIL = "your-gmail@gmail.com"  # Replace with your Gmail
    PASSWORD = "your-app-password"  # Replace with your App Password
    TO_EMAIL = "your-test-email@gmail.com"  # Replace with test email
    
    print("🧪 Testing Gmail SMTP Connection")
    print("=" * 40)
    print(f"From: {EMAIL}")
    print(f"To: {TO_EMAIL}")
    print()
    
    try:
        # Create SMTP connection
        print("🔌 Connecting to Gmail SMTP...")
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(EMAIL, PASSWORD)
        print("✅ Successfully connected to Gmail!")
        
        # Create test email
        msg = MIMEText("""
        This is a test email from your e-commerce application.
        
        If you receive this email, your Gmail SMTP setup is working correctly!
        
        You can now use these credentials in your Django application.
        """)
        
        msg['Subject'] = "Test Email from E-Commerce App"
        msg['From'] = EMAIL
        msg['To'] = TO_EMAIL
        
        # Send email
        print("📧 Sending test email...")
        server.send_message(msg)
        server.quit()
        
        print(f"✅ Test email sent successfully to {TO_EMAIL}!")
        print("📬 Check your inbox (and spam folder)")
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("⚠️  IMPORTANT: Update the credentials in this file first!")
    print("Edit quick_email_test.py and replace:")
    print("- your-gmail@gmail.com")
    print("- your-app-password") 
    print("- your-test-email@gmail.com")
    print()
    
    # Check if credentials are still default
    with open(__file__, 'r') as f:
        content = f.read()
        if "your-gmail@gmail.com" in content:
            print("❌ Please update the credentials in the file first!")
            exit(1)
    
    test_gmail()
