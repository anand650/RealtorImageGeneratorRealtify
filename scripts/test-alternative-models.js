const { GoogleGenerativeAI } = require('@google/generative-ai')
require('dotenv').config({ path: '.env.local' })

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

async function testAlternativeModels() {
  try {
    console.log('🧪 Testing alternative Gemini models...')
    
    const modelsToTest = [
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest',
      'gemini-pro',
      'gemini-pro-vision',
      'gemini-1.0-pro',
      'gemini-1.0-pro-vision',
      'gemini-2.0-flash-exp',
      'gemini-exp-1206'
    ]
    
    for (const modelName of modelsToTest) {
      console.log(`\nTesting ${modelName}...`)
      try {
        const model = genAI.getGenerativeModel({ model: modelName })
        const result = await model.generateContent('Hello, can you respond?')
        const response = await result.response
        const text = response.text()
        console.log(`✅ ${modelName} works! Response: ${text.substring(0, 50)}...`)
        
        // If this model works, let's test with an image
        if (modelName.includes('vision') || modelName.includes('flash')) {
          console.log(`  Testing ${modelName} with image analysis...`)
          try {
            // Test with a simple image analysis (not generation)
            const imageResult = await model.generateContent([
              'Describe this room and suggest improvements',
              {
                inlineData: {
                  data: '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
                  mimeType: 'image/jpeg',
                },
              },
            ])
            const imageResponse = await imageResult.response
            console.log(`  ✅ ${modelName} can analyze images!`)
          } catch (imageError) {
            console.log(`  ❌ ${modelName} image analysis failed: ${imageError.message.substring(0, 100)}...`)
          }
        }
        
        break // If we find a working model, we can use it
        
      } catch (error) {
        if (error.message.includes('429')) {
          console.log(`❌ ${modelName} - Quota exceeded`)
        } else if (error.message.includes('404')) {
          console.log(`❌ ${modelName} - Model not found`)
        } else {
          console.log(`❌ ${modelName} - Error: ${error.message.substring(0, 100)}...`)
        }
      }
    }
    
    console.log('\n📋 Conclusion:')
    console.log('If all models show quota exceeded, you need to:')
    console.log('1. Wait for quota reset (usually 24 hours)')
    console.log('2. Upgrade to paid plan at https://ai.google.dev/')
    console.log('3. Use alternative service like Replicate + Stable Diffusion')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testAlternativeModels()
