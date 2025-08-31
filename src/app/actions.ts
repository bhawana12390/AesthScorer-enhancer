'use server';

function dataUriToBlob(dataURI: string): Blob {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}

export type EnhancementResult = {
  filename: string;
  original_rating: {
    raw_score: number;
    quality_score: number;
    processing_time: number;
    image_info: {
      width: number;
      height: number;
      format: string;
      mode: string;
    };
  };
  enhancement_info: {
    original_size: [number, number];
    enhanced_size: [number, number];
    scale_factor: number;
    size_increase: number;
    processing_time: number;
  };
  enhanced_rating: {
    raw_score: number;
    quality_score: number;
    processing_time: number;
  };
  improvement_analysis: {
    score_improvement: number;
    percentage_improvement: number;
    improved: boolean;
  };
  enhanced_image_base64: string;
  success: boolean;
};

export async function processImage(
  imageDataUri: string
): Promise<EnhancementResult> {
  const modelEndpoint = process.env.FASTAPI_ENDPOINT_URL || 'http://localhost:8000/process/complete';
  
  if (!imageDataUri) {
    throw new Error('Image data is required.');
  }

  // Basic validation for data URI and URL.
  if (!imageDataUri.startsWith('data:image/')) {
    throw new Error('Invalid image data format.');
  }
  try {
    new URL(modelEndpoint);
  } catch (e) {
    throw new Error('Invalid model endpoint URL.');
  }

  try {
    const imageBlob = dataUriToBlob(imageDataUri);
    const formData = new FormData();
    // The FastAPI backend expects the file to be named 'file'
    formData.append('file', imageBlob, 'image.png');

    const response = await fetch(modelEndpoint, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'An unknown error occurred.' }));
        throw new Error(errorData.detail || `Request failed with status ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error('Processing failed according to the backend.');
    }
    
    const enhancedImageMimeType = imageDataUri.split(';')[0].split(':')[1];
    const enhancedImageDataUri = `data:${enhancedImageMimeType};base64,${result.enhanced_image_base64}`;

    return { ...result, enhanced_image_base64: enhancedImageDataUri };
  } catch (error) {
    console.error('Error processing image:', error);
    if (error instanceof Error) {
       if (error.message.includes('fetch')) {
         throw new Error('Failed to connect to the model endpoint. Please ensure it is running and accessible.');
       }
       throw new Error(error.message);
    }
    throw new Error(
      'An unexpected error occurred while processing the image. Please try again.'
    );
  }
}
