const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3001';

// Test data for updating
const testUpdateData = {
  notes: "Updated meal notes with location 📍 Home\nThis is an updated note",
  mealType: "Lunch"
};

// Test functions
async function testUpdateFood(foodId, token) {
  try {
    console.log('\n=== Testing PATCH /food/:id ===');
    console.log('Food ID:', foodId);
    console.log('Update data:', JSON.stringify(testUpdateData, null, 2));

    const response = await fetch(`${API_BASE_URL}/food/${foodId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testUpdateData)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.json();
      console.log('✅ UPDATE Success! Response data:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.error('❌ UPDATE Error response:', errorText);
    }
  } catch (error) {
    console.error('❌ UPDATE Request failed:', error);
  }
}

async function testDeleteFood(foodId, token) {
  try {
    console.log('\n=== Testing DELETE /food/:id ===');
    console.log('Food ID:', foodId);

    const response = await fetch(`${API_BASE_URL}/food/${foodId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.json();
      console.log('✅ DELETE Success! Response data:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.error('❌ DELETE Error response:', errorText);
    }
  } catch (error) {
    console.error('❌ DELETE Request failed:', error);
  }
}

async function testGetFoods(token) {
  try {
    console.log('\n=== Testing GET /food (List all foods) ===');

    const response = await fetch(`${API_BASE_URL}/food`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    console.log('Response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ GET Success! Found', data.length, 'foods');
      if (data.length > 0) {
        console.log('First food item:', JSON.stringify(data[0], null, 2));
        return data[0].id; // Return first food ID for testing
      }
    } else {
      const errorText = await response.text();
      console.error('❌ GET Error response:', errorText);
    }
  } catch (error) {
    console.error('❌ GET Request failed:', error);
  }
  return null;
}

// Test without auth (should fail with 401)
async function testWithoutAuth() {
  try {
    console.log('\n=== Testing UPDATE without auth (should return 401) ===');
    
    const response = await fetch(`${API_BASE_URL}/food/dummy-id`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
        // No Authorization header
      },
      body: JSON.stringify(testUpdateData)
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
    console.log('=== Testing server health ===');
    
    const response = await fetch(API_BASE_URL);
    console.log('Health check status:', response.status);
    
    if (response.ok) {
      const text = await response.text();
      console.log('Health response:', text);
    }
  } catch (error) {
    console.error('Health check failed:', error);
  }
}

// Main test runner
async function runTests() {
  await testServerHealth();
  await testWithoutAuth();
  
  console.log('\n' + '='.repeat(50));
  console.log('🔧 To test with real JWT token:');
  console.log('1. Get a JWT token from your app login');
  console.log('2. Replace YOUR_JWT_TOKEN_HERE in the script');
  console.log('3. Uncomment the test lines below');
  console.log('='.repeat(50));
  
  // Uncomment these lines when you have a real JWT token
  // const token = 'YOUR_JWT_TOKEN_HERE';
  // const foodId = await testGetFoods(token);
  // if (foodId) {
  //   await testUpdateFood(foodId, token);
  //   // Be careful with delete - it will actually delete the food!
  //   // await testDeleteFood(foodId, token);
  // }
}

runTests(); 