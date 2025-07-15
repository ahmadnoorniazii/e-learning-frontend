/**
 * Test script for profile API endpoints
 * Run with: node test-profile-api.js
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:1337';

async function testProfileAPI() {
  console.log('🧪 Testing Profile API endpoints...\n');

  // Test 1: Check if server is running
  try {
    const healthCheck = await fetch(`${BACKEND_URL}/api/user-profiles`);
    console.log('✅ Server is running');
    console.log('Status:', healthCheck.status);
  } catch (error) {
    console.error('❌ Server not accessible:', error.message);
    return;
  }

  // Test 2: Check authentication endpoint
  try {
    const authResponse = await fetch(`${BACKEND_URL}/api/auth/local`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: 'john.doe@elearning.com',
        password: 'Password123!'
      })
    });

    if (authResponse.ok) {
      const authData = await authResponse.json();
      console.log('✅ Authentication successful');
      console.log('JWT Token:', authData.jwt ? 'Present' : 'Missing');
      console.log('User ID:', authData.user?.id);
      
      // Test 3: Get user profile with token
      const profileResponse = await fetch(`${BACKEND_URL}/api/user-profiles?filters[user][id][$eq]=${authData.user.id}&populate[0]=user&populate[1]=avatar`, {
        headers: {
          'Authorization': `Bearer ${authData.jwt}`,
          'Content-Type': 'application/json',
        }
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        console.log('✅ Profile fetch successful');
        console.log('Profile data:', profileData.data ? 'Found' : 'Not found');
        
        if (profileData.data && profileData.data[0]) {
          const profileId = profileData.data[0].id;
          console.log('Profile ID:', profileId);
          
          // Test 4: Update profile
          const updateData = {
            bio: 'Test bio update',
            expertise: ['Test Expertise 1', 'Test Expertise 2']
          };

          const updateResponse = await fetch(`${BACKEND_URL}/api/user-profiles/${profileId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${authData.jwt}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              data: updateData
            })
          });

          if (updateResponse.ok) {
            console.log('✅ Profile update successful');
          } else {
            const errorText = await updateResponse.text();
            console.error('❌ Profile update failed:', updateResponse.status, errorText);
          }
        }
      } else {
        const errorText = await profileResponse.text();
        console.error('❌ Profile fetch failed:', profileResponse.status, errorText);
      }
    } else {
      const errorText = await authResponse.text();
      console.error('❌ Authentication failed:', authResponse.status, errorText);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testProfileAPI(); 