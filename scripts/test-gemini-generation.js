const { GoogleGenerativeAI } = require('@google/generative-ai')
require('dotenv').config({ path: '.env.local' })

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

async function testGeminiImageGeneration() {
  try {
    console.log('🧪 Testing Gemini 2.5 Flash Image generation...')
    console.log(`API Key: ${process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) + '...' : 'Not set'}`)
    
    // Test 1: Check available models
    console.log('\n1. Checking available models...')
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image-preview' })
      console.log('✅ Gemini 2.5 Flash Image model initialized')
    } catch (modelError) {
      console.log('❌ Model initialization failed:', modelError.message)
      
      // Try alternative model names
      const alternativeModels = [
        'gemini-2.0-flash-image',
        'gemini-flash-image',
        'gemini-pro-vision',
        'gemini-1.5-pro'
      ]
      
      for (const modelName of alternativeModels) {
        try {
          const altModel = genAI.getGenerativeModel({ model: modelName })
          console.log(`✅ Alternative model ${modelName} works`)
          break
        } catch (altError) {
          console.log(`❌ ${modelName} failed:`, altError.message)
        }
      }
      return
    }
    
    // Test 2: Simple text generation
    console.log('\n2. Testing basic text generation...')
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })
      const result = await model.generateContent('Hello, can you generate text?')
      const response = await result.response
      console.log('✅ Text generation works:', response.text().substring(0, 100) + '...')
    } catch (textError) {
      console.log('❌ Text generation failed:', textError.message)
    }
    
    // Test 3: Check if image generation is available
    console.log('\n3. Testing image generation capability...')
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image-preview' })
      
      const prompt = 'Generate a simple image of a modern living room with a sofa and coffee table'
      
      const result = await model.generateContent([prompt])
      const response = await result.response
      
      console.log('Response candidates:', response.candidates?.length || 0)
      
      if (response.candidates && response.candidates[0]?.content?.parts) {
        let hasImage = false
        let hasText = false
        
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            console.log('✅ Found generated image data!')
            console.log('Image mime type:', part.inlineData.mimeType)
            console.log('Image data length:', part.inlineData.data?.length || 0)
            hasImage = true
          }
          if (part.text) {
            console.log('📝 Text response:', part.text.substring(0, 200) + '...')
            hasText = true
          }
        }
        
        if (!hasImage && !hasText) {
          console.log('❌ No image or text generated')
        }
        
        if (!hasImage) {
          console.log('⚠️  Gemini 2.5 Flash Image may not be available or may not generate images')
          console.log('💡 This could be why the system is falling back to sample images')
        }
        
      } else {
        console.log('❌ No response candidates found')
      }
      
    } catch (imageError) {
      console.log('❌ Image generation test failed:', imageError.message)
      
      if (imageError.message.includes('not found') || imageError.message.includes('404')) {
        console.log('💡 The gemini-2.5-flash-image-preview model may not be available yet')
        console.log('💡 It might still be in limited preview or not released')
      }
      
      if (imageError.message.includes('permission') || imageError.message.includes('403')) {
        console.log('💡 Your API key may not have access to image generation models')
        console.log('💡 You may need to request access or use a different model')
      }
    }
    
    console.log('\n📋 Summary:')
    console.log('- If image generation failed, the system will use fallback sample images')
    console.log('- This explains why you see unrelated images instead of transformations')
    console.log('- We may need to use a different approach for image generation')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testGeminiImageGeneration()
