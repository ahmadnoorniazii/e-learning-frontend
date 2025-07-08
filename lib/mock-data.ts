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

export const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Complete React Development Course',
    description: 'Master React from fundamentals to advanced concepts. Build real-world projects and learn modern React patterns, hooks, and best practices.',
    instructor: mockUsers[1],
    thumbnail: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 99.99,
    category: 'Web Development',
    level: 'intermediate',
    duration: 1200, // 20 hours
    lessonsCount: 24,
    studentsCount: 1542,
    rating: 4.8,
    reviewsCount: 234,
    tags: ['React', 'JavaScript', 'Frontend', 'Web Development'],
    createdAt: '2024-01-20',
    isEnrolled: true,
    lessons: [
      {
        id: '1-1',
        title: 'Introduction to React',
        description: 'Learn the basics of React and why it\'s popular',
        duration: 45,
        order: 1
      },
      {
        id: '1-2',
        title: 'JSX and Components',
        description: 'Understanding JSX syntax and creating components',
        duration: 60,
        order: 2
      },
      {
        id: '1-3',
        title: 'State and Props',
        description: 'Managing component state and passing data with props',
        duration: 50,
        order: 3
      }
    ]
  },
  {
    id: '2',
    title: 'Python for Data Science',
    description: 'Learn Python programming specifically for data science applications. Cover pandas, numpy, matplotlib, and machine learning basics.',
    instructor: mockUsers[1],
    thumbnail: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 79.99,
    category: 'Data Science',
    level: 'beginner',
    duration: 900, // 15 hours
    lessonsCount: 18,
    studentsCount: 892,
    rating: 4.6,
    reviewsCount: 156,
    tags: ['Python', 'Data Science', 'Analytics', 'Machine Learning'],
    createdAt: '2024-01-18',
    isEnrolled: true,
    lessons: [
      {
        id: '2-1',
        title: 'Python Fundamentals',
        description: 'Basic Python syntax and concepts',
        duration: 60,
        order: 1
      },
      {
        id: '2-2',
        title: 'Working with Data',
        description: 'Introduction to pandas and data manipulation',
        duration: 75,
        order: 2
      }
    ]
  },
  {
    id: '3',
    title: 'UI/UX Design Masterclass',
    description: 'Complete guide to user interface and user experience design. Learn design thinking, prototyping, and creating beautiful, functional designs.',
    instructor: mockUsers[1],
    thumbnail: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 89.99,
    category: 'Design',
    level: 'intermediate',
    duration: 1080, // 18 hours
    lessonsCount: 21,
    studentsCount: 1234,
    rating: 4.9,
    reviewsCount: 298,
    tags: ['UI Design', 'UX Design', 'Figma', 'Prototyping'],
    createdAt: '2024-01-22',
    lessons: [
      {
        id: '3-1',
        title: 'Design Principles',
        description: 'Fundamental principles of good design',
        duration: 45,
        order: 1
      },
      {
        id: '3-2',
        title: 'User Research',
        description: 'Understanding your users through research',
        duration: 55,
        order: 2
      }
    ]
  },
  {
    id: '4',
    title: 'Digital Marketing Strategy',
    description: 'Comprehensive digital marketing course covering SEO, social media, content marketing, and analytics to grow your business online.',
    instructor: mockUsers[1],
    thumbnail: 'https://images.pexels.com/photos/270637/pexels-photo-270637.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 69.99,
    category: 'Marketing',
    level: 'beginner',
    duration: 720, // 12 hours
    lessonsCount: 15,
    studentsCount: 756,
    rating: 4.5,
    reviewsCount: 123,
    tags: ['Digital Marketing', 'SEO', 'Social Media', 'Analytics'],
    createdAt: '2024-01-25',
    lessons: [
      {
        id: '4-1',
        title: 'Marketing Fundamentals',
        description: 'Introduction to digital marketing concepts',
        duration: 40,
        order: 1
      }
    ]
  }
];

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