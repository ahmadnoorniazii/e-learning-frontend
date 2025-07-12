/**
 * API Diagnostic Tool
 * Test different populate strategies to find what works with the current API
 */

import { apiClient } from './api-client';

export async function testCoursePopulateStrategies(courseId: string) {
  const baseURL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
  
  console.log('🔍 Testing different populate strategies for course:', courseId);
  
  const strategies = [
    {
      name: 'No populate',
      populate: undefined
    },
    {
      name: 'Simple populate (array)',
      populate: ['instructor', 'category', 'lessons', 'tags', 'thumbnail', 'avatar']
    },
    {
      name: 'Simple populate (string)',
      populate: 'instructor,category,lessons,tags,thumbnail,avatar'
    },
    {
      name: 'Wildcard populate',
      populate: '*'
    },
    {
      name: 'Deep populate (object)',
      populate: {
        instructor: true,
        category: true,
        lessons: true,
        tags: true,
        thumbnail: true,
        avatar: true
      }
    },
    {
      name: 'Deep populate with nested',
      populate: {
        instructor: {
          populate: ['profile', 'avatar']
        },
        category: true,
        lessons: {
          populate: ['videoFile', 'resources']
        },
        tags: true,
        thumbnail: true,
        avatar: true
      }
    }
  ];

  const results = [];

  for (const strategy of strategies) {
    try {
      console.log(`\n📋 Testing: ${strategy.name}`);
      const response = await apiClient.getCourse(courseId, strategy.populate);
      
      const hasInstructor = !!(response.data as any).instructor;
      const hasCategory = !!(response.data as any).category;
      const hasLessons = !!(response.data as any).lessons;
      const hasTags = !!(response.data as any).tags;
      const hasThumbnail = !!(response.data as any).thumbnail;

      const result = {
        strategy: strategy.name,
        success: true,
        hasInstructor,
        hasCategory,
        hasLessons,
        hasTags,
        hasThumbnail,
        dataKeys: Object.keys(response.data),
        sampleData: {
          instructor: (response.data as any).instructor ? 'Present' : 'Missing',
          category: (response.data as any).category ? 'Present' : 'Missing',
          lessons: (response.data as any).lessons ? 'Present' : 'Missing',
          tags: (response.data as any).tags ? 'Present' : 'Missing'
        }
      };

      results.push(result);
      console.log('✅ Success:', result);

    } catch (error) {
      const result = {
        strategy: strategy.name,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      results.push(result);
      console.log('❌ Failed:', result);
    }
  }

  console.log('\n📊 Summary of all strategies:');
  results.forEach(result => {
    if (result.success) {
      console.log(`${result.strategy}: ✅ Success - Instructor: ${(result as any).hasInstructor}, Category: ${(result as any).hasCategory}, Lessons: ${(result as any).hasLessons}`);
    } else {
      console.log(`${result.strategy}: ❌ Failed - ${(result as any).error}`);
    }
  });

  return results;
}

export async function testDirectAPICall(courseId: string) {
  const baseURL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
  
  const testUrls = [
    `/api/courses/${courseId}`,
    `/api/courses/${courseId}?populate=*`,
    `/api/courses/${courseId}?populate[instructor]=*&populate[category]=*&populate[lessons]=*`,
    `/api/courses/${courseId}?populate=instructor,category,lessons,tags`
  ];

  console.log('🌐 Testing direct API calls...');

  for (const url of testUrls) {
    try {
      console.log(`\n📡 Testing: ${baseURL}${url}`);
      const response = await fetch(`${baseURL}${url}`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Response keys:', Object.keys(data.data || data));
        console.log('📋 Has instructor:', !!(data.data?.instructor || data.instructor));
        console.log('📋 Has category:', !!(data.data?.category || data.category));
        console.log('📋 Has lessons:', !!(data.data?.lessons || data.lessons));
      } else {
        console.log('❌ HTTP Error:', response.status, response.statusText);
      }
    } catch (error) {
      console.log('❌ Network Error:', error);
    }
  }
}
