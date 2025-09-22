"""
Email service for sending various types of emails
"""
import os
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class EmailService:
    @staticmethod
    def send_welcome_email(user_email, display_name=None):
        """Send welcome email to new user"""
        try:
            subject = 'Welcome to E-Store - Account Created'
            
            # Create personalized greeting
            greeting = f"Hi {display_name}!" if display_name else "Hi there!"
            
            # HTML email template
            html_message = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Welcome!</title>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                    .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                    .button {{ display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                    .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 12px; }}
                    .features {{ background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }}
                    .feature-item {{ margin: 10px 0; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to E-Store!</h1>
                        <p>Your account has been created successfully</p>
                    </div>
                    
                    <div class="content">
                        <h2>{greeting}</h2>
                        <p>Thank you for joining our e-commerce platform! We're excited to have you as part of our community.</p>
                        
                        <div class="features">
                            <h3>What you can do now:</h3>
                            <div class="feature-item">🛍️ <strong>Browse Products:</strong> Explore our wide range of products</div>
                            <div class="feature-item">💝 <strong>Add to Favorites:</strong> Save your favorite items</div>
                            <div class="feature-item">🛒 <strong>Secure Checkout:</strong> Enjoy safe and secure shopping</div>
                            <div class="feature-item">📱 <strong>Mobile Friendly:</strong> Shop from any device</div>
                            <div class="feature-item">💬 <strong>Reviews:</strong> Share your experience with other customers</div>
                        </div>
                        
                        <p>Ready to start shopping? Click the button below to explore our products!</p>
                        
                        <a href="{os.getenv('FRONTEND_URL', 'http://localhost:3000')}" class="button">
                            Start Shopping Now
                        </a>
                        
                        <p>If you have any questions, feel free to contact our support team.</p>
                        
                        <div class="footer">
                            <p>Best regards,<br>The E-Store Team</p>
                            <p>This email was sent to {user_email}</p>
                            <p><a href="{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/unsubscribe?email={user_email}" style="color: #666; font-size: 11px;">Unsubscribe</a></p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Plain text version
            text_message = f"""
            Welcome to Our E-Commerce Store!
            
            {greeting}
            
            Thank you for joining our e-commerce platform! We're excited to have you as part of our community.
            
            What you can do now:
            - Browse Products: Explore our wide range of products
            - Add to Favorites: Save your favorite items
            - Secure Checkout: Enjoy safe and secure shopping
            - Mobile Friendly: Shop from any device
            - Reviews: Share your experience with other customers
            
            Ready to start shopping? Visit: {os.getenv('FRONTEND_URL', 'http://localhost:3000')}
            
            If you have any questions, feel free to contact our support team.
            
            Best regards,
            The E-Commerce Team
            
            This email was sent to {user_email}
            """
            
            # Send email with proper headers
            from django.core.mail import EmailMultiAlternatives
            
            msg = EmailMultiAlternatives(
                subject=subject,
                body=text_message,
                from_email=os.getenv('DEFAULT_FROM_EMAIL', 'noreply@yourstore.com'),
                to=[user_email],
                headers={
                    'List-Unsubscribe': f'<mailto:unsubscribe@yourstore.com?subject=Unsubscribe>',
                    'X-Mailer': 'E-Store System',
                    'Reply-To': 'support@yourstore.com'
                }
            )
            msg.attach_alternative(html_message, "text/html")
            msg.send()
            
            logger.info(f"Welcome email sent successfully to {user_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send welcome email to {user_email}: {str(e)}")
            return False
    
    @staticmethod
    def send_verification_reminder_email(user_email, display_name=None):
        """Send email verification reminder"""
        try:
            subject = 'Please verify your email address'
            
            greeting = f"Hi {display_name}!" if display_name else "Hi there!"
            
            html_message = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: #667eea; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                    .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                    .button {{ display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Email Verification Required</h1>
                    </div>
                    <div class="content">
                        <h2>{greeting}</h2>
                        <p>Thank you for signing up! To complete your account setup, please verify your email address.</p>
                        <p>Verifying your email helps us:</p>
                        <ul>
                            <li>Secure your account</li>
                            <li>Send you important updates</li>
                            <li>Help recover your account if needed</li>
                        </ul>
                        <p>Please check your email for a verification link, or try signing in again to resend the verification email.</p>
                        <a href="{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/login" class="button">
                            Go to Login
                        </a>
                    </div>
                </div>
            </body>
            </html>
            """
            
            text_message = f"""
            Email Verification Required
            
            {greeting}
            
            Thank you for signing up! To complete your account setup, please verify your email address.
            
            Verifying your email helps us:
            - Secure your account
            - Send you important updates
            - Help recover your account if needed
            
            Please check your email for a verification link, or try signing in again to resend the verification email.
            
            Go to login: {os.getenv('FRONTEND_URL', 'http://localhost:3000')}/login
            """
            
            send_mail(
                subject=subject,
                message=text_message,
                from_email=os.getenv('DEFAULT_FROM_EMAIL', 'noreply@yourstore.com'),
                recipient_list=[user_email],
                html_message=html_message,
                fail_silently=False,
            )
            
            logger.info(f"Verification reminder email sent to {user_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send verification reminder to {user_email}: {str(e)}")
            return False
