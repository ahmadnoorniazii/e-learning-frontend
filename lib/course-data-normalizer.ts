/**
 * Course Data Normalizer
 * Utility functions to normalize course data from different API response formats
 */

import { Course, User, Review } from './types';

export interface RawCourseData {
  id: number;
  documentId?: string;
  title: string;
  description?: string;
  thumbnail?: { url?: string };
  avatar?: { url?: string };
  price: number;
  difficultyLevel?: string;
  duration: number;
  rating: number;
  totalRatings?: number;
  enrollmentCount?: number;
  createdAt: string;
  instructor?: any; // Can be populated or just an ID
  category?: any; // Can be populated or just an ID
  lessons?: any; // Can be populated or just an array
  tags?: any; // Can be populated or just an array
  [key: string]: any;
}

export interface RawReviewData {
  id: number;
  documentId?: string;
  rating: number;
  comment?: string;
  createdAt: string;
  student?: any; // Can be populated or just an ID
  [key: string]: any;
}

export function normalizeCourseData(rawCourse: RawCourseData, baseURL: string = ''): Course {
  // Log what data we received to help with debugging
  console.log('🔍 Normalizing course data:', {
    id: rawCourse.id,
    documentId: rawCourse.documentId,
    title: rawCourse.title,
    hasInstructor: !!rawCourse.instructor,
    hasCategory: !!rawCourse.category,
    hasLessons: !!rawCourse.lessons,
    hasTags: !!rawCourse.tags,
    availableKeys: Object.keys(rawCourse)
  });

  return {
    id: rawCourse.documentId || rawCourse.id.toString(),
    title: rawCourse.title,
    description: rawCourse.description || '',
    instructor: normalizeInstructorData(rawCourse.instructor),
    thumbnail: rawCourse.thumbnail?.url ? `${baseURL}${rawCourse.thumbnail.url}` : undefined,
    avatar: rawCourse.avatar?.url ? `${baseURL}${rawCourse.avatar.url}` : undefined,
    price: rawCourse.price || 0,
    category: normalizeCategoryData(rawCourse.category),
    level: (rawCourse.difficultyLevel as 'beginner' | 'intermediate' | 'advanced') || 'beginner',
    duration: rawCourse.duration || 0,
    lessonsCount: normalizeLessonsCount(rawCourse.lessons),
    studentsCount: rawCourse.enrollmentCount || 0,
    rating: rawCourse.rating || 0,
    reviewsCount: rawCourse.totalRatings || 0,
    tags: normalizeTagsData(rawCourse.tags),
    createdAt: rawCourse.createdAt,
    lessons: normalizeLessonsData(rawCourse.lessons)
  };
}

function normalizeInstructorData(instructor: any): User {
  if (!instructor) {
    return {
      id: '1',
      name: 'Unknown Instructor',
      email: '',
      role: 'instructor',
      createdAt: new Date().toISOString()
    };
  }

  // Handle populated instructor (Strapi v4 format)
  if (instructor.data && instructor.data.attributes) {
    return {
      id: instructor.data.id.toString(),
      name: instructor.data.attributes.username || instructor.data.attributes.name || 'Unknown Instructor',
      email: instructor.data.attributes.email || '',
      role: 'instructor',
      avatar: instructor.data.attributes.avatar?.url ? instructor.data.attributes.avatar.url : undefined,
      createdAt: instructor.data.attributes.createdAt || new Date().toISOString()
    };
  }

  // Handle direct instructor object
  if (instructor.id || instructor.username || instructor.name) {
    return {
      id: instructor.id?.toString() || '1',
      name: instructor.username || instructor.name || 'Unknown Instructor',
      email: instructor.email || '',
      role: 'instructor',
      avatar: instructor.avatar?.url || instructor.avatar,
      createdAt: instructor.createdAt || new Date().toISOString()
    };
  }

  // Handle just instructor ID
  if (typeof instructor === 'number' || typeof instructor === 'string') {
    return {
      id: instructor.toString(),
      name: 'Unknown Instructor',
      email: '',
      role: 'instructor',
      createdAt: new Date().toISOString()
    };
  }

  return {
    id: '1',
    name: 'Unknown Instructor',
    email: '',
    role: 'instructor',
    createdAt: new Date().toISOString()
  };
}

