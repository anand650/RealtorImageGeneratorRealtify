import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface NanoBananaRequest {
  image_url: string
  prompt: string
  style?: 'photorealistic' | 'artistic' | 'sketch' | 'modern' | 'traditional' | 'luxury' | 'cozy' | 'minimalist' | 'rustic' | 'industrial' | 'scandinavian'
  quality?: 'standard' | 'high' | 'ultra'
  room_type?: string
}

export interface NanoBananaResponse {
  success: boolean
  result_url?: string
  error?: string
  errorCode?: string
  processing_time?: number
}

export const ROOM_PROMPTS = {
  living_room: {
    modern: "Transform this living room into a modern, minimalist space with clean lines, neutral colors, contemporary furniture including a sleek sofa, glass coffee table, and modern lighting fixtures. Add plants and artwork for warmth.",
    traditional: "Enhance this living room with traditional furniture including a classic sofa set, wooden coffee table, elegant curtains, and warm lighting. Add bookshelves, family photos, and traditional decor elements.",
    luxury: "Create a luxurious living room with high-end furniture, marble accents, gold details, plush seating, crystal chandelier, and premium materials throughout. Add elegant artwork and sophisticated decor.",
    cozy: "Make this living room cozy and inviting with comfortable seating, soft textures, warm lighting, throw pillows, blankets, and a fireplace. Add books, candles, and personal touches for a homey feel.",
    scandinavian: "Design a Scandinavian living room with light wood furniture, white and neutral tones, clean lines, and functional design. Add cozy textiles, natural materials, hygge elements like candles and throws, and plenty of natural light.",
    minimalist: "Create a minimalist living room with clean lines, uncluttered space, and essential furniture only. Focus on functionality and simplicity with neutral colors and minimal decor.",
    rustic: "Transform this living room with rustic furniture, natural materials, and country-inspired decor. Add wooden elements, stone features, warm textures, and vintage accessories.",
    industrial: "Design an industrial living room with metal furniture, exposed brick, concrete elements, and raw materials. Add industrial lighting, urban aesthetics, and functional design."
  },
  bedroom: {
    modern: "Design a modern bedroom with a platform bed, minimalist furniture, clean lines, and contemporary lighting. Use neutral colors with accent pieces and add modern artwork and plants.",
    traditional: "Create a traditional bedroom with a classic bed frame, wooden furniture, elegant bedding, and traditional decor. Add bedside tables, lamps, and classic artwork.",
    luxury: "Design a luxurious master bedroom with a king-size bed, premium linens, elegant furniture, chandelier lighting, and high-end materials. Add a seating area and luxury bathroom access.",
    cozy: "Make this bedroom cozy and comfortable with soft bedding, warm colors, comfortable seating, and personal touches. Add reading nooks, soft lighting, and comfortable textures.",
    scandinavian: "Create a Scandinavian bedroom with light wood bed frame, white linens, minimalist design, and natural textures. Add cozy wool throws, simple lighting, natural materials, and a calm, serene atmosphere.",
    minimalist: "Design a minimalist bedroom with a simple bed, clean lines, and uncluttered space. Focus on functionality and simplicity with neutral colors and minimal decor.",
    rustic: "Create a rustic bedroom with wooden furniture, natural materials, and country-inspired decor. Add warm textures, vintage accessories, and cozy elements.",
    industrial: "Design an industrial bedroom with metal bed frame, exposed brick, and raw materials. Add industrial lighting, urban aesthetics, and functional design."
  },
  kitchen: {
    modern: "Transform this kitchen into a modern space with sleek cabinets, stainless steel appliances, quartz countertops, and contemporary lighting. Add a kitchen island and modern fixtures.",
    traditional: "Enhance this kitchen with traditional wooden cabinets, classic appliances, granite countertops, and traditional lighting. Add a farmhouse sink and classic hardware.",
    luxury: "Create a luxury kitchen with custom cabinets, high-end appliances, marble countertops, and premium fixtures. Add a large island, wine storage, and professional-grade equipment.",
    cozy: "Make this kitchen warm and inviting with comfortable seating, warm lighting, and homey touches. Add a breakfast nook, cozy lighting, and comfortable textures.",
    scandinavian: "Design a Scandinavian kitchen with light wood cabinets, white countertops, clean lines, and functional design. Add natural materials, simple hardware, pendant lighting, and plants for a fresh, minimalist look.",
    minimalist: "Create a minimalist kitchen with clean lines, simple cabinets, and uncluttered design. Focus on functionality and simplicity with neutral colors and minimal decor.",
    rustic: "Transform this kitchen with rustic cabinets, natural materials, and country-inspired decor. Add wooden elements, stone features, and vintage accessories.",
    industrial: "Design an industrial kitchen with metal cabinets, exposed brick, concrete countertops, and raw materials. Add industrial lighting and urban aesthetics."
  },
  dining_room: {
    modern: "Design a modern dining room with a sleek table, contemporary chairs, modern lighting, and clean lines. Add modern artwork and minimalist decor.",
    traditional: "Create a traditional dining room with a classic table, elegant chairs, chandelier lighting, and traditional decor. Add a sideboard and classic artwork.",
    luxury: "Design a luxury dining room with a large table, premium chairs, crystal chandelier, and high-end materials. Add wine storage and elegant serving pieces.",
    cozy: "Make this dining room warm and inviting with comfortable seating, warm lighting, and personal touches. Add family photos and comfortable textures.",
    scandinavian: "Create a Scandinavian dining room with a light wood table, simple chairs, pendant lighting, and clean design. Add natural textures, white and neutral colors, and minimal but functional decor.",
    minimalist: "Design a minimalist dining room with a simple table, clean lines, and uncluttered space. Focus on functionality and simplicity with neutral colors.",
    rustic: "Transform this dining room with rustic furniture, natural materials, and country-inspired decor. Add wooden elements, stone features, and vintage accessories.",
    industrial: "Design an industrial dining room with metal furniture, exposed brick, and raw materials. Add industrial lighting and urban aesthetics."
  },
  bathroom: {
    modern: "Transform this bathroom into a modern space with sleek fixtures, contemporary tiles, and clean lines. Add modern lighting and minimalist decor.",
    traditional: "Enhance this bathroom with traditional fixtures, classic tiles, and elegant details. Add traditional lighting and classic hardware.",
    luxury: "Create a luxury bathroom with premium fixtures, marble tiles, and high-end materials. Add a large vanity, soaking tub, and elegant lighting.",
    cozy: "Make this bathroom warm and inviting with soft lighting, comfortable textures, and personal touches. Add candles and comfortable accessories.",
    scandinavian: "Design a Scandinavian bathroom with light wood vanity, white tiles, clean lines, and natural materials. Add simple fixtures, neutral colors, plants, and a spa-like, serene atmosphere.",
    minimalist: "Create a minimalist bathroom with clean lines, simple fixtures, and uncluttered design. Focus on functionality and simplicity with neutral colors.",
    rustic: "Transform this bathroom with rustic fixtures, natural materials, and country-inspired decor. Add wooden elements, stone features, and vintage accessories.",
    industrial: "Design an industrial bathroom with metal fixtures, exposed brick, concrete elements, and raw materials. Add industrial lighting and urban aesthetics."
  },
  office: {
    modern: "Design a modern home office with a sleek desk, contemporary chair, and modern lighting. Add modern storage and minimalist decor.",
    traditional: "Create a traditional home office with a classic desk, wooden furniture, and traditional lighting. Add bookshelves and classic artwork.",
    luxury: "Design a luxury home office with premium furniture, high-end materials, and elegant lighting. Add a seating area and luxury accessories.",
    cozy: "Make this office warm and comfortable with soft lighting, comfortable seating, and personal touches. Add plants and comfortable textures.",
    scandinavian: "Create a Scandinavian home office with light wood desk, simple chair, clean design, and functional storage. Add natural light, white and neutral colors, plants, and a calm, productive atmosphere.",
    minimalist: "Design a minimalist home office with a clean desk, simple chair, and minimal decor. Focus on functionality and uncluttered space.",
    rustic: "Create a rustic home office with wooden desk, vintage furniture, and natural materials. Add warm lighting and country-inspired decor.",
    industrial: "Design an industrial home office with metal furniture, exposed brick, and raw materials. Add industrial lighting and urban aesthetics."
  },
  outdoor: {
    modern: "Transform this outdoor space into a modern area with contemporary furniture, clean lines, and sleek materials. Add modern lighting, geometric planters, and minimalist decor.",
    traditional: "Enhance this outdoor space with traditional furniture, classic garden elements, and elegant landscaping. Add traditional lighting and classic garden decor.",
    luxury: "Create a luxury outdoor space with high-end furniture, premium materials, and elegant features. Add luxury lighting, water features, and sophisticated landscaping.",
    cozy: "Make this outdoor space cozy and inviting with comfortable seating, warm lighting, and personal touches. Add cushions, throws, and cozy garden elements.",
    scandinavian: "Design a Scandinavian outdoor space with light wood furniture, natural materials, and clean lines. Add simple lighting, plants, and hygge-inspired elements.",
    minimalist: "Create a minimalist outdoor space with simple furniture, clean lines, and uncluttered design. Focus on functionality and natural elements.",
    rustic: "Transform this outdoor space with rustic furniture, natural materials, and country-inspired decor. Add wooden elements, stone features, and warm lighting.",
    industrial: "Design an industrial outdoor space with metal furniture, concrete elements, and urban aesthetics. Add industrial lighting and raw materials."
  }
}

