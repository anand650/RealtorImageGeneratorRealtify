const fetch = require('node-fetch')

async function testImageProcessingAPI() {
  try {
    console.log('🧪 Testing image processing API endpoint...')
    
    // Test data - simulating what the frontend would send
    const testData = {
      imageId: 'test-image-123',
      roomType: 'living_room',
      style: 'modern',
      clientNotes: 'Test processing with updated Gemini system'
    }
    
    console.log('Test data:', testData)
    
    // Make request to the API endpoint
    const response = await fetch('http://localhost:3000/api/images/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: In real usage, this would include authentication headers
      },
      body: JSON.stringify(testData)
    })
    
    console.log('Response status:', response.status)
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ API Response:', JSON.stringify(result, null, 2))
      
      if (result.success) {
        console.log('🎉 Image processing completed successfully!')
        console.log('📊 Result status:', result.result?.status)
        console.log('🖼️  Enhanced image URL:', result.result?.processedUrl)
        console.log('⏱️  Processing time:', result.result?.processingTime + 'ms')
      } else {
        console.log('❌ Processing failed:', result.message)
      }
    } else {
      const errorText = await response.text()
      console.log('❌ API Error:', response.status, errorText)
      
      if (response.status === 401) {
        console.log('💡 This is expected - the API requires authentication')
        console.log('💡 In the browser, you would be signed in with Clerk')
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the development server is running: npm run dev')
    }
  }
}

// Wait a moment for the server to start, then test
setTimeout(testImageProcessingAPI, 3000)
