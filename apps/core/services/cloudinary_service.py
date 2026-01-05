import cloudinary
import cloudinary.uploader
import cloudinary.api

from fastapi import UploadFile
from config.settings import (
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
)

cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET,
    secure=True,
)


class CloudinaryService:
    """
    Wrapper around Cloudinary SDK
    """

    @staticmethod
    def upload_image(file, folder: str) -> dict:
        """
        Upload image to Cloudinary
        Accepts either UploadFile or file-like object
        """
        # Handle both UploadFile and raw file objects
        file_to_upload = file.file if hasattr(file, 'file') else file
        
        result = cloudinary.uploader.upload(
            file_to_upload,
            folder=folder,
            resource_type="image",
        )

        return {
            "url": result["secure_url"],  # Use secure_url for HTTPS
            "secure_url": result["secure_url"],
            "public_id": result["public_id"],
            "format": result["format"],
        }

    @staticmethod
    def delete_image(public_id: str) -> bool:
        """
        Delete image from Cloudinary
        """

        result = cloudinary.uploader.destroy(public_id)

        return result.get("result") == "ok"