/**
 * Process image with Google Gemini 2.5 Flash Image (Nano Banana)
 * This uses Gemini's image generation capabilities to transform room images
 * based on the specified style and room type prompts
 */
export async function processImageWithNanoBanana(request: NanoBananaRequest): Promise<NanoBananaResponse> {
  const startTime = Date.now();
  
  try {
    // Use Gemini 2.5 Flash Image for actual image generation
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image-preview' });

    // Fetch the original image
    const imageResponse = await fetch(request.image_url);
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch original image');
    }
    
    const imageBuffer = await imageResponse.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString('base64');
    const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';

    // Create enhanced prompt based on room type and style
    // Enhanced prompt with quality specifications
    const qualityInstructions = {
      'standard': 'Generate a good quality enhanced image with clear details.',
      'high': 'Generate a high-quality enhanced image with sharp details, vibrant colors, and professional lighting.',
      'ultra': 'Generate an ultra-high-quality enhanced image with maximum detail, photorealistic textures, perfect lighting, and professional photography quality. Ensure crisp edges, rich colors, and no compression artifacts.'
    };

    // Extract room type and style from the prompt or use defaults
    // If room_type is provided, use it; otherwise try to extract from prompt
    let roomType = request.room_type || 'room';
    let style = request.style || 'modern';
    
    // If room_type is provided, ensure it's used correctly in the prompt
    // Normalize room type (bathroom -> bathroom, living_room -> living room, etc.)
    const normalizedRoomType = roomType.replace(/_/g, ' ').toLowerCase();
    
    // Build a strong, specific prompt that emphasizes the correct room type
    // Capitalize first letter for display
    const roomTypeDisplay = normalizedRoomType.charAt(0).toUpperCase() + normalizedRoomType.slice(1)
    
    const enhancementPrompt = `You are an expert interior designer. Transform this ${normalizedRoomType} into a beautifully designed ${style} style ${normalizedRoomType}. 

🚨 ABSOLUTE REQUIREMENTS - DO NOT VIOLATE:
1. THE ROOM TYPE IS ${roomTypeDisplay.toUpperCase()} - IT MUST REMAIN A ${roomTypeDisplay.toUpperCase()}
2. DO NOT convert this ${normalizedRoomType} to any other room type (NOT living room, NOT bedroom, NOT kitchen, NOT dining room, NOT office, NOT outdoor)
3. This ${normalizedRoomType} must stay as a ${normalizedRoomType} in the final image
4. If the image shows a ${normalizedRoomType}, keep it as a ${normalizedRoomType} regardless of what furniture is visible
5. Generate the image immediately without asking questions or clarifications

TRANSFORMATION REQUIREMENTS:
- Apply ${style} style furniture, decor, and design elements appropriate ONLY for a ${normalizedRoomType}
- Add appropriate ${normalizedRoomType}-specific furniture and fixtures
- Maintain the ${normalizedRoomType} structure and layout
- Enhance lighting and ambiance to match ${style} aesthetics for a ${normalizedRoomType}
- Keep the same perspective and viewpoint
- Make it look professionally designed and staged

${request.prompt}

FINAL CONFIRMATION:
- Room Type: ${roomTypeDisplay} (MUST STAY AS ${roomTypeDisplay.toUpperCase()})
- Style: ${style}
- Quality: ${request.quality || 'high'}

${qualityInstructions[request.quality || 'high']}

Generate the enhanced ${normalizedRoomType} image now. The result MUST be a ${normalizedRoomType} with ${style} style. Do not ask for clarification.`;

    console.log('Generating image with Gemini 2.5 Flash Image...');
    console.log('Prompt:', enhancementPrompt);

    // Generate enhanced image using Gemini 2.5 Flash Image
    const result = await model.generateContent([
      enhancementPrompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: mimeType,
        },
      },
    ]);

    const response = await result.response;
    
    // Check if we got an image back
    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
          // We got a generated image - upload it to S3
          const generatedImageBuffer = Buffer.from(part.inlineData.data, 'base64');
          
          // Generate S3 key for the processed image with quality-based format
          const timestamp = Date.now();
          const useHighQuality = (request.quality === 'high' || request.quality === 'ultra');
          const format = useHighQuality ? 'png' : 'jpg';
          const contentType = useHighQuality ? 'image/png' : 'image/jpeg';
          const processedKey = `processed/enhanced-${timestamp}.${format}`;
          
              // Upload to S3 with appropriate format
              const { uploadToS3 } = await import('./s3');
              await uploadToS3(processedKey, generatedImageBuffer, contentType);
              
              // Return S3 key (not direct URL) - the API will generate pre-signed URLs
              const enhancedImageUrl = processedKey;
          
          console.log('✅ Successfully generated and uploaded enhanced image');
          
          return {
            success: true,
            result_url: enhancedImageUrl,
            processing_time: Date.now() - startTime,
          };
        }
      }
    }

    // If no image was generated, check for text response
    const textResponse = response.text();
    console.log('Gemini response (no image generated):', textResponse);
    
    // Check if Gemini is asking for clarification instead of generating
    if (textResponse.includes('clarify') || textResponse.includes('clarification') || 
        textResponse.includes('Could you please') || textResponse.includes('would you like me to')) {
      throw new Error(`Gemini asked for clarification instead of generating image. This usually means there's a mismatch between the room type selected and the actual image. Please try selecting the correct room type or upload a different image. Response: ${textResponse}`);
    }
    
    // This might be a quota or capability issue
    throw new Error(`Gemini 2.5 Flash Image did not generate an image. Response: ${textResponse}`);

  } catch (error) {
    console.error('Gemini image processing error:', error);
    
    let errorMessage = 'AI image generation failed';
    let errorCode = 'UNKNOWN_ERROR';
    
    if (error instanceof Error) {
      if (error.message.includes('did not generate an image') || error.message.includes('no image generated')) {
        errorMessage = 'Gemini 2.5 Flash Image model returned text instead of generating an image. This may be due to model limitations or quota restrictions.';
        errorCode = 'NO_IMAGE_GENERATED';
      } else if (error.message.includes('429') || error.message.includes('quota')) {
        errorMessage = 'AI service quota exceeded. Please upgrade your plan or try again later.';
        errorCode = 'QUOTA_EXCEEDED';
      } else if (error.message.includes('404') || error.message.includes('not found')) {
        errorMessage = 'Gemini 2.5 Flash Image model not available. Please contact support.';
        errorCode = 'MODEL_NOT_FOUND';
      } else if (error.message.includes('403') || error.message.includes('permission')) {
        errorMessage = 'AI service access denied. Please check your API configuration.';
        errorCode = 'ACCESS_DENIED';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Network error connecting to AI service. Please check your connection.';
        errorCode = 'NETWORK_ERROR';
      } else if (error.message.includes('Failed to fetch original image')) {
        errorMessage = 'Could not download the original image for processing. Please try uploading again.';
        errorCode = 'IMAGE_FETCH_ERROR';
      } else {
        errorMessage = `AI generation error: ${error.message}`;
        errorCode = 'AI_ERROR';
      }
    }
    
    return {
      success: false,
      error: errorMessage,
      errorCode: errorCode,
      processing_time: Date.now() - startTime,
    };
  }
}

