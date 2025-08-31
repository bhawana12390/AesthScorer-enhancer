# import os
# import torch
# import numpy as np
# from PIL import Image
# import io
# import logging
# import time
# from typing import Dict, Any, Tuple
# import asyncio
# from concurrent.futures import ThreadPoolExecutor
# from basicsr.archs.rrdbnet_arch import RRDBNet
# from realesrgan import RealESRGANer

# logger = logging.getLogger(__name__)

# class ImageEnhancer:
#     """Image enhancement using Real-ESRGAN"""
    
#     def __init__(self, model_path: str, device: str = "cpu", scale: int = 4):
#         self.device = device
#         self.model_path = model_path
#         self.scale = scale
#         self.upsampler = None
#         self.executor = ThreadPoolExecutor(max_workers=1)  # Image enhancement is memory intensive
        
#         self._load_model()
    
#     def _load_model(self):
#         """Load the Real-ESRGAN model"""
#         try:
#             # Check if model file exists
#             if not os.path.exists(self.model_path):
#                 raise FileNotFoundError(f"Model file not found: {self.model_path}")
            
#             # Model definition (RRDBNet backbone)
#             model = RRDBNet(
#                 num_in_ch=3, 
#                 num_out_ch=3, 
#                 num_feat=64,
#                 num_block=6, 
#                 num_grow_ch=32, 
#                 scale=self.scale
#             )
            
#             # Initialize upsampler
#             self.upsampler = RealESRGANer(
#                 scale=self.scale,
#                 model_path=self.model_path,
#                 model=model,
#                 tile=0,
#                 tile_pad=10,
#                 pre_pad=0,
#                 half=True if torch.cuda.is_available() and self.device == "cuda" else False
#             )
            
#             logger.info(f"Loaded Real-ESRGAN model from {self.model_path}")
            
#         except Exception as e:
#             logger.error(f"Failed to load image enhancement model: {e}")
#             raise e
    
#     def _enhance_single_image(self, image_array: np.ndarray) -> Tuple[np.ndarray, Dict[str, Any]]:
#         """Enhance a single image"""
#         start_time = time.time()
        
#         try:
#             # Enhance the image
#             enhanced_output, _ = self.upsampler.enhance(image_array, outscale=self.scale)
            
#             inference_time = time.time() - start_time
            
#             # Get enhancement info
#             original_size = (image_array.shape[1], image_array.shape[0])  # (width, height)
#             enhanced_size = (enhanced_output.shape[1], enhanced_output.shape[0])
            
#             enhancement_info = {
#                 "original_size": original_size,
#                 "enhanced_size": enhanced_size,
#                 "scale_factor": self.scale,
#                 "inference_time": inference_time,
#                 "size_increase": enhanced_size[0] * enhanced_size[1] / (original_size[0] * original_size[1])
#             }
            
#             return enhanced_output, enhancement_info
            
#         except Exception as e:
#             logger.error(f"Error enhancing image: {e}")
#             raise e
    
#     def _preprocess_image(self, image_bytes: bytes) -> Tuple[np.ndarray, Dict[str, Any]]:
#         """Convert image bytes to numpy array"""
#         try:
#             # Load image from bytes
#             image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            
#             # Convert to numpy array
#             image_array = np.array(image)
            
#             # Get original image info
#             image_info = {
#                 "width": image.width,
#                 "height": image.height,
#                 "format": image.format,
#                 "mode": image.mode,
#                 "channels": len(image.getbands())
#             }
            
#             return image_array, image_info
            
#         except Exception as e:
#             logger.error(f"Error preprocessing image: {e}")
#             raise e
    
#     def _postprocess_image(self, enhanced_array: np.ndarray) -> bytes:
#         """Convert enhanced numpy array back to image bytes"""
#         try:
#             # Convert to PIL Image
#             enhanced_image = Image.fromarray(enhanced_array.astype(np.uint8))
            
