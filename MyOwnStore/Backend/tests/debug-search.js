const axios = require('axios');

async function debugSearchSuggestions() {
  try {
    console.log('🔍 Testing Search Suggestions with detailed logging...');
    
    // Test with a simple query
    const response = await axios.get('http://localhost:5000/api/products/search/suggestions?q=te', {
      validateStatus: function (status) {
        return status < 500; // Accept any status code less than 500
      }
    });
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('Error:', error.response?.data || error.message);
  }
}

debugSearchSuggestions();
