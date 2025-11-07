#!/usr/bin/env node

/**
 * Test script to verify Gemini 2.5 Flash Image generation capabilities
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiImageGeneration() {
  console.log('🧪 Testing Gemini 2.5 Flash Image generation...\n');

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  try {
    // Test 1: Check if the model is available
    console.log('1. Testing model availability...');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image-preview' });
    console.log('✅ Gemini 2.5 Flash Image model initialized');

    // Test 2: Try image generation with a simple prompt
    console.log('\n2. Testing image generation...');
    
    // Use a simple test image (1x1 pixel PNG)
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77zgAAAABJRU5ErkJggg==';
    
    const prompt = `Transform this room into a modern living space with contemporary furniture, clean lines, and warm lighting. Please generate an enhanced version of this room image.`;
    
    console.log('Prompt:', prompt);
    console.log('Calling Gemini 2.5 Flash Image...');
    
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: testImageBase64,
          mimeType: 'image/png',
        },
      },
    ]);

    const response = await result.response;
    console.log('Response received');
    
    // Check response structure
    console.log('\n3. Analyzing response...');
    console.log('Candidates:', response.candidates?.length || 0);
    
    if (response.candidates && response.candidates[0]?.content?.parts) {
      const parts = response.candidates[0].content.parts;
      console.log('Parts:', parts.length);
      
      let hasImage = false;
      let hasText = false;
      
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
          hasImage = true;
          console.log(`✅ Found generated image in part ${i}:`);
          console.log(`   - MIME type: ${part.inlineData.mimeType}`);
          console.log(`   - Data length: ${part.inlineData.data.length} characters`);
        } else if (part.text) {
          hasText = true;
          console.log(`📝 Found text in part ${i}: ${part.text.substring(0, 100)}...`);
        }
      }
      
      if (hasImage) {
        console.log('\n🎉 SUCCESS: Gemini 2.5 Flash Image generated an image!');
      } else if (hasText) {
        console.log('\n⚠️  WARNING: Gemini returned text instead of an image');
        console.log('This might indicate:');
        console.log('- The model is in text-only mode');
        console.log('- Image generation quota is exceeded');
        console.log('- The prompt needs adjustment');
      } else {
        console.log('\n❌ ERROR: No image or text found in response');
      }
    } else {
      console.log('\n❌ ERROR: No candidates found in response');
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    if (error.message.includes('404')) {
      console.log('\n💡 The gemini-2.5-flash-image-preview model might not be available');
      console.log('Available alternatives:');
      console.log('- gemini-2.0-flash-exp (text + vision)');
      console.log('- gemini-1.5-pro (text + vision)');
    } else if (error.message.includes('429')) {
      console.log('\n💡 Quota exceeded - try again later');
    } else if (error.message.includes('403')) {
      console.log('\n💡 Check your API key permissions');
    }
  }

  console.log('\n📋 Test completed!');
}

// Run the test
testGeminiImageGeneration().catch(console.error);
