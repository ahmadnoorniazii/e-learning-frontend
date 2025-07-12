/**
 * Test script to verify the working populate strategy
 */

export async function testWorkingPopulate() {
  const baseURL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
  const courseId = 'k1og1nzsxax7omrcxm9vrcxz';
  
  console.log('🧪 Testing working populate strategies...');
  
  const testCases = [
    {
      name: 'Just instructor',
      populate: 'instructor',
      url: `${baseURL}/api/courses/${courseId}?populate=instructor`
    },
    {
      name: 'Multiple fields',
      populate: 'instructor,category,lessons',
      url: `${baseURL}/api/courses/${courseId}?populate=instructor,category,lessons`
    },
    {
      name: 'All basic fields',
      populate: 'instructor,category,lessons,tags,thumbnail,avatar',
      url: `${baseURL}/api/courses/${courseId}?populate=instructor,category,lessons,tags,thumbnail,avatar`
    },
    {
      name: 'Wildcard',
      populate: '*',
      url: `${baseURL}/api/courses/${courseId}?populate=*`
    }
  ];
  
  for (const testCase of testCases) {
    try {
      console.log(`\n📋 Testing: ${testCase.name}`);
      console.log(`🔗 URL: ${testCase.url}`);
      
      const response = await fetch(testCase.url, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const courseData = data.data;
        
        console.log('✅ Success! Response includes:');
        console.log(`   - ID: ${courseData.id}`);
        console.log(`   - Title: ${courseData.title}`);
        console.log(`   - Instructor: ${courseData.instructor ? '✅ Present' : '❌ Missing'}`);
        console.log(`   - Category: ${courseData.category ? '✅ Present' : '❌ Missing'}`);
        console.log(`   - Lessons: ${courseData.lessons ? '✅ Present' : '❌ Missing'}`);
        console.log(`   - Tags: ${courseData.tags ? '✅ Present' : '❌ Missing'}`);
        console.log(`   - Thumbnail: ${courseData.thumbnail ? '✅ Present' : '❌ Missing'}`);
        console.log(`   - Avatar: ${courseData.avatar ? '✅ Present' : '❌ Missing'}`);
        
        if (courseData.instructor) {
          console.log(`   - Instructor details:`, {
            id: courseData.instructor?.data?.id || courseData.instructor?.id,
            username: courseData.instructor?.data?.attributes?.username || courseData.instructor?.username,
            email: courseData.instructor?.data?.attributes?.email || courseData.instructor?.email
          });
        }
        
      } else {
        console.log('❌ HTTP Error:', response.status, response.statusText);
      }
    } catch (error) {
      console.log('❌ Network Error:', error);
    }
  }
}

// Export for use in other components
export const workingPopulateStrategy = 'instructor,category,lessons,tags,thumbnail,avatar';
