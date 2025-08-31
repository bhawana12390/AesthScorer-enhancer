import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import numpy as np
import io
import logging
import time
from typing import Dict, Any
import asyncio
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)

class ImageScoreDetector:
    """Image quality score detector"""
    
    def __init__(self, model_path: str, device: str = "cpu"):
        self.device = torch.device(device)
        self.model_path = model_path
        self.model = None
        self.executor = ThreadPoolExecutor(max_workers=2)
        
        # Image preprocessing transforms (same as training)
        self.transforms = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                               std=[0.229, 0.224, 0.225])
        ])
        
        self._load_model()
    
    def _load_model(self):
        """Load the trained image scoring model - exactly like your working code"""
        try:
            # Create model exactly like your working code
            self.model = models.resnet18(pretrained=True)
            num_features = self.model.fc.in_features
            self.model.fc = nn.Linear(num_features, 1)  # regression head
            
            # Load state dict
            state_dict = torch.load(self.model_path, map_location=self.device)
            self.model.load_state_dict(state_dict)
            
            self.model = self.model.to(self.device)
            self.model.eval()
            
            logger.info(f"Loaded image scoring model from {self.model_path}")
            
        except Exception as e:
            logger.error(f"Failed to load image scoring model: {e}")
            raise e
    
    def _predict_single_image(self, image_tensor: torch.Tensor) -> Dict[str, Any]:
        """Run inference on a single image tensor"""
        start_time = time.time()
        
        with torch.no_grad():
            image_tensor = image_tensor.to(self.device)
            
            # Get raw prediction
            raw_score = self.model(image_tensor).item()
            
            # Apply custom scaling (same as your training/inference)
            scaled_score = (1.5 * raw_score + 1) * 4
            
            # Ensure score is within reasonable bounds
            scaled_score = max(0.0, min(10.0, scaled_score))
        
        inference_time = time.time() - start_time
        
        return {
            "raw_score": raw_score,
            "scaled_score": scaled_score,
            "inference_time": inference_time
        }
    
    def _preprocess_image(self, image_bytes: bytes) -> torch.Tensor:
        """Preprocess image bytes to tensor"""
        try:
            # Load image from bytes
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            
            # Apply transforms and add batch dimension
            image_tensor = self.transforms(image).unsqueeze(0)
            
            return image_tensor
            
        except Exception as e:
            logger.error(f"Error preprocessing image: {e}")
            raise e
    
    async def predict(self, image_bytes: bytes, filename: str) -> Dict[str, Any]:
        """Run prediction on uploaded image file"""
        start_time = time.time()
        
        try:
            # Preprocess image
            image_tensor = self._preprocess_image(image_bytes)
            
            # Get image info
            image = Image.open(io.BytesIO(image_bytes))
            width, height = image.size
            
            # Run inference in executor to avoid blocking
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                self.executor,
                self._predict_single_image,
                image_tensor
            )
            
            total_time = time.time() - start_time
            
            # Add additional metadata
            result.update({
                "filename": filename,
                "processing_time": total_time,
                "image_info": {
                    "width": width,
                    "height": height,
                    "format": image.format,
                    "mode": image.mode
                }
            })
            
            return result
            
        except Exception as e:
            logger.error(f"Error in image scoring prediction: {e}")
            raise e
    
    def predict_sync(self, image_bytes: bytes, filename: str) -> Dict[str, Any]:
        """Synchronous prediction for internal use"""
        start_time = time.time()
        
        try:
            # Preprocess image
            image_tensor = self._preprocess_image(image_bytes)
            
            # Get image info
            image = Image.open(io.BytesIO(image_bytes))
            width, height = image.size
            
            # Run inference
            result = self._predict_single_image(image_tensor)
            
            total_time = time.time() - start_time
            
            # Add additional metadata
            result.update({
                "filename": filename,
                "processing_time": total_time,
                "image_info": {
                    "width": width,
                    "height": height,
                    "format": image.format,
                    "mode": image.mode
                }
            })
            
            return result
            
        except Exception as e:
            logger.error(f"Error in image scoring prediction: {e}")
            raise e
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the loaded model"""
        return {
            "model_type": "ResNet18 Image Quality Scorer",
            "input_size": "(224, 224)",
            "device": str(self.device),
            "output_range": "0-10 (scaled)",
            "scaling_formula": "(1.5 * raw_score + 1) * 4"
        }
    
    def __del__(self):
        """Cleanup resources"""
        if hasattr(self, 'executor'):
            self.executor.shutdown(wait=False)