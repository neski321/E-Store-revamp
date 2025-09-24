"""
Email service for sending various types of emails
"""
import os
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.core.cache import cache
import logging
from .text_to_html_converter import TextToHtmlConverter

logger = logging.getLogger(__name__)

class EmailService:
    # Email timing configuration
    WELCOME_EMAIL_COOLDOWN = 10  # minutes
    NEWSLETTER_EMAIL_COOLDOWN = 10  # minutes
    NEWSLETTER_DELAY_AFTER_WELCOME = 2  # minutes
    
    @staticmethod
    def _should_send_email(email, email_type, cooldown_minutes=5):
        """Check if we should send an email to prevent spam/duplicates"""
        cache_key = f"email_sent_{email_type}_{email}"
        if cache.get(cache_key):
            logger.info(f"Email {email_type} to {email} skipped - recently sent")
            return False
        return True
    
    @staticmethod
    def _mark_email_sent(email, email_type, cooldown_minutes=5):
        """Mark that an email was sent to prevent duplicates"""
        cache_key = f"email_sent_{email_type}_{email}"
        cache.set(cache_key, True, timeout=cooldown_minutes * 60)
        logger.info(f"Email {email_type} to {email} marked as sent")
    
    @staticmethod
    def _should_delay_newsletter_email(email):
        """Check if we should delay newsletter email due to recent welcome email"""
        welcome_key = f"email_sent_welcome_{email}"
        if cache.get(welcome_key):
            logger.info(f"Newsletter email to {email} delayed - welcome email recently sent")
            return True
        return False
    
    @staticmethod
    def send_newsletter_welcome_email_delayed(user_email, delay_minutes=None):
        """Send newsletter welcome email with delay if welcome email was recently sent"""
        if delay_minutes is None:
            delay_minutes = EmailService.NEWSLETTER_DELAY_AFTER_WELCOME
            
        if EmailService._should_delay_newsletter_email(user_email):
            # Schedule the email to be sent after delay
            import threading
            import time
            
            def delayed_send():
                time.sleep(delay_minutes * 60)  # Convert minutes to seconds
                EmailService.send_newsletter_welcome_email(user_email)
            
            thread = threading.Thread(target=delayed_send)
            thread.daemon = True
            thread.start()
            logger.info(f"Newsletter welcome email to {user_email} scheduled for {delay_minutes} minutes delay")
            return True
        else:
            return EmailService.send_newsletter_welcome_email(user_email)
    
    @staticmethod
    def send_welcome_email(user_email, display_name=None):
        """Send welcome email to new user"""
        try:
            # Check if we should send this email (prevent duplicates)
            if not EmailService._should_send_email(user_email, 'welcome', EmailService.WELCOME_EMAIL_COOLDOWN):
                logger.info(f"Welcome email to {user_email} skipped - recently sent")
                return True  # Return True to not break the signup flow
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
                        
                        <div class="features" style="background: #f0f8ff; border-left: 4px solid #667eea; margin: 20px 0;">
                            <h3>📧 Stay Updated with Our Newsletter</h3>
                            <p>Want to be the first to know about new products, exclusive deals, and special offers? Subscribe to our newsletter from the footer of our website!</p>
                            <p style="font-size: 14px; color: #666;">You can subscribe anytime by visiting our website and using the newsletter signup form in the footer.</p>
                        </div>
                        
                        <p>If you have any questions, feel free to contact our support team.</p>
                        
                        <div class="footer">
                            <p>Best regards,<br>The E-Store Team</p>
                            <p>This email was sent to {user_email}</p>
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
            
            📧 Stay Updated with Our Newsletter
            Want to be the first to know about new products, exclusive deals, and special offers? 
            Subscribe to our newsletter from the footer of our website! You can subscribe anytime 
            by visiting our website and using the newsletter signup form in the footer.
            
            If you have any questions, feel free to contact our support team.
            
            Best regards,
            The E-Store Team
            
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
            
            # Mark email as sent to prevent duplicates
            EmailService._mark_email_sent(user_email, 'welcome', EmailService.WELCOME_EMAIL_COOLDOWN)
            
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
    
    @staticmethod
    def send_newsletter_welcome_email(user_email):
        """Send newsletter welcome email using template if available"""
        try:
            # Check if we should send this email (prevent duplicates)
            if not EmailService._should_send_email(user_email, 'newsletter_welcome', EmailService.NEWSLETTER_EMAIL_COOLDOWN):
                logger.info(f"Newsletter welcome email to {user_email} skipped - recently sent")
                return True  # Return True to not break the subscription flow
            
            # Try to use template first
            try:
                from .models import EmailTemplate
                template = EmailTemplate.objects.filter(
                    template_type='welcome',
                    is_active=True,
                    is_default=True
                ).first()
                
                if template:
                    # Use template with variable replacement
                    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
                    variables = {
                        'email': user_email,
                        'name': 'Valued Customer',  # Default name
                        'company': 'E-Store',
                        'website': frontend_url,
                        'login_url': f'{frontend_url}/login',
                        'unsubscribe_url': f'{frontend_url}/unsubscribe',
                        'support_email': 'support@yourstore.com',
                        'shop_url': f'{frontend_url}/products'
                    }
                    subject = template.subject.replace('{email}', user_email)
                    
                    # If template has enhanced plain text, convert it to HTML
                    if template.plain_text_content and template.plain_text_content.strip():
                        html_content = TextToHtmlConverter.convert_to_html(template.plain_text_content, variables)
                        plain_text_content = template.plain_text_content
                    else:
                        html_content = template.html_content.replace('{email}', user_email)
                        plain_text_content = ""
                
                    # Send email with template content
                    from django.core.mail import EmailMultiAlternatives
                    msg = EmailMultiAlternatives(
                        subject=subject,
                        body=plain_text_content,
                        from_email=os.getenv('DEFAULT_FROM_EMAIL', 'noreply@yourstore.com'),
                        to=[user_email],
                        headers={
                            'List-Unsubscribe': f'<mailto:unsubscribe@yourstore.com?subject=Unsubscribe>',
                            'X-Mailer': 'E-Store Newsletter System',
                            'Reply-To': 'newsletter@yourstore.com'
                        }
                    )
                    msg.attach_alternative(html_content, "text/html")
                    msg.send()
                    
                    # Increment template usage count
                    template.increment_usage()
                    
                    # Mark email as sent to prevent duplicates
                    EmailService._mark_email_sent(user_email, 'newsletter_welcome', EmailService.NEWSLETTER_EMAIL_COOLDOWN)
                    
                    logger.info(f"Newsletter welcome email sent successfully to {user_email} using template")
                    return True
                    
            except Exception as template_error:
                logger.warning(f"Failed to use template for welcome email: {template_error}")
                # Fall back to hardcoded template
            
            # Fallback to hardcoded template
            subject = 'Welcome to our Newsletter! 🎉'
            
            html_message = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                    .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                    .button {{ display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                    .feature {{ background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #667eea; }}
                    .footer {{ margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Welcome to Our Newsletter!</h1>
                        <p>You're now part of our exclusive community</p>
                    </div>
                    <div class="content">
                        <h2>Thank you for subscribing!</h2>
                        <p>We're excited to have you join our newsletter community. You'll be the first to know about:</p>
                        
                        <div class="feature">
                            <h3>🛍️ New Product Launches</h3>
                            <p>Get early access to our latest products and exclusive previews.</p>
                        </div>
                        
                        <div class="feature">
                            <h3>💰 Exclusive Discounts</h3>
                            <p>Special offers and member-only deals that you won't find anywhere else.</p>
                        </div>
                        
                        <div class="feature">
                            <h3>📰 Industry Insights</h3>
                            <p>Tips, trends, and behind-the-scenes content from our team.</p>
                        </div>
                        
                        <div class="feature">
                            <h3>🎁 Surprise Perks</h3>
                            <p>Occasional freebies, contests, and special member benefits.</p>
                        </div>
                        
                        <p>We promise to keep our emails valuable and never spam you. You can unsubscribe at any time.</p>
                        
                        <a href="{os.getenv('FRONTEND_URL', 'http://localhost:3000')}" class="button">
                            Start Shopping Now
                        </a>
                        
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
            
            text_message = f"""
            Welcome to Our Newsletter! 🎉
            
            Thank you for subscribing to our newsletter! We're excited to have you join our community.
            
            You'll be the first to know about:
            - New Product Launches: Get early access to our latest products
            - Exclusive Discounts: Special offers and member-only deals
            - Industry Insights: Tips, trends, and behind-the-scenes content
            - Surprise Perks: Occasional freebies, contests, and special benefits
            
            We promise to keep our emails valuable and never spam you. You can unsubscribe at any time.
            
            Start shopping: {os.getenv('FRONTEND_URL', 'http://localhost:3000')}
            
            Best regards,
            The E-Store Team
            
            This email was sent to {user_email}
            Unsubscribe: {os.getenv('FRONTEND_URL', 'http://localhost:3000')}/unsubscribe?email={user_email}
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
                    'X-Mailer': 'E-Store Newsletter System',
                    'Reply-To': 'newsletter@yourstore.com'
                }
            )
            msg.attach_alternative(html_message, "text/html")
            msg.send()
            
            # Mark email as sent to prevent duplicates
            EmailService._mark_email_sent(user_email, 'newsletter_welcome', EmailService.NEWSLETTER_EMAIL_COOLDOWN)
            
            logger.info(f"Newsletter welcome email sent successfully to {user_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send newsletter welcome email to {user_email}: {str(e)}")
            return False
    
    @staticmethod
    def send_newsletter_email(subject, content, subscribers, is_html=True):
        """Send newsletter email to multiple subscribers"""
        try:
            if not subscribers:
                logger.warning("No subscribers provided for newsletter")
                return False
            
            # Prepare recipient list
            recipient_list = [sub.email for sub in subscribers if sub.is_active]
            
            if not recipient_list:
                logger.warning("No active subscribers found")
                return False
            
            # Send email with proper headers
            from django.core.mail import EmailMultiAlternatives
            
            msg = EmailMultiAlternatives(
                subject=subject,
                body=content if not is_html else "Please view this email in HTML format.",
                from_email=os.getenv('DEFAULT_FROM_EMAIL', 'noreply@yourstore.com'),
                to=recipient_list,
                headers={
                    'List-Unsubscribe': f'<mailto:unsubscribe@yourstore.com?subject=Unsubscribe>',
                    'X-Mailer': 'E-Store Newsletter System',
                    'Reply-To': 'newsletter@yourstore.com'
                }
            )
            
            if is_html:
                msg.attach_alternative(content, "text/html")
            
            msg.send()
            
            logger.info(f"Newsletter sent successfully to {len(recipient_list)} subscribers")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send newsletter: {str(e)}")
            return False