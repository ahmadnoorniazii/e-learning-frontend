export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  avatar?: string;
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: User;
  thumbnail: string;
  price: number;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  lessonsCount: number;
  studentsCount: number;
  rating: number;
  reviewsCount: number;
  tags: string[];
  createdAt: string;
  lessons: Lesson[];
  isEnrolled?: boolean;
  progress?: number;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  duration: number; // in minutes
  order: number;
  isCompleted?: boolean;
  materials?: Material[];
}

export interface Material {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'image' | 'text';
  url: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  courseId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Progress {
  courseId: string;
  completedLessons: string[];
  totalLessons: number;
  percentage: number;
  lastAccessed: string;
}

export interface Certificate {
  id: string;
  courseId: string;
  courseName: string;
  userId: string;
  userName: string;
  completedAt: string;
  certificateUrl: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  status: 'active' | 'completed' | 'cancelled';
}

export interface Order {
  id: string;
  userId: string;
  courseId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  createdAt: string;
}