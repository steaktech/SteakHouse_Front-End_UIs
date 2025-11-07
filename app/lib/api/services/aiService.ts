interface ImageAnalysisResponse {
  palette: {
    primary: string;
    secondary: string;
    accent: string;
  };
  recommended: {
    background: string;
    text: string;
  };
}

/**
 * Analyzes an image using OpenAI's GPT-4 Vision API and returns color recommendations
 * @param imageSource - The image file or URL to analyze
 * @param prompt - Optional custom prompt to guide the analysis
 * @returns Promise with analysis results including colors and description
 */
export async function analyzeImageWithGPT(
  imageSource: File | string,
  prompt: string = `Analyze this image and return: 
  1. A JSON object of the main color palette (primary, secondary, accent) 
  2. Recommended background and text colors for a webpage. 
  3. Make sure to choose the most used dark color for the background and a light color that included in the image that complements the background for text always. 
  4. Ensure response is valid JSON only.
  example:
    {
    "palette": {
        "primary": "#2C3E50",
        "secondary": "#E74C3C",
        "accent": "#F1C40F"
    },
    "recommended": {
        "background": "#2C3E50",
        "text": "#FFFFFF"
    }
    }
  `
): Promise<ImageAnalysisResponse> {
  try {
    let imageUrl: string;

    if (typeof imageSource === 'string') {
      // If it's already a URL, use it directly
      imageUrl = imageSource;
    } else {
      // Convert File to data URL
      const reader = new FileReader();
      imageUrl = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(imageSource);
      });
    }

    const response = await fetch('/api/analyze-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageUrl,
        prompt,
      }),
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
}

// Helper functions to convert image to base64
function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
      resolve(base64String.split(',')[1]);
    };
    reader.onerror = reject;
  });
}

async function convertBlobToBase64(blob: Blob): Promise<string> {
  const base64String = await convertFileToBase64(blob as File);
  return base64String;
}