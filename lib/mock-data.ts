import { User, Course, Review, Progress, Certificate } from './types';
import coursesData from './courses-data.json';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'student',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    role: 'instructor',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
    createdAt: '2024-01-10'
  },
  {
    id: '3',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
    createdAt: '2024-01-01'
  }
];

// Import course data from JSON file
export const mockCourses: Course[] = coursesData.courses;

export const getMockCoursesByCategory = (category: string) => {
  if (category === 'All Categories') {
    return mockCourses;
  }
  return mockCourses.filter(course => course.category === category);
};

export const mockReviews: Review[] = [
  {
    id: '1',
    userId: '1',
    userName: 'John Doe',
    userAvatar: mockUsers[0].avatar,
    courseId: '1',
    rating: 5,
    comment: 'Excellent course! The instructor explains complex concepts very clearly.',
    createdAt: '2024-01-28'
  },
  {
    id: '2',
    userId: '1',
    userName: 'John Doe',
    userAvatar: mockUsers[0].avatar,
    courseId: '2',
    rating: 4,
    comment: 'Great introduction to Python for data science. Very practical examples.',
    createdAt: '2024-01-26'
  }
];

export const mockProgress: Progress[] = [
  {
    courseId: '1',
    completedLessons: ['1-1', '1-2'],
    totalLessons: 3,
    percentage: 67,
    lastAccessed: '2024-01-28'
  },
  {
    courseId: '2',
    completedLessons: ['2-1'],
    totalLessons: 2,
    percentage: 50,
    lastAccessed: '2024-01-27'
  }
];

export const mockCertificates: Certificate[] = [
  {
    id: '1',
    courseId: '3',
    courseName: 'UI/UX Design Masterclass',
    userId: '1',
    userName: 'John Doe',
    completedAt: '2024-01-25',
    certificateUrl: '#'
  }
];

// Current user simulation - this will be replaced by auth context
export const currentUser = mockUsers[0]; // Student by default