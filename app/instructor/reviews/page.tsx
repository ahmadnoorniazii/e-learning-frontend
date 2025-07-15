"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { useInstructorReviews } from '@/hooks/use-instructor-reviews';
import { Star, MessageSquare, Calendar } from 'lucide-react';

export default function InstructorReviews() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { reviews, loading, error, stats } = useInstructorReviews();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    } else if (isAuthenticated && user && user.role !== 'instructor') {
      router.push('/dashboard/student');
    }
  }, [isAuthenticated, authLoading, user, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-8">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Student Reviews</h1>

      {/* Review Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Reviews</p>
                <p className="text-2xl font-bold">{stats.totalReviews}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">
                  {reviews.filter(review => {
                    const reviewDate = new Date(review.createdAt);
                    const now = new Date();
                    return reviewDate.getMonth() === now.getMonth() && 
                           reviewDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { stars: 5, count: stats.ratingDistribution.fiveStar, color: 'bg-green-500' },
              { stars: 4, count: stats.ratingDistribution.fourStar, color: 'bg-blue-500' },
              { stars: 3, count: stats.ratingDistribution.threeStar, color: 'bg-yellow-500' },
              { stars: 2, count: stats.ratingDistribution.twoStar, color: 'bg-orange-500' },
              { stars: 1, count: stats.ratingDistribution.oneStar, color: 'bg-red-500' },
            ].map(({ stars, count, color }) => (
              <div key={stars} className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 w-16">
                  <span className="text-sm font-medium">{stars}</span>
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`${color} h-2 rounded-full`}
                    style={{ 
                      width: `${stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium w-12 text-right">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle>All Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={review.student.avatar} />
                      <AvatarFallback>
                        {review.student.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{review.student.name}</span>
                          <Badge variant="outline">{review.course.title}</Badge>
                        </div>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.title && (
                        <h4 className="font-semibold mb-2">{review.title}</h4>
                      )}
                      <p className="text-muted-foreground mb-3">{review.comment}</p>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
              <p className="text-muted-foreground">
                Reviews from your students will appear here once they start rating your courses
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 