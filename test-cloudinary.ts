import { config, v2 as cloudinary } from 'cloudinary';

// Load environment variables
require('dotenv').config();

console.log('Testing Cloudinary Configuration...');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'Present' : 'Missing');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'Present' : 'Missing'); 
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? process.env.CLOUDINARY_API_SECRET.substring(0, 4) + '...' : 'Missing');

// Configure Cloudinary
config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testUpload() {
  try {
    // Attempt a simple API call to check credentials
    const response = await cloudinary.api.ping();
    
    console.log('\n✓ Cloudinary connection successful!');
    console.log('Response:', response);
    
    // Test upload with a placeholder
    // Since we don't have an actual image here, we'll just test the configuration
    console.log('\n✓ Cloudinary configuration test passed');
  } catch (error) {
    console.error('\n✗ Cloudinary connection failed:');
    console.error('Error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        console.error('Possible causes: Network issue or firewall blocking the connection');
      } else if (error.message.includes('Unauthorized') || error.message.includes('authentication')) {
        console.error('Possible causes: Invalid API Key or API Secret');
      } else if (error.message.includes('not found') || error.message.includes('does not exist')) {
        console.error('Possible causes: Invalid Cloud Name');
      }
    }
  }
}

testUpload();