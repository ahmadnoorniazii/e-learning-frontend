import { strapiAPI } from '@/lib/strapi';
import { CourseContent } from './course-content';
import { Course, Review, Progress } from '@/lib/types';

export default async function CoursePage({ params }: { params: { id: string } }) {
  try {
    const [courseResponse, reviewsResponse] = await Promise.all([
      strapiAPI.getCourseById(params.id),
      strapiAPI.getReviews({ courseId: params.id, page: 1, pageSize: 10 })
    ]);

    if (!courseResponse.data) {
      return (
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Course not found</h1>
          <p className="text-muted-foreground">The course you're looking for doesn't exist.</p>
        </div>
      );
    }

    const courseData = courseResponse.data;

    const course: Course = {
      id: courseData.id.toString(),
      title: courseData.title,
      description: courseData.description
        .map(paragraph => paragraph.children.map(child => child.text).join(' '))
        .join('\n'),
      instructor: {
        id: courseData.instructor?.id.toString() || '1',
        name: courseData.instructor?.username || 'Unknown Instructor',
        email: courseData.instructor?.email || '',
        role: 'instructor' as const,
        avatar: courseData.instructor?.profile?.avatar?.url,
        createdAt: new Date().toISOString()
      },
      thumbnail: courseData.thumbnail?.url || 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=800',
      price: courseData.price,
      category: courseData.category,
      level: courseData.level as 'beginner' | 'intermediate' | 'advanced',
      duration: courseData.duration || 0,
      lessonsCount: courseData.lessons?.length || 0,
      studentsCount: courseData.studentsCount || 0,
      rating: courseData.rating || 0,
      reviewsCount: courseData.reviewsCount || 0,
      tags: courseData.tags || [],
      createdAt: courseData.createdAt,
      lessons: courseData.lessons?.map(lesson => ({
        id: lesson.id.toString(),
        title: lesson.title,
        description: lesson.description,
        duration: lesson.duration,
        order: lesson.order,
        videoUrl: lesson.videoUrl
      })) || []
    };

    const courseReviews: Review[] = reviewsResponse.data?.map(review => ({
      id: review.id.toString(),
      userId: review.user?.id.toString() || '',
      userName: review.user?.username || 'Anonymous',
      userAvatar: review.user?.profile?.avatar?.url,
      courseId: params.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt
    })) || [];

    return (
      <CourseContent 
        course={course}
        courseReviews={courseReviews}
      />
    );
  } catch (error) {
    console.error('Error fetching course:', error);
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Error loading course</h1>
        <p className="text-muted-foreground">Please try again later.</p>
      </div>
    );
  }
}