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
  slug?: string;
  shortDescription?: string;
  instructor: User;
  thumbnail?: string;
  avatar?: string; // Course icon/avatar (256x256px)
  introVideo?: string; // Course introduction video file URL
  promoVideo?: string; // Promotional video file URL
  courseMedia?: string[]; // Additional course materials URLs
  introVideoUrl?: string; // External intro video URL (YouTube, Vimeo)
  promoVideoUrl?: string; // External promo video URL
  price: number;
  isFree?: boolean;
  isPremium?: boolean;
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  objectives?: string;
  prerequisites?: string;
  rating: number;
  totalRatings?: number;
  enrollmentCount?: number;
  completionRate?: number;
  isActive?: boolean;
  featured?: boolean;
  language?: string;
  level?: string;
  requirements?: string;
  category: string;
  lessonsCount?: number;
  studentsCount?: number;
  reviewsCount?: number;
  tags: string[];
  createdAt: string;
  updatedAt?: string;
  lessons: Lesson[];
  isEnrolled?: boolean;
  progress?: number;
}

export interface Lesson {
  id: string;
  title: string;
  slug?: string; // UID field for lessons
  description: string;
  content?: string;
  videoUrl?: string; // External video URL
  videoFile?: string; // Uploaded video file URL
  duration: number; // in minutes
  order: number;
  isCompleted?: boolean;
  materials?: Material[]; // Multiple lesson attachments and resources
  transcript?: string;
  resources?: Material[];
  quiz?: any;
  assignment?: any;
  lessonType?: 'video' | 'reading' | 'assignment' | 'quiz';
  isPreview?: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
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
  enrollmentDate: string;
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