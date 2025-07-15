// Test script to verify enrollment API with proper populate
const testEnrollmentAPI = async () => {
  const baseURL = 'http://localhost:1337';
  const userId = 23; // Replace with actual user ID
  const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjMsImlhdCI6MTc1MjU4ODI2NywiZXhwIjoxNzUzMTkzMDY3fQ.RBflXT4aw_eWa0SWWfCXFbBe0bhdwUXLZ3tICfw1-jA'; // Replace with actual token

  const url = new URL(`${baseURL}/api/enrollments`);
  
  // Add query parameters
  url.searchParams.append('pagination[pageSize]', '100');
  url.searchParams.append('populate[0]', 'course');
  url.searchParams.append('populate[1]', 'course.instructor');
  url.searchParams.append('populate[2]', 'course.category');
  url.searchParams.append('populate[3]', 'course.lessons');
  url.searchParams.append('populate[4]', 'course.thumbnail');
  url.searchParams.append('populate[5]', 'course.avatar');
  url.searchParams.append('filters[student][id][0]', userId.toString());

  console.log('🔍 Testing enrollment API with URL:', url.toString());

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': '*/*',
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('✅ API Response received');
    console.log('📊 Number of enrollments:', data.data?.length || 0);
    
    if (data.data && data.data.length > 0) {
      const enrollment = data.data[0];
      console.log('🔍 First enrollment sample:');
      console.log('  - Course ID:', enrollment.course?.id);
      console.log('  - Course DocumentID:', enrollment.course?.documentId);
      console.log('  - Course Title:', enrollment.course?.title);
      console.log('  - Has Thumbnail:', !!enrollment.course?.thumbnail);
      console.log('  - Thumbnail URL:', enrollment.course?.thumbnail?.url);
      console.log('  - Has Avatar:', !!enrollment.course?.avatar);
      console.log('  - Instructor:', enrollment.course?.instructor?.username);
      console.log('  - Category:', enrollment.course?.category?.name);
    }

  } catch (error) {
    console.error('❌ Error testing enrollment API:', error);
  }
};

// Uncomment to run the test
// testEnrollmentAPI();

module.exports = { testEnrollmentAPI };
