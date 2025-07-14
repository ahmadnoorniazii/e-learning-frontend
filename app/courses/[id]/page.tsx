import courseService from '@/lib/course-service';
import { instructorService } from '@/lib/instructor-service';
import { CourseContent } from './course-content';
import { Course, Review, Progress } from '@/lib/types';
import { normalizeCourseData, normalizeReviewData } from '@/lib/course-data-normalizer';

export default async function CoursePage({ params }: { params: { id: string } }) {
  try {
    console.log('🔍 Course detail page - Requested ID:', params.id);
    
    // Get course details using the new API client
    const courseResponse = await courseService.getCourseById(params.id);
    console.log('📦 Raw course response:', courseResponse);
    console.log('📋 Course response summary:', {
      id: courseResponse.id,
      documentId: courseResponse.documentId,
      title: courseResponse.title,
      hasInstructor: !!(courseResponse as any).instructor,
      hasCategory: !!(courseResponse as any).category,
      hasLessons: !!(courseResponse as any).lessons,
      hasTags: !!(courseResponse as any).tags,
      enrollmentCount: courseResponse.enrollmentCount,
      rating: courseResponse.rating,
      totalRatings: courseResponse.totalRatings
    });

    if (!courseResponse) {
      return (
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Course not found</h1>
          <p className="text-muted-foreground">{`The course you're looking for doesn't exist.`}</p>
        </div>
      );
    }

    const baseURL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

    // Try to get full instructor details if we have an instructor ID but no populated data
    let instructorDetails = null;
    const instructorId = (courseResponse.instructor as any)?.data?.id || (courseResponse.instructor as any)?.id;
    if (instructorId && !(courseResponse.instructor as any)?.data?.attributes?.username) {
      try {
        console.log('🔍 Attempting to fetch instructor details for user ID:', instructorId);
        // Note: This would require a separate API call to get instructor details
        // For now, we'll use the basic data available
      } catch (error) {
        console.log('⚠️ Could not fetch instructor details:', error);
      }
    }

    // Transform the course data to match the expected format using the normalizer
    const course: Course = normalizeCourseData(courseResponse as any, baseURL);
    console.log("course response hereeee", course)
    // Fetch course reviews
    const reviewsResponse = await courseService.getCourseReviews(params.id, { pageSize: 20 });
    
    // Transform reviews to match the expected format using the normalizer
    const courseReviews: Review[] = reviewsResponse.data?.map((review: any) => 
      normalizeReviewData(review, params.id, baseURL)
    ) || [];

    return (
      <CourseContent 
        course={course}
        courseReviews={courseReviews}
        numericCourseId={courseResponse.id.toString()}
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