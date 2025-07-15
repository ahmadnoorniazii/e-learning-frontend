import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';

export interface InstructorReview {
  id: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  student: {
    id: string;
    name: string;
    avatar?: string;
  };
  course: {
    id: string;
    title: string;
  };
}

export interface UseInstructorReviewsReturn {
  reviews: InstructorReview[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  stats: {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: {
      fiveStar: number;
      fourStar: number;
      threeStar: number;
      twoStar: number;
      oneStar: number;
    };
  };
}

export function useInstructorReviews(): UseInstructorReviewsReturn {
  const [reviews, setReviews] = useState<InstructorReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const currentUser = await apiClient.getCurrentUser();
      
      // Fetch reviews for instructor's courses
      const response = await apiClient.getCourseReviews({
        filters: {
          course: {
            instructor: { documentId: { $eq: currentUser.documentId } }
          }
        },
        populate: ['student', 'course'],
        pageSize: 100
      });

      const transformedReviews: InstructorReview[] = response.data.map(review => ({
        id: review.id.toString(),
        rating: review.rating,
        title: review.title || '',
        comment: review.comment,
        createdAt: review.createdAt,
        student: {
          id: (review.student as any)?.id?.toString() || '',
          name: (review.student as any)?.username || 'Anonymous',
          avatar: (review.student as any)?.avatar?.url
        },
        course: {
          id: (review.course as any)?.id?.toString() || '',
          title: (review.course as any)?.title || 'Unknown Course'
        }
      }));

      setReviews(transformedReviews);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate review stats
  const stats = {
    totalReviews: reviews.length,
    averageRating: reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0,
    ratingDistribution: {
      fiveStar: reviews.filter(review => review.rating === 5).length,
      fourStar: reviews.filter(review => review.rating === 4).length,
      threeStar: reviews.filter(review => review.rating === 3).length,
      twoStar: reviews.filter(review => review.rating === 2).length,
      oneStar: reviews.filter(review => review.rating === 1).length,
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return {
    reviews,
    loading,
    error,
    refetch: fetchReviews,
    stats
  };
} 