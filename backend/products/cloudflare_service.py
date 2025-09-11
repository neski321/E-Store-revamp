# products/cloudflare_service.py

import boto3
import os
import uuid
from datetime import datetime
from PIL import Image
import io
from django.conf import settings
from botocore.exceptions import ClientError

class CloudflareR2Service:
    def __init__(self):
        self.access_key_id = os.getenv('CLOUDFLARE_R2_ACCESS_KEY_ID')
        self.secret_access_key = os.getenv('CLOUDFLARE_R2_SECRET_ACCESS_KEY')
        self.bucket_name = os.getenv('CLOUDFLARE_R2_BUCKET_NAME')
        self.account_id = os.getenv('CLOUDFLARE_R2_ACCOUNT_ID')
        self.public_url = os.getenv('CLOUDFLARE_R2_PUBLIC_URL')
        
        # Check if all required environment variables are set
        self.is_configured = all([self.access_key_id, self.secret_access_key, self.bucket_name, self.account_id, self.public_url])
        
        if not self.is_configured:
            print("Warning: Cloudflare R2 not configured. Please set the following environment variables:")
            print("- CLOUDFLARE_R2_ACCESS_KEY_ID")
            print("- CLOUDFLARE_R2_SECRET_ACCESS_KEY") 
            print("- CLOUDFLARE_R2_BUCKET_NAME")
            print("- CLOUDFLARE_R2_ACCOUNT_ID")
            print("- CLOUDFLARE_R2_PUBLIC_URL")
            self.s3_client = None
            return
        
        # Initialize S3 client for R2
        try:
            self.s3_client = boto3.client(
                's3',
                endpoint_url=f'https://{self.account_id}.r2.cloudflarestorage.com',
                aws_access_key_id=self.access_key_id,
                aws_secret_access_key=self.secret_access_key,
                region_name='auto'
            )
        except Exception as e:
            print(f"Error initializing Cloudflare R2 client: {e}")
            self.s3_client = None
    
    def generate_unique_filename(self, original_filename, folder='products'):
        """Generate a unique filename for the uploaded file"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        unique_id = str(uuid.uuid4())[:8]
        file_extension = os.path.splitext(original_filename)[1].lower()
        return f"{folder}/{timestamp}_{unique_id}{file_extension}"
    
    def optimize_image(self, image_file, max_width=1200, max_height=1200, quality=85):
        """Optimize image for web delivery"""
        try:
            # Open image
            image = Image.open(image_file)
            
            # Convert to RGB if necessary
            if image.mode in ('RGBA', 'LA', 'P'):
                image = image.convert('RGB')
            
            # Resize if too large
            if image.width > max_width or image.height > max_height:
                image.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
            
            # Save optimized image to bytes
            output = io.BytesIO()
            image.save(output, format='JPEG', quality=quality, optimize=True)
            output.seek(0)
            
            return output
        except Exception as e:
            print(f"Error optimizing image: {e}")
            return image_file
    
    def upload_image(self, image_file, folder='products', optimize=True):
        """Upload an image to Cloudflare R2"""
        if not self.is_configured or not self.s3_client:
            return {
                'success': False,
                'error': 'Cloudflare R2 not configured. Please set environment variables.'
            }
        
        try:
            # Generate unique filename
            filename = self.generate_unique_filename(image_file.name, folder)
            
            # Optimize image if requested
            if optimize:
                image_data = self.optimize_image(image_file)
            else:
                image_data = image_file
            
            # Upload to R2
            self.s3_client.upload_fileobj(
                image_data,
                self.bucket_name,
                filename,
                ExtraArgs={
                    'ContentType': 'image/jpeg',
                    'CacheControl': 'max-age=31536000',  # 1 year cache
                    'ACL': 'public-read'
                }
            )
            
            # Return public URL
            public_url = f"{self.public_url}/{filename}"
            return {
                'success': True,
                'url': public_url,
                'filename': filename,
                'bucket': self.bucket_name
            }
            
        except ClientError as e:
            print(f"Error uploading to R2: {e}")
            return {
                'success': False,
                'error': str(e)
            }
        except Exception as e:
            print(f"Unexpected error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def upload_multiple_images(self, image_files, folder='products'):
        """Upload multiple images to Cloudflare R2"""
        if not self.is_configured or not self.s3_client:
            return [{
                'success': False,
                'error': 'Cloudflare R2 not configured. Please set environment variables.'
            }] * len(image_files)
        
        results = []
        for image_file in image_files:
            result = self.upload_image(image_file, folder)
            results.append(result)
        return results
    
    def delete_image(self, filename):
        """Delete an image from Cloudflare R2"""
        if not self.is_configured or not self.s3_client:
            return {
                'success': False,
                'error': 'Cloudflare R2 not configured. Please set environment variables.'
            }
        
        try:
            # Extract filename from URL if full URL is provided
            if filename.startswith('http'):
                filename = filename.split('/')[-1]
            
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=filename
            )
            return {'success': True}
        except ClientError as e:
            print(f"Error deleting from R2: {e}")
            return {'success': False, 'error': str(e)}
    
    def list_images(self, folder='products', max_keys=100):
        """List images in a folder"""
        if not self.is_configured or not self.s3_client:
            return {
                'success': False,
                'error': 'Cloudflare R2 not configured. Please set environment variables.'
            }
        
        try:
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=f"{folder}/",
                MaxKeys=max_keys
            )
            
            images = []
            if 'Contents' in response:
                for obj in response['Contents']:
                    images.append({
                        'key': obj['Key'],
                        'url': f"{self.public_url}/{obj['Key']}",
                        'size': obj['Size'],
                        'last_modified': obj['LastModified']
                    })
            
            return {'success': True, 'images': images}
        except ClientError as e:
            print(f"Error listing images: {e}")
            return {'success': False, 'error': str(e)}

# Global instance
cloudflare_r2 = CloudflareR2Service()
