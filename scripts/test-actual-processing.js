#!/usr/bin/env node

/**
 * Test script to verify the actual image processing function works
 */

const { processImageWithNanoBanana, getRoomPrompt } = require('../src/lib/nano-banana.ts');

async function testActualProcessing() {
  console.log('🧪 Testing actual image processing function...\n');

  try {
    // Use a sample room image URL
    const sampleImageUrl = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop';
    
    // Get room prompt
    const roomType = 'living_room';
    const style = 'modern';
    const prompt = getRoomPrompt(roomType, style);
    
    console.log('📋 Test Parameters:');
    console.log('- Image URL:', sampleImageUrl);
    console.log('- Room Type:', roomType);
    console.log('- Style:', style);
    console.log('- Prompt:', prompt.substring(0, 100) + '...\n');
    
    console.log('🚀 Starting image processing...');
    const startTime = Date.now();
    
    const result = await processImageWithNanoBanana({
      image_url: sampleImageUrl,
      prompt: prompt,
      style: 'photorealistic',
      quality: 'standard'
    });
    
    const processingTime = Date.now() - startTime;
    
    console.log('\n📊 Processing Results:');
    console.log('- Success:', result.success);
    console.log('- Processing Time:', processingTime + 'ms');
    
    if (result.success) {
      console.log('- Result URL:', result.result_url);
      console.log('- URL Type:', result.result_url?.startsWith('http') ? 'External URL' : 'S3 Key');
      console.log('✅ Image processing completed successfully!');
    } else {
      console.log('- Error:', result.error);
      console.log('- Error Code:', result.errorCode);
      console.log('❌ Image processing failed');
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testActualProcessing();