#             # Save to bytes
#             output_buffer = io.BytesIO()
#             enhanced_image.save(output_buffer, format='PNG')
#             output_bytes = output_buffer.getvalue()
            
#             return output_bytes
            
#         except Exception as e:
#             logger.error(f"Error postprocessing image: {e}")
#             raise e
    
#     async def enhance(self, image_bytes: bytes, filename: str) -> Dict[str, Any]:
#         """Enhance uploaded image file"""
#         start_time = time.time()
        
#         try:
#             # Preprocess image
#             image_array, original_info = self._preprocess_image(image_bytes)
            
#             # Run enhancement in executor to avoid blocking
#             loop = asyncio.get_event_loop()
#             enhanced_array, enhancement_info = await loop.run_in_executor(
#                 self.executor,
#                 self._enhance_single_image,
#                 image_array
#             )
            
#             # Convert enhanced image back to bytes
#             enhanced_bytes = self._postprocess_image(enhanced_array)
            
#             total_time = time.time() - start_time
            
#             # Combine all information
#             result = {
#                 "filename": filename,
#                 "original_image_bytes": image_bytes,
#                 "enhanced_image_bytes": enhanced_bytes,
#                 "original_info": original_info,
#                 "enhancement_info": enhancement_info,
#                 "total_processing_time": total_time,
#                 "success": True
#             }
            
#             return result
            
#         except Exception as e:
#             logger.error(f"Error in image enhancement: {e}")
#             raise e
    
#     def enhance_sync(self, image_bytes: bytes, filename: str) -> Dict[str, Any]:
#         """Synchronous image enhancement for internal use"""
#         start_time = time.time()
        
#         try:
#             # Preprocess image
#             image_array, original_info = self._preprocess_image(image_bytes)
            
#             # Enhance image
#             enhanced_array, enhancement_info = self._enhance_single_image(image_array)
            
#             # Convert enhanced image back to bytes
#             enhanced_bytes = self._postprocess_image(enhanced_array)
            
#             total_time = time.time() - start_time
            
#             # Combine all information
#             result = {
#                 "filename": filename,
#                 "original_image_bytes": image_bytes,
#                 "enhanced_image_bytes": enhanced_bytes,
#                 "original_info": original_info,
#                 "enhancement_info": enhancement_info,
#                 "total_processing_time": total_time,
#                 "success": True
#             }
            
#             return result
            
#         except Exception as e:
#             logger.error(f"Error in image enhancement: {e}")
#             raise e
    
#     def get_model_info(self) -> Dict[str, Any]:
#         """Get information about the enhancement model"""
#         return {
#             "model_type": "Real-ESRGAN",
#             "scale_factor": self.scale,
#             "architecture": "RRDBNet",
#             "device": self.device,
#             "tile_processing": False,  # Currently disabled
#             "output_format": "PNG"
#         }
    
#     def __del__(self):
#         """Cleanup resources"""
#         if hasattr(self, 'executor'):
#             self.executor.shutdown(wait=False)

import os
import torch
import numpy as np
from PIL import Image
import io
import logging
import time
from typing import Dict, Any, Tuple
import asyncio
from concurrent.futures import ThreadPoolExecutor
from basicsr.archs.rrdbnet_arch import RRDBNet
from realesrgan import RealESRGANer
import gc

logger = logging.getLogger(__name__)

