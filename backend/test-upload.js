// backend/test-upload.js
const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');

async function testUpload() {
  const token = 'YOUR_AUTH_TOKEN_HERE'; // Get this by logging in first
  
  const form = new FormData();
  form.append('images', fs.createReadStream('./test-image.jpg')); // Create a test image
  
  try {
    const response = await fetch('http://localhost:5001/api/upload/images', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: form
    });
    
    const data = await response.json();
    console.log('Upload result:', data);
  } catch (error) {
    console.error('Test error:', error);
  }
}

testUpload();