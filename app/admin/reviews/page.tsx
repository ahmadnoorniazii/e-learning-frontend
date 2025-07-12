"use client";

import { useState, useEffect } from 'react';
import { Search, MoreHorizontal, Eye, Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { strapiAPI } from '@/lib/strapi';
import { useToast } from '@/hooks/use-toast';

interface Review {
  id: string;
  attributes: {
    rating: number;
    comment: string;
    reviewStatus: string; // Changed from 'status' to 'reviewStatus'
    createdAt: string;
    user?: {
      data?: {
        attributes: {
          username: string;
          email: string;
        };
      };
    };
    course?: {
      data?: {
        attributes: {
          title: string;
        };
      };
    };
  };
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRating, setSelectedRating] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
  }, []); // Dependency array is empty to mimic componentDidMount

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await strapiAPI.getReviews({
        page: 1,
        pageSize: 100,
      });
      setReviews(
        (response.data || []).map((review: any) => ({
          ...review,
          id: review.id.toString(),
        }))
      );
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('Failed to load reviews. Please check your Strapi backend connection.');
      toast({
        title: "Failed to load reviews",
        description: error instanceof Error ? error.message : "Please check your Strapi backend connection",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReview = async (reviewId: string) => {
    try {
      await strapiAPI.updateReview(reviewId, {
        reviewStatus: 'approved'
      });
      
      toast({
        title: "Review approved",
        description: "The review has been published successfully",
      });
      
      // Update local state
      setReviews(reviews.map(review => 
        review.id === reviewId 
          ? {...review, attributes: {...review.attributes, reviewStatus: 'approved'}} 
          : review
      ));
    } catch (error) {
      console.error('Error approving review:', error);
      toast({
        title: "Failed to approve review",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleRejectReview = async (reviewId: string) => {
    try {
      await strapiAPI.updateReview(reviewId, {
        reviewStatus: 'rejected'
      });
      
      toast({
        title: "Review rejected",
        description: "The review has been rejected and won't be published",
      });
      
      // Update local state
      setReviews(reviews.map(review => 
        review.id === reviewId 
          ? {...review, attributes: {...review.attributes, reviewStatus: 'rejected'}} 
          : review
      ));
    } catch (error) {
      console.error('Error rejecting review:', error);
      toast({
        title: "Failed to reject review",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await strapiAPI.deleteReview(reviewId);
      
      toast({
        title: "Review deleted",
        description: "The review has been permanently removed",
      });
      
      // Update local state
      setReviews(reviews.filter(review => review.id !== reviewId));
    } catch (error) {
      console.error('Error deleting review:', error);
      toast({
        title: "Failed to delete review",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.attributes.user?.data?.attributes.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.attributes.course?.data?.attributes.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.attributes.comment.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRating = selectedRating === 'all' || review.attributes.rating.toString() === selectedRating;
    return matchesSearch && matchesRating;
  });

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reviews Management</h1>
        <p className="text-muted-foreground">Monitor and moderate course reviews</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedRating} onValueChange={setSelectedRating}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {review.attributes.user?.data?.attributes.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {review.attributes.user?.data?.attributes.username || 'Unknown'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {review.attributes.user?.data?.attributes.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {review.attributes.course?.data?.attributes.title || 'Unknown Course'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {renderStars(review.attributes.rating)}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <p className="text-sm line-clamp-2">{review.attributes.comment}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={review.attributes.reviewStatus === 'approved' ? 'default' : 'secondary'}>
                      {review.attributes.reviewStatus || 'pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(review.attributes.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Full Review
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleApproveReview(review.id)}>
                          Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRejectReview(review.id)}>
                          Reject
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDeleteReview(review.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}