class ImageEnhancer:
    """Memory-optimized Image enhancement using Real-ESRGAN"""
    
    def __init__(self, model_path: str, device: str = "cpu", scale: int = 4):
        self.device = device
        self.model_path = model_path
        self.scale = scale
        self.upsampler = None
        self.executor = ThreadPoolExecutor(max_workers=1)
        
        # Memory optimization settings
        self.max_image_size = 512  # Maximum dimension for input images
        self.tile_size = 256 if device == "cpu" else 512  # Smaller tiles for CPU
        
        self._load_model()
    
    def _load_model(self):
        """Load the Real-ESRGAN model with memory optimizations"""
        try:
            if not os.path.exists(self.model_path):
                raise FileNotFoundError(f"Model file not found: {self.model_path}")
            
            # Corrected model definition for 6-block architecture
            model = RRDBNet(
                num_in_ch=3, 
                num_out_ch=3, 
                num_feat=64,
                num_block=6,  # 6 for RealESRGAN_x4plus_anime_6B and 23 for RealESRGAN_x4plus 
                num_grow_ch=32, 
                scale=self.scale
            )
            
            # Initialize upsampler with memory optimizations
            self.upsampler = RealESRGANer(
                scale=self.scale,
                model_path=self.model_path,
                model=model,
                tile=self.tile_size,  # Enable tiling for memory efficiency
                tile_pad=10,
                pre_pad=0,
                half=False,  # Disable half precision on CPU for stability
                gpu_id=None  # Force CPU usage
            )
            
            logger.info(f"Loaded Real-ESRGAN model from {self.model_path}")
            logger.info(f"Using tile size: {self.tile_size} for memory optimization")
            
        except Exception as e:
            logger.error(f"Failed to load image enhancement model: {e}")
            raise e
    
    def _resize_if_too_large(self, image: Image.Image) -> Tuple[Image.Image, bool]:
        """Resize image if it's too large to prevent memory issues"""
        max_dim = max(image.width, image.height)
        
        if max_dim > self.max_image_size:
            # Calculate new size maintaining aspect ratio
            ratio = self.max_image_size / max_dim
            new_width = int(image.width * ratio)
            new_height = int(image.height * ratio)
            
            resized_image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
            logger.info(f"Resized image from {image.width}x{image.height} to {new_width}x{new_height}")
            return resized_image, True
        
        return image, False
    
    def _enhance_single_image(self, image_array: np.ndarray) -> Tuple[np.ndarray, Dict[str, Any]]:
        """Enhance a single image with memory management"""
        start_time = time.time()
        
        try:
            # Clear GPU cache if using CUDA
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
            
            # Force garbage collection
            gc.collect()
            
            logger.info(f"Input image shape: {image_array.shape}")
            
            # Enhance the image
            enhanced_output, _ = self.upsampler.enhance(image_array, outscale=self.scale)
            
            # Clear memory after enhancement
            gc.collect()
            
            inference_time = time.time() - start_time
            
            # Get enhancement info
            original_size = (image_array.shape[1], image_array.shape[0])
            enhanced_size = (enhanced_output.shape[1], enhanced_output.shape[0])
            
            enhancement_info = {
                "original_size": original_size,
                "enhanced_size": enhanced_size,
                "scale_factor": self.scale,
                "inference_time": inference_time,
                "size_increase": enhanced_size[0] * enhanced_size[1] / (original_size[0] * original_size[1])
            }
            
            logger.info(f"Enhancement completed. Output shape: {enhanced_output.shape}")
            
            return enhanced_output, enhancement_info
            
        except Exception as e:
            logger.error(f"Error enhancing image: {e}")
            # Clean up memory on error
            gc.collect()
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
            raise e
    
    def _preprocess_image(self, image_bytes: bytes) -> Tuple[np.ndarray, Dict[str, Any]]:
        """Convert image bytes to numpy array with memory optimization"""
        try:
            # Load image from bytes
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            
            # Store original info
            original_info = {
                "original_width": image.width,
                "original_height": image.height,
                "format": image.format,
                "mode": image.mode,
                "channels": len(image.getbands())
            }
            
            # Resize if too large
            image, was_resized = self._resize_if_too_large(image)
            
            # Update info with processed dimensions
            image_info = {
                **original_info,
                "processed_width": image.width,
                "processed_height": image.height,
                "was_resized": was_resized
            }
            
            # Convert to numpy array
            image_array = np.array(image)
            
            # Clear PIL image from memory
            del image
            gc.collect()
            
            return image_array, image_info
            
        except Exception as e:
            logger.error(f"Error preprocessing image: {e}")
            raise e
    
    def _postprocess_image(self, enhanced_array: np.ndarray) -> bytes:
        """Convert enhanced numpy array back to image bytes"""
        try:
            # Ensure array is in correct format
            if enhanced_array.dtype != np.uint8:
                enhanced_array = np.clip(enhanced_array, 0, 255).astype(np.uint8)
            
            # Convert to PIL Image
            enhanced_image = Image.fromarray(enhanced_array)
            
            # Save to bytes with compression to reduce memory usage
            output_buffer = io.BytesIO()
            enhanced_image.save(output_buffer, format='PNG', optimize=True)
            output_bytes = output_buffer.getvalue()
            
            # Clean up
            del enhanced_image, enhanced_array
            gc.collect()
            
            return output_bytes
            
        except Exception as e:
            logger.error(f"Error postprocessing image: {e}")
            raise e
    
    async def enhance(self, image_bytes: bytes, filename: str) -> Dict[str, Any]:
        """Enhance uploaded image file with memory management"""
        start_time = time.time()
        
        try:
            logger.info(f"Starting enhancement for {filename}")
            
            # Preprocess image
            image_array, original_info = self._preprocess_image(image_bytes)
            
            # Run enhancement in executor to avoid blocking
            loop = asyncio.get_event_loop()
            enhanced_array, enhancement_info = await loop.run_in_executor(
                self.executor,
                self._enhance_single_image,
                image_array
            )
            
            # Convert enhanced image back to bytes
            enhanced_bytes = self._postprocess_image(enhanced_array)
            
            total_time = time.time() - start_time
            
            # Combine all information
            result = {
                "filename": filename,
                "original_image_bytes": image_bytes,
                "enhanced_image_bytes": enhanced_bytes,
                "original_info": original_info,
                "enhancement_info": enhancement_info,
                "total_processing_time": total_time,
                "success": True
            }
            
            logger.info(f"Enhancement completed in {total_time:.2f}s")
            return result
            
        except Exception as e:
            logger.error(f"Error in image enhancement: {e}")
            # Force cleanup on error
            gc.collect()
            raise e
    
    def enhance_sync(self, image_bytes: bytes, filename: str) -> Dict[str, Any]:
        """Synchronous image enhancement with memory management"""
        start_time = time.time()
        
        try:
            logger.info(f"Starting sync enhancement for {filename}")
            
            # Preprocess image
            image_array, original_info = self._preprocess_image(image_bytes)
            
            # Enhance image
            enhanced_array, enhancement_info = self._enhance_single_image(image_array)
            
            # Convert enhanced image back to bytes
            enhanced_bytes = self._postprocess_image(enhanced_array)
            
            total_time = time.time() - start_time
            
            # Combine all information
            result = {
                "filename": filename,
                "original_image_bytes": image_bytes,
                "enhanced_image_bytes": enhanced_bytes,
                "original_info": original_info,
                "enhancement_info": enhancement_info,
                "total_processing_time": total_time,
                "success": True
            }
            
            logger.info(f"Sync enhancement completed in {total_time:.2f}s")
            return result
            
        except Exception as e:
            logger.error(f"Error in sync image enhancement: {e}")
            # Force cleanup on error
            gc.collect()
            raise e
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the enhancement model"""
        return {
            "model_type": "Real-ESRGAN",
            "scale_factor": self.scale,
            "architecture": "RRDBNet (6 blocks)",
            "device": self.device,
            "tile_processing": True,
            "tile_size": self.tile_size,
            "max_input_size": self.max_image_size,
            "output_format": "PNG"
        }
    
    def __del__(self):
        """Cleanup resources"""
        if hasattr(self, 'executor'):
            self.executor.shutdown(wait=False)
        gc.collect()