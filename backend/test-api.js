const fetch = require('node-fetch');

// Test data matching CreateFoodDto structure
const testFoodData = {
  identifiedFood: "Test Food Item",
  image: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
  mealType: "Breakfast",
  notes: "Test meal notes",
  portionSize: "1 serving",
  recognizedServingSize: "100g",
  nutritionFactsPerPortion: {
    calories: "250",
    protein: "15g",
    carbs: "30g",
    fat: "8g",
    fiber: "5g",
    sugar: "10g"
  },
  additionalNotes: ["Test note 1", "Test note 2"],
  timestamp: new Date().toISOString()
};

// Test function
async function testCreateFood() {
  try {
    console.log('Testing POST /food endpoint...');
    console.log('Test data:', JSON.stringify(testFoodData, null, 2));

    const response = await fetch('http://localhost:3001/food', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // You need to replace this with a real JWT token
        'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE'
      },
      body: JSON.stringify(testFoodData)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.json();
      console.log('Success! Response data:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.error('Error response:', errorText);
    }
  } catch (error) {
    console.error('Request failed:', error);
  }
}

// Test without auth (should fail with 401)
async function testWithoutAuth() {
  try {
    console.log('\nTesting without auth (should return 401)...');
    
    const response = await fetch('http://localhost:3001/food', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // No Authorization header
      },
      body: JSON.stringify(testFoodData)
    });

    console.log('Response status:', response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.log('Expected error response:', errorText);
    }
  } catch (error) {
    console.error('Request failed:', error);
  }
}

// Test server health
async function testServerHealth() {
  try {
    console.log('Testing server health...');
    
    const response = await fetch('http://localhost:3001');
    console.log('Health check status:', response.status);
    
    if (response.ok) {
      const text = await response.text();
      console.log('Health response:', text);
    }
  } catch (error) {
    console.error('Health check failed:', error);
  }
}

// Run all tests
async function runTests() {
  await testServerHealth();
  await testWithoutAuth();
  // await testCreateFood(); // Uncomment when you have a real JWT token
}

runTests(); 