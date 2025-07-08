import { User, Course, Review, Progress, Certificate } from './types';

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

// Mock course data for when Strapi is not available
export const mockCourses = [
  {
    id: '1',
    title: 'Complete Web Development Bootcamp',
    description: 'Learn HTML, CSS, JavaScript, React, Node.js and more in this comprehensive course.',
    instructor: {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      role: 'instructor' as const,
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
      createdAt: new Date().toISOString()
    },
    thumbnail: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 99.99,
    category: 'Web Development',
    level: 'beginner' as const,
    duration: 40,
    lessonsCount: 120,
    studentsCount: 15420,
    rating: 4.8,
    reviewsCount: 2341,
    tags: ['HTML', 'CSS', 'JavaScript', 'React'],
    createdAt: new Date().toISOString(),
    lessons: []
  },
  {
    id: '2',
    title: 'Data Science with Python',
    description: 'Master data analysis, visualization, and machine learning with Python.',
    instructor: {
      id: '2',
      name: 'Dr. Michael Chen',
      email: 'michael@example.com',
      role: 'instructor' as const,
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
      createdAt: new Date().toISOString()
    },
    thumbnail: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 129.99,
    category: 'Data Science',
    level: 'intermediate' as const,
    duration: 35,
    lessonsCount: 95,
    studentsCount: 8750,
    rating: 4.9,
    reviewsCount: 1876,
    tags: ['Python', 'Pandas', 'NumPy', 'Machine Learning'],
    createdAt: new Date().toISOString(),
    lessons: []
  },
  {
    id: '3',
    title: 'UI/UX Design Fundamentals',
    description: 'Learn the principles of user interface and user experience design.',
    instructor: {
      id: '3',
      name: 'Emma Rodriguez',
      email: 'emma@example.com',
      role: 'instructor' as const,
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
      createdAt: new Date().toISOString()
    },
    thumbnail: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 79.99,
    category: 'Design',
    level: 'beginner' as const,
    duration: 25,
    lessonsCount: 68,
    studentsCount: 12300,
    rating: 4.7,
    reviewsCount: 1543,
    tags: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
    createdAt: new Date().toISOString(),
    lessons: []
  },
  {
    id: '4',
    title: 'Digital Marketing Mastery',
    description: 'Complete guide to digital marketing including SEO, social media, and PPC.',
    instructor: {
      id: '4',
      name: 'James Wilson',
      email: 'james@example.com',
      role: 'instructor' as const,
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
      createdAt: new Date().toISOString()
    },
    thumbnail: 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 89.99,
    category: 'Marketing',
    level: 'intermediate' as const,
    duration: 30,
    lessonsCount: 85,
    studentsCount: 9650,
    rating: 4.6,
    reviewsCount: 1287,
    tags: ['SEO', 'Google Ads', 'Social Media', 'Analytics'],
    createdAt: new Date().toISOString(),
    lessons: []
  },
  {
    id: '5',
    title: 'Business Strategy & Leadership',
    description: 'Develop essential business and leadership skills for career advancement.',
    instructor: {
      id: '5',
      name: 'Lisa Thompson',
      email: 'lisa@example.com',
      role: 'instructor' as const,
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150',
      createdAt: new Date().toISOString()
    },
    thumbnail: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 149.99,
    category: 'Business',
    level: 'advanced' as const,
    duration: 45,
    lessonsCount: 110,
    studentsCount: 6420,
    rating: 4.8,
    reviewsCount: 892,
    tags: ['Strategy', 'Leadership', 'Management', 'Communication'],
    createdAt: new Date().toISOString(),
    lessons: []
  },
  {
    id: '6',
    title: 'Photography Masterclass',
    description: 'From basics to advanced techniques in digital photography.',
    instructor: {
      id: '6',
      name: 'Alex Parker',
      email: 'alex@example.com',
      role: 'instructor' as const,
      avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150',
      createdAt: new Date().toISOString()
    },
    thumbnail: 'https://images.pexels.com/photos/606541/pexels-photo-606541.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 69.99,
    category: 'Photography',
    level: 'beginner' as const,
    duration: 28,
    lessonsCount: 75,
    studentsCount: 11200,
    rating: 4.9,
    reviewsCount: 1654,
    tags: ['DSLR', 'Composition', 'Lighting', 'Post-processing'],
    createdAt: new Date().toISOString(),
    lessons: []
  }
];

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