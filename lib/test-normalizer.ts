/**
 * Test the course data normalizer with sample API response
 */

import { normalizeCourseData } from './course-data-normalizer';

// Sample API response similar to what you provided
const sampleApiResponse = {
  "id": 21,
  "documentId": "b6xk06dnvf3q5gv1hxa07zmo",
  "title": "Complete Web Development Bootcamp 2024",
  "description": "Master HTML, CSS, JavaScript, React, Node.js, and MongoDB. Build 15+ real-world projects and become a full-stack developer. This comprehensive course covers everything from frontend basics to backend APIs, databases, and deployment strategies.",
  "slug": null,
  "shortDescription": "Become a full-stack developer with this comprehensive bootcamp covering HTML, CSS, JavaScript, React, and Node.js",
  "introVideoUrl": "https://www.youtube.com/watch?v=UB1O30fR-EE",
  "promoVideoUrl": "https://vimeo.com/123456789",
  "price": 199.99,
  "isFree": false,
  "isPremium": true,
  "difficultyLevel": "beginner",
  "duration": 4800,
  "objectives": "Build 15+ real-world projects, master full-stack development, learn industry best practices, understand modern development workflows",
  "prerequisites": "Basic computer skills and enthusiasm to learn programming",
  "rating": 0,
  "totalRatings": 0,
  "enrollmentCount": 0,
  "completionRate": 78.5,
  "isActive": true,
  "createdAt": "2025-07-11T06:23:31.946Z",
  "updatedAt": "2025-07-11T06:23:35.781Z",
  "publishedAt": "2025-07-11T06:23:35.789Z"
};

// Test the normalizer
console.log('Testing course data normalizer...');

try {
  const normalizedCourse = normalizeCourseData(sampleApiResponse, 'http://localhost:1337');
  
  console.log('✅ Normalization successful!');
  console.log('Normalized course:', {
    id: normalizedCourse.id,
    title: normalizedCourse.title,
    instructor: normalizedCourse.instructor,
    price: normalizedCourse.price,
    category: normalizedCourse.category,
    level: normalizedCourse.level,
    duration: normalizedCourse.duration,
    rating: normalizedCourse.rating,
    studentsCount: normalizedCourse.studentsCount,
    lessonsCount: normalizedCourse.lessonsCount,
    tags: normalizedCourse.tags
  });
  
} catch (error) {
  console.error('❌ Normalization failed:', error);
}

// Test with populated instructor data
const sampleWithInstructor = {
  ...sampleApiResponse,
  instructor: {
    data: {
      id: 1,
      attributes: {
        username: "john_instructor",
        email: "john@example.com",
        avatar: {
          url: "/uploads/instructor_avatar.jpg"
        }
      }
    }
  },
  category: {
    data: {
      id: 1,
      attributes: {
        name: "Web Development",
        slug: "web-development"
      }
    }
  }
};

console.log('\nTesting with populated data...');

try {
  const normalizedWithPopulated = normalizeCourseData(sampleWithInstructor, 'http://localhost:1337');
  
  console.log('✅ Populated data normalization successful!');
  console.log('Instructor:', normalizedWithPopulated.instructor);
  console.log('Category:', normalizedWithPopulated.category);
  
} catch (error) {
  console.error('❌ Populated data normalization failed:', error);
}

export { sampleApiResponse, sampleWithInstructor };
