#!/usr/bin/env python3
"""
Quick Gmail connection test
Use this to test your Gmail credentials
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def test_gmail_connection():
    print("🧪 Testing Gmail SMTP Connection")
    print("=" * 40)
    
    # Get credentials from user
    email = input("Enter your Gmail address: ").strip()
    password = input("Enter your Gmail password (or App Password): ").strip()
    test_email = input("Enter email to send test to: ").strip()
    
    if not all([email, password, test_email]):
        print("❌ All fields are required")
        return False
    
    try:
        print("\n🔌 Connecting to Gmail SMTP...")
        
        # Create SMTP connection
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()  # Enable TLS encryption
        server.login(email, password)
        
        print("✅ Successfully connected to Gmail!")
        
        # Create test email
        msg = MIMEMultipart()
        msg['From'] = email
        msg['To'] = test_email
        msg['Subject'] = "Test Email from E-Commerce App"
        
        body = """
        This is a test email from your e-commerce application.
        
        If you receive this email, your Gmail SMTP setup is working correctly!
        
        You can now use these credentials in your Django application.
        """
        
        msg.attach(MIMEText(body, 'plain'))
        
        # Send email
        print("📧 Sending test email...")
        server.send_message(msg)
        server.quit()
        
        print(f"✅ Test email sent successfully to {test_email}!")
        print("📬 Check your inbox (and spam folder)")
        
        return True
        
    except smtplib.SMTPAuthenticationError:
        print("❌ Authentication failed!")
        print("Possible solutions:")
        print("1. Make sure 2-Factor Authentication is enabled")
        print("2. Use App Password instead of regular password")
        print("3. Enable 'Less Secure Apps' (temporary)")
        return False
        
    except smtplib.SMTPException as e:
        print(f"❌ SMTP Error: {e}")
        return False
        
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    success = test_gmail_connection()
    
    if success:
        print("\n🎉 Gmail SMTP is working!")
        print("You can now use these credentials in your Django app.")
    else:
        print("\n❌ Gmail SMTP test failed.")
        print("Please check your credentials and try again.")
