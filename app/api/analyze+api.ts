import { GoogleGenerativeAI } from '@google/generative-ai';

const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(req: Request): Promise<Response> {
  try {
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not configured');
      return Response.json({ 
        error: 'API key not configured. Please add GEMINI_API_KEY to your environment variables.' 
      }, { status: 500 });
    }

    const { image } = await req.json();

    // Validate image data
    if (!image || !image.inlineData || !image.inlineData.data) {
      console.error('Invalid image data received');
      return Response.json({ 
        error: 'Invalid image data. Please ensure image is properly encoded.' 
      }, { status: 400 });
    }

    const model = genAi.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `Analyze this food image and provide detailed nutritional information in the following JSON format:
    {
      "foodAnalysis": {
        "identifiedFood": "Name of what you see in the image",
        "portionSize": "Estimated portion size in grams",
        "recognizedServingSize": "Estimated serving size in grams",
        "nutritionFactsPerPortion": {
          "calories": "Estimated calories",
          "protein": "Estimated protein in grams",
          "carbs": "Estimated carbs in grams",
          "fat": "Estimated fat in grams",
          "fiber": "Estimated fiber in grams",
          "sugar": "Estimated sugar in grams",
          "sodium": "Estimated sodium in mg",
          "cholesterol": "Estimated cholesterol in mg"
        },
        "additionalNotes": [
          "Any notable nutritional characteristics",
          "Presence of allergens",
          "Whether it's vegetarian/vegan/gluten-free if applicable"
        ]
      }
    }
    
    Ensure the response is in valid JSON format exactly as specified above, without any markdown formatting.
    Provide realistic estimates based on typical portion sizes and nutritional databases.
    Be as specific and accurate as possible in identifying the food and its components.`;

    const result = await model.generateContent([prompt, image]);
    const response = await result.response;
    const text = response.text();

    // Clean up the response text to remove any markdown formatting
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();

    // Parse the response text as JSON to validate the format
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', parseError);
      console.error('Raw response:', text);
      return Response.json({ 
        error: 'Invalid response format from AI service. Please try again.' 
      }, { status: 500 });
    }

    return Response.json({
      success: true,
      data: parsedResponse,
    });
  } catch (error) {
    console.error('API Error:', error);
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Failed to analyze image' 
    }, { status: 500 });
  }
}
