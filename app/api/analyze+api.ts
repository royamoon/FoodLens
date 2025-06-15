import { GoogleGenerativeAI } from '@google/generative-ai';
import { envConfig } from '@/lib/environment';

const genAI = new GoogleGenerativeAI(envConfig.GEMINI_API_KEY);

export async function POST(req: Request): Promise<Response> {
  try {
    // Check if API key is configured
    if (!envConfig.GEMINI_API_KEY) {
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

    // Get the model
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-preview-05-20',
      generationConfig: {
        temperature: 0.2,
        thinkingConfig: {
          thinkingBudget: 0,
        },
        responseMimeType: 'application/json',
      },
    });

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
    Be as specific and accurate as possible in identifying the food and its components.
    If no food can be identified, respond clearly with "identifiedFood": "unknown"`;

    // Prepare parts for the API
    const parts = [
      { text: prompt },
      {
        inlineData: {
          mimeType: image.inlineData.mimeType,
          data: image.inlineData.data,
        },
      },
    ];

    // Generate content using the official API
    const result = await model.generateContent(parts);
    const response = await result.response;

    // Get the response text
    const responseText = response.text();
    
    if (!responseText) {
      console.error('No response text received from AI model');
      return Response.json({ 
        error: 'No response received from AI service. Please try again.' 
      }, { status: 500 });
    }

    // Clean up the response text to remove any markdown formatting
    const cleanedText = responseText.replace(/```json\n?|\n?```/g, '').trim();

    // Parse the response text as JSON to validate the format
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('Raw response:', responseText);
      
      // Try to extract JSON from the response if it's wrapped in other text
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } catch (secondParseError) {
          console.error('Failed to parse extracted JSON:', secondParseError);
          return Response.json({ 
            error: 'Invalid response format from AI service. Please try again.' 
          }, { status: 500 });
        }
      } else {
        return Response.json({ 
          error: 'Invalid response format from AI service. Please try again.' 
        }, { status: 500 });
      }
    }

    return Response.json({
      success: true,
      data: parsedResponse,
    });
  } catch (error) {
    console.error('API Error:', error);
    
    // Enhanced error handling for different types of errors
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return Response.json({ 
          error: 'Invalid API key. Please check your GEMINI_API_KEY configuration.' 
        }, { status: 401 });
      } else if (error.message.includes('quota')) {
        return Response.json({ 
          error: 'API quota exceeded. Please try again later.' 
        }, { status: 429 });
      } else if (error.message.includes('rate limit')) {
        return Response.json({ 
          error: 'Rate limit exceeded. Please try again later.' 
        }, { status: 429 });
      }
    }
    
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Failed to analyze image' 
    }, { status: 500 });
  }
}