/**
 * Analyze room image using Gemini Vision
 * This provides detailed room analysis and enhancement suggestions
 */
export async function analyzeRoomWithGemini(imageUrl: string, roomType: string, style: string) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = `Analyze this ${roomType} image and provide detailed enhancement specifications for a ${style} style design. Consider:
    1. Room dimensions and layout
    2. Lighting conditions
    3. Existing features that should be preserved
    4. Furniture placement and spacing
    5. Color palette and materials
    6. Specific items to add based on ${style} style

    Provide a comprehensive analysis in JSON format that can be used to generate an enhanced version of this room.`;

    // Note: In production, fetch the image and convert to base64
    // For now, this is a placeholder structure

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysis = response.text();

    return {
      success: true,
      analysis,
    };
  } catch (error) {
    console.error('Gemini analysis error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Analysis failed',
    };
  }
}

export function getRoomPrompt(roomType: string, style: string): string {
  // Normalize room type (handle both 'living_room' and 'living room')
  const normalizedRoomType = roomType.replace(/\s+/g, '_').toLowerCase()
  const normalizedStyle = style.toLowerCase()
  
  const roomPrompts = ROOM_PROMPTS[normalizedRoomType as keyof typeof ROOM_PROMPTS]
  if (!roomPrompts) {
    // Fallback for unknown room types
    return `Transform this ${roomType.replace(/_/g, ' ')} into a beautifully designed ${style} style space. Add appropriate furniture, decor, and design elements that match the ${style} aesthetic.`
  }

  const prompt = roomPrompts[normalizedStyle as keyof typeof roomPrompts]
  if (!prompt) {
    // Fallback for unknown styles - use a generic prompt
    return `Transform this ${roomType.replace(/_/g, ' ')} into a beautifully designed ${style} style space. Add appropriate furniture, decor, and design elements that match the ${style} aesthetic. Enhance lighting, colors, and overall ambiance to create a professional, staged look.`
  }

  return prompt
}

export function getAvailableRoomTypes(): string[] {
  return Object.keys(ROOM_PROMPTS)
}

export function getAvailableStyles(roomType: string): string[] {
  const roomPrompts = ROOM_PROMPTS[roomType as keyof typeof ROOM_PROMPTS]
  return roomPrompts ? Object.keys(roomPrompts) : []
}

export function getRoomTypeDisplayName(roomType: string): string {
  const displayNames: Record<string, string> = {
    living_room: 'Living Room',
    bedroom: 'Bedroom',
    kitchen: 'Kitchen',
    dining_room: 'Dining Room',
    bathroom: 'Bathroom',
    office: 'Office'
  }
  return displayNames[roomType] || roomType
}

export function getStyleDisplayName(style: string): string {
  const displayNames: Record<string, string> = {
    modern: 'Modern',
    traditional: 'Traditional',
    luxury: 'Luxury',
    cozy: 'Cozy',
    scandinavian: 'Scandinavian'
  }
  return displayNames[style] || style
}

