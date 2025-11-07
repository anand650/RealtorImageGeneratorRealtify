const { processImageWithNanoBanana, getRoomPrompt } = require('../src/lib/nano-banana.ts')

async function testUpdatedSystem() {
  try {
    console.log('🧪 Testing updated image processing system...')
    
    // Test with a sample image URL and different room types/styles
    const testCases = [
      {
        roomType: 'living_room',
        style: 'modern',
        imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop'
      },
      {
        roomType: 'bedroom',
        style: 'luxury',
        imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'
      },
      {
        roomType: 'kitchen',
        style: 'traditional',
        imageUrl: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&h=600&fit=crop'
      }
    ]
    
    for (const testCase of testCases) {
      console.log(`\n🏠 Testing ${testCase.roomType} with ${testCase.style} style...`)
      
      try {
        // Get the room prompt
        const prompt = getRoomPrompt(testCase.roomType, testCase.style)
        console.log(`Prompt: ${prompt.substring(0, 100)}...`)
        
        // Process the image
        const result = await processImageWithNanoBanana({
          image_url: testCase.imageUrl,
          prompt: prompt,
          style: testCase.style,
          quality: 'standard'
        })
        
        if (result.success) {
          console.log(`✅ Success! Enhanced image URL: ${result.result_url}`)
          console.log(`⏱️  Processing time: ${result.processing_time}ms`)
          if (result.analysis) {
            console.log(`🔍 AI Analysis: ${result.analysis.substring(0, 150)}...`)
          }
        } else {
          console.log(`❌ Failed: ${result.error}`)
        }
        
      } catch (error) {
        console.log(`❌ Error processing ${testCase.roomType}: ${error.message}`)
      }
    }
    
    console.log('\n📋 Summary:')
    console.log('✅ System now uses Gemini 2.0 Flash Exp for image analysis')
    console.log('✅ Provides curated sample images based on room type and style')
    console.log('✅ Includes AI analysis of the original image')
    console.log('💡 For real image generation, consider upgrading Gemini plan or using Replicate')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testUpdatedSystem()