function normalizeCategoryData(category: any): string {
  if (!category) return 'Uncategorized';

  // Handle populated category (Strapi v4 format)
  if (category.data && category.data.attributes) {
    return category.data.attributes.name || 'Uncategorized';
  }

  // Handle direct category object
  if (category.name) {
    return category.name;
  }

  // Handle just category string
  if (typeof category === 'string') {
    return category;
  }

  return 'Uncategorized';
}

function normalizeTagsData(tags: any): string[] {
  if (!tags) return [];

  // Handle populated tags (Strapi v4 format)
  if (tags.data && Array.isArray(tags.data)) {
    return tags.data.map((tag: any) => tag.attributes?.name || tag.name || '').filter(Boolean);
  }

  // Handle direct tags array
  if (Array.isArray(tags)) {
    return tags.map((tag: any) => {
      if (typeof tag === 'string') return tag;
      return tag.name || tag.attributes?.name || '';
    }).filter(Boolean);
  }

  return [];
}

function normalizeLessonsCount(lessons: any): number {
  if (!lessons) return 0;

  // Handle populated lessons (Strapi v4 format)
  if (lessons.data && Array.isArray(lessons.data)) {
    return lessons.data.length;
  }

  // Handle direct lessons array
  if (Array.isArray(lessons)) {
    return lessons.length;
  }

  return 0;
}

function normalizeLessonsData(lessons: any): any[] {
  if (!lessons) return [];

  // Handle populated lessons (Strapi v4 format)
  if (lessons.data && Array.isArray(lessons.data)) {
    return lessons.data.map((lesson: any, index: number) => ({
      id: lesson.id?.toString() || lesson.documentId || index.toString(),
      title: lesson.attributes?.title || lesson.title || `Lesson ${index + 1}`,
      description: lesson.attributes?.description || lesson.description || '',
      duration: lesson.attributes?.duration || lesson.duration || 0,
      order: lesson.attributes?.sortOrder || lesson.attributes?.order || lesson.sortOrder || lesson.order || index,
      videoUrl: lesson.attributes?.videoUrl || lesson.videoUrl
    }));
  }

  // Handle direct lessons array
  if (Array.isArray(lessons)) {
    return lessons.map((lesson: any, index: number) => ({
      id: lesson.id?.toString() || lesson.documentId || index.toString(),
      title: lesson.title || `Lesson ${index + 1}`,
      description: lesson.description || '',
      duration: lesson.duration || 0,
      order: lesson.sortOrder || lesson.order || index,
      videoUrl: lesson.videoUrl
    }));
  }

  return [];
}

export function normalizeReviewData(rawReview: RawReviewData, courseId: string, baseURL: string = ''): Review {
  return {
    id: rawReview.id?.toString() || rawReview.documentId || '',
    userId: normalizeStudentId(rawReview.student),
    userName: normalizeStudentName(rawReview.student),
    userAvatar: normalizeStudentAvatar(rawReview.student, baseURL),
    courseId,
    rating: rawReview.rating || 0,
    comment: rawReview.comment || '',
    createdAt: rawReview.createdAt || new Date().toISOString()
  };
}

function normalizeStudentId(student: any): string {
  if (!student) return '1';

  // Handle populated student (Strapi v4 format)
  if (student.data && student.data.id) {
    return student.data.id.toString();
  }

  // Handle direct student object
  if (student.id) {
    return student.id.toString();
  }

  // Handle just student ID
  if (typeof student === 'number' || typeof student === 'string') {
    return student.toString();
  }

  return '1';
}

function normalizeStudentName(student: any): string {
  if (!student) return 'Anonymous User';

  // Handle populated student (Strapi v4 format)
  if (student.data && student.data.attributes) {
    return student.data.attributes.username || student.data.attributes.name || 'Anonymous User';
  }

  // Handle direct student object
  if (student.username || student.name) {
    return student.username || student.name;
  }

  return 'Anonymous User';
}

function normalizeStudentAvatar(student: any, baseURL: string): string | undefined {
  if (!student) return undefined;

  // Handle populated student (Strapi v4 format)
  if (student.data && student.data.attributes && student.data.attributes.avatar?.url) {
    return `${baseURL}${student.data.attributes.avatar.url}`;
  }

  // Handle direct student object
  if (student.avatar?.url) {
    return `${baseURL}${student.avatar.url}`;
  }

  if (typeof student.avatar === 'string') {
    return student.avatar.startsWith('http') ? student.avatar : `${baseURL}${student.avatar}`;
  }

  return undefined;
}
