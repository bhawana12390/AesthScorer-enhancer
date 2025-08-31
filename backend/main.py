from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
import uvicorn
import os
from typing import Dict, Any
import logging
import torch
from contextlib import asynccontextmanager
import base64

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    load_dotenv()
    logging.info("Loaded environment variables from .env file")
except ImportError:
    logging.info("python-dotenv not installed, relying on system environment variables")

from models.score_inference import ImageScoreDetector
from models.image_enhancer import ImageEnhancer

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Set device based on availability
device = "cuda" if torch.cuda.is_available() else "cpu"

# Global model instances
score_detector = None
image_enhancer = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize models on startup"""
    global score_detector, image_enhancer
    
    try:
        logger.info("Loading models...")
        
        # Initialize image score detector
        score_detector = ImageScoreDetector(
            model_path="ml_models/best_model_3.pth",
            device=device
        )
        
        # Initialize image enhancer
        image_enhancer = ImageEnhancer(
            model_path="ml_models/RealESRGAN_x4plus_anime_6B.pth",
            device=device,
            scale=4
        )
        
        logger.info("Models loaded successfully!")
        
    except Exception as e:
        logger.error(f"Failed to load models: {e}")
        raise e
    
    yield
    
    # Cleanup
    logger.info("Shutting down...")

# Create FastAPI app with lifespan
app = FastAPI(
    title="Image Quality Rating and Enhancement API",
    description="API for rating image quality and enhancing images with AI",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Image Quality Rating and Enhancement API is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "score_detector": "loaded" if score_detector else "not loaded",
        "image_enhancer": "loaded" if image_enhancer else "not loaded",
        "device": device
    }

@app.post("/rate/image")
async def rate_image_quality(file: UploadFile = File(...)):
    """
    Rate the quality of an uploaded image
    """
    if not score_detector:
        raise HTTPException(status_code=503, detail="Image scoring model not loaded")
    
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Read file content
        content = await file.read()
        
        # Run inference
        result = await score_detector.predict(content, file.filename)
        
        return JSONResponse(content={
            "filename": file.filename,
            "raw_score": result["raw_score"],
            "quality_score": result["scaled_score"],
            "processing_time": result["processing_time"],
            "image_info": result["image_info"]
        })
        
    except Exception as e:
        logger.error(f"Error rating image: {e}")
        raise HTTPException(status_code=500, detail=f"Error rating image: {str(e)}")

@app.post("/enhance/image")
async def enhance_image_quality(file: UploadFile = File(...)):
    """
    Enhance the quality of an uploaded image using AI
    """
    if not image_enhancer:
        raise HTTPException(status_code=503, detail="Image enhancement model not loaded")
    
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Read file content
        content = await file.read()
        
        # Run enhancement
        result = await image_enhancer.enhance(content, file.filename)
        
        # Convert enhanced image bytes to base64 for JSON response
        enhanced_image_b64 = base64.b64encode(result["enhanced_image_bytes"]).decode('utf-8')
        
        return JSONResponse(content={
            "filename": result["filename"],
            "original_info": result["original_info"],
            "enhancement_info": result["enhancement_info"],
            "enhanced_image_base64": enhanced_image_b64,
            "processing_time": result["total_processing_time"],
            "success": result["success"]
        })
        
    except Exception as e:
        logger.error(f"Error enhancing image: {e}")
        raise HTTPException(status_code=500, detail=f"Error enhancing image: {str(e)}")

@app.post("/process/complete")
async def complete_image_processing(file: UploadFile = File(...)):
    """
    Complete image processing: rate original, enhance, then rate enhanced image
    """
    if not score_detector or not image_enhancer:
        raise HTTPException(status_code=503, detail="Required models not loaded")
    
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Read file content
        content = await file.read()
        
        # Step 1: Rate original image
        logger.info("Rating original image...")
        original_rating = score_detector.predict_sync(content, file.filename)
        
        # Step 2: Enhance image
        logger.info("Enhancing image...")
        enhancement_result = image_enhancer.enhance_sync(content, file.filename)
        
        # Step 3: Rate enhanced image
        logger.info("Rating enhanced image...")
        enhanced_rating = score_detector.predict_sync(
            enhancement_result["enhanced_image_bytes"], 
            f"enhanced_{file.filename}"
        )
        
        # Convert enhanced image bytes to base64 for JSON response
        enhanced_image_b64 = base64.b64encode(enhancement_result["enhanced_image_bytes"]).decode('utf-8')
        
        # Calculate improvement
        score_improvement = enhanced_rating["scaled_score"] - original_rating["scaled_score"]
        percentage_improvement = (score_improvement / original_rating["scaled_score"]) * 100 if original_rating["scaled_score"] > 0 else 0
        
        return JSONResponse(content={
            "filename": file.filename,
            "original_rating": {
                "raw_score": original_rating["raw_score"],
                "quality_score": original_rating["scaled_score"],
                "processing_time": original_rating["processing_time"],
                "image_info": original_rating["image_info"]
            },
            "enhancement_info": {
                "original_size": enhancement_result["enhancement_info"]["original_size"],
                "enhanced_size": enhancement_result["enhancement_info"]["enhanced_size"],
                "scale_factor": enhancement_result["enhancement_info"]["scale_factor"],
                "size_increase": enhancement_result["enhancement_info"]["size_increase"],
                "processing_time": enhancement_result["total_processing_time"]
            },
            "enhanced_rating": {
                "raw_score": enhanced_rating["raw_score"],
                "quality_score": enhanced_rating["scaled_score"],
                "processing_time": enhanced_rating["processing_time"]
            },
            "improvement_analysis": {
                "score_improvement": score_improvement,
                "percentage_improvement": percentage_improvement,
                "improved": score_improvement > 0
            },
            "enhanced_image_base64": enhanced_image_b64,
            "success": True
        })
        
    except Exception as e:
        logger.error(f"Error in complete image processing: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

@app.get("/enhanced-image/{filename}")
async def get_enhanced_image(filename: str):
    """
    Download enhanced image as binary file
    Note: This is a placeholder. In production, you'd want to store enhanced images 
    temporarily and serve them via this endpoint.
    """
    raise HTTPException(status_code=501, detail="Enhanced image download not implemented. Use base64 from /process/complete endpoint.")

@app.get("/models/info")
async def get_models_info():
    """Get information about loaded models"""
    info = {}
    
    if score_detector:
        info["score_model"] = score_detector.get_model_info()
    
    if image_enhancer:
        info["enhancement_model"] = image_enhancer.get_model_info()
    
    info["device"] = device
    
    return info

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )