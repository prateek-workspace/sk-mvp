"""Cloudinary service for image uploads"""
import os
import cloudinary
import cloudinary.uploader
from fastapi import UploadFile, HTTPException
from typing import Optional

# Configure Cloudinary (these should be in .env)
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME", ""),
    api_key=os.getenv("CLOUDINARY_API_KEY", ""),
    api_secret=os.getenv("CLOUDINARY_API_SECRET", ""),
)


class CloudinaryService:
    """Service for handling image uploads to Cloudinary"""
    
    @staticmethod
    async def upload_image(
        file: UploadFile,
        folder: str = "prephub",
        max_size_mb: int = 5
    ) -> dict:
        """
        Upload an image to Cloudinary
        
        Args:
            file: The uploaded file
            folder: Cloudinary folder to store the image
            max_size_mb: Maximum file size in MB
            
        Returns:
            dict: Contains url, public_id, and other metadata
        """
        # Validate file type
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read file content
        contents = await file.read()
        file_size_mb = len(contents) / (1024 * 1024)
        
        # Validate file size
        if file_size_mb > max_size_mb:
            raise HTTPException(
                status_code=400,
                detail=f"File size must be less than {max_size_mb}MB"
            )
        
        try:
            # Upload to Cloudinary
            result = cloudinary.uploader.upload(
                contents,
                folder=folder,
                resource_type="image",
                transformation=[
                    {'width': 500, 'height': 500, 'crop': 'limit'},
                    {'quality': 'auto'},
                    {'fetch_format': 'auto'}
                ]
            )
            
            return {
                'url': result.get('secure_url'),
                'public_id': result.get('public_id'),
                'width': result.get('width'),
                'height': result.get('height'),
                'format': result.get('format'),
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")
    
    @staticmethod
    def delete_image(public_id: str) -> bool:
        """
        Delete an image from Cloudinary
        
        Args:
            public_id: The Cloudinary public_id of the image
            
        Returns:
            bool: True if deleted successfully
        """
        try:
            result = cloudinary.uploader.destroy(public_id)
            return result.get('result') == 'ok'
        except Exception:
            return False
    
    @staticmethod
    def get_thumbnail_url(url: str, width: int = 150, height: int = 150) -> str:
        """
        Get a thumbnail URL for an image
        
        Args:
            url: Original image URL
            width: Thumbnail width
            height: Thumbnail height
            
        Returns:
            str: Thumbnail URL
        """
        if not url or 'cloudinary.com' not in url:
            return url
        
        # Extract public_id from URL
        parts = url.split('/upload/')
        if len(parts) != 2:
            return url
        
        # Insert transformation
        transformation = f"w_{width},h_{height},c_fill,q_auto,f_auto"
        return f"{parts[0]}/upload/{transformation}/{parts[1]}"
