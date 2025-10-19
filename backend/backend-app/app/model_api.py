import httpx
import aiofiles
from typing import List
from fastapi import HTTPException

BACKEND_URL = "http://localhost:7001/api"

async def list_datasets():
    """
    Get list of all datasets from the ML backend
    """
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{BACKEND_URL}/datasets")
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            raise HTTPException(status_code=500, detail=f"Error fetching datasets: {str(e)}")

async def create_dataset(name: str, description: str):
    """
    Create a new dataset on the ML backend
    
    Args:
        name: Name of the dataset
        description: Description of the dataset
    """
    async with httpx.AsyncClient() as client:
        try:
            data = {
                "name": name,
                "description": description
            }
            response = await client.post(
                f"{BACKEND_URL}/datasets",
                data=data
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            raise HTTPException(status_code=500, detail=f"Error creating dataset: {str(e)}")

async def upload_images_to_dataset(dataset_name: str, files: List[bytes], filenames: List[str]):
    """
    Upload images to an existing dataset
    
    Args:
        dataset_name: Name of the dataset to upload to
        files: List of file contents as bytes
        filenames: List of filenames corresponding to the files
    """
    async with httpx.AsyncClient() as client:
        try:
            files_data = [
                ("files", (filename, file_content, "image/jpeg")) 
                for filename, file_content in zip(filenames, files)
            ]
            
            response = await client.post(
                f"{BACKEND_URL}/datasets/{dataset_name}/upload",
                files=files_data
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            raise HTTPException(status_code=500, detail=f"Error uploading images: {str(e)}")


async def upload_dataset_annotations(dataset_name: str, annotation_files: List[bytes], filenames: List[str]):
    """
    Upload annotation files to a dataset
    
    Args:
        dataset_name: Name of the dataset
        annotation_files: List of JSON annotation file contents as bytes
        filenames: List of filenames corresponding to the annotation files
    """
    async with httpx.AsyncClient() as client:
        try:
            files_data = [
                ("files", (filename, file_content, "application/json"))
                for filename, file_content in zip(filenames, annotation_files)
            ]
            
            response = await client.post(
                f"{BACKEND_URL}/{dataset_name}/upload-annotations",
                files=files_data
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            raise HTTPException(status_code=500, detail=f"Error uploading annotations: {str(e)}")

async def list_dataset_images(dataset_name: str):
    """
    Get list of images in a dataset with their annotation status
    
    Args:
        dataset_name: Name of the dataset
    
    Returns:
        List of dictionaries containing image info
    """
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{BACKEND_URL}/{dataset_name}/images"
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            raise HTTPException(status_code=500, detail=f"Error listing images: {str(e)}")

async def get_image_with_annotation(dataset_name: str, image_name: str):
    """
    Get image details and its annotation if it exists
    
    Args:
        dataset_name: Name of the dataset
        image_name: Name of the image file
        
    Returns:
        Dictionary containing image URL, dimensions and annotation data
    """
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{BACKEND_URL}/{dataset_name}/images/{image_name}"
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            raise HTTPException(status_code=500, detail=f"Error getting image annotation: {str(e)}")

async def get_image_file(dataset_name: str, image_name: str):
    """
    Get image file from dataset
    
    Args:
        dataset_name: Name of the dataset
        image_name: Name of the image file
        
    Returns:
        Image file bytes
    """
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{BACKEND_URL}/{dataset_name}/images/{image_name}/file"
            )
            response.raise_for_status()
            return response.content
        except httpx.HTTPError as e:
            raise HTTPException(status_code=500, detail=f"Error getting image file: {str(e)}")

async def save_annotation(dataset_name: str, image_name: str, annotation: dict):
    """
    Save annotation for an image
    
    Args:
        dataset_name: Name of the dataset
        image_name: Name of the image file
        annotation: Annotation data
        
    Returns:
        Response message
    """
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{BACKEND_URL}/{dataset_name}/images/{image_name}/annotation",
                json=annotation
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            raise HTTPException(status_code=500, detail=f"Error saving annotation: {str(e)}")

async def generate_annotation(dataset_name: str, image_name: str):
    """
    Generate annotation for an image using VLM
    
    Args:
        dataset_name: Name of the dataset
        image_name: Name of the image file
        
    Returns:
        Generated annotation data
    """
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{BACKEND_URL}/{dataset_name}/images/{image_name}/generate"
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            raise HTTPException(status_code=500, detail=f"Error generating annotation: {str(e)}")

async def delete_dataset(dataset_name: str):
    """
    Delete a dataset and all its contents
    
    Args:
        dataset_name: Name of the dataset
        
    Returns:
        Response message
    """
    async with httpx.AsyncClient() as client:
        try:
            response = await client.delete(
                f"{BACKEND_URL}/{dataset_name}"
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            raise HTTPException(status_code=500, detail=f"Error deleting dataset: {str(e)}")

async def train_model(dataset_name: str):
    """
    Start model training on a dataset
    
    Args:
        dataset_name: Name of the dataset to train on
        
    Returns:
        Response message
    """
    async with httpx.AsyncClient(timeout=300.0) as client:
        try:
            response = await client.post(
                f"{BACKEND_URL}/datasets/{dataset_name}/train"
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            raise HTTPException(status_code=500, detail=f"Error starting model training: {str(e)}")