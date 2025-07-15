"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, Settings, 
  CheckCircle, Circle, BookOpen, Award, ArrowLeft, Star, 
  MessageSquare, Download, Clock, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress as ProgressBar } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useLearningWorkflow } from '@/hooks/use-learning-workflow';
import { useLessonNavigation } from '@/hooks/use-lesson-navigation';
import { useReviewDialog } from '@/hooks/use-review-dialog';
import { useCertificateDialog } from '@/hooks/use-certificate-dialog';
import courseService from '@/lib/course-service';

export default function LearningPage({ params }: { params: { id: string } }) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  // Main learning workflow hook
  const [learningState, learningActions] = useLearningWorkflow();
  
  // Lesson navigation hook
  const [navState, navActions] = useLessonNavigation(
    learningState.lessons, 
    learningActions.findCurrentLessonIndex()
  );
  
  // Review dialog hook
  const [reviewState, reviewActions] = useReviewDialog();
  
  // Certificate dialog hook
  const [certState, certActions] = useCertificateDialog();

  // Initialize learning environment
  useEffect(() => {
    const initializeAsync = async () => {
      if (!isAuthenticated) {
        // For unauthenticated users, just load course data without enrollment check
        try {
          const course = await courseService.getCourseById(params.id);
          if (course) {
            // Set basic course data for viewing
            learningActions.setCourseData(course);
          }
        } catch (error) {
          console.error('Error loading course:', error);
        }
        return;
      }
      
      // For authenticated users, initialize full learning workflow
      const success = await learningActions.initializeLearning(params.id);
      if (!success && learningState.error === 'Not enrolled in this course') {
        router.push(`/courses/${params.id}`);
      }
    };
    
    initializeAsync();
  }, [isAuthenticated, params.id, router]);

  // Update current lesson when lessons are first loaded, but respect user navigation choices
  useEffect(() => {
    if (learningState.lessons.length > 0 && !navState.currentLesson) {
      // Only auto-set the lesson if no lesson is currently selected
      const currentIndex = learningActions.findCurrentLessonIndex();
      const currentLesson = learningState.lessons[currentIndex];
      if (currentLesson) {
        navActions.setCurrentLesson(currentLesson, currentIndex);
      }
    }
  }, [learningState.lessons, navState.currentLesson]);

  // Auto-update course progress after lesson completion
  const handleLessonProgressUpdate = async (lessonId: number, timeSpent: number, progressPercentage: number) => {
    const updatedProgress = await learningActions.trackLessonProgress(lessonId, timeSpent, progressPercentage);
    if (updatedProgress) {
      // Update course-level progress
      const updatedEnrollment = await learningActions.updateCourseProgress();
      
      // Check if course is completed and show certificate option
      if (updatedEnrollment?.isCompleted && !learningState.certificate) {
        toast({
          title: "🎉 Congratulations!",
          description: "You've completed the course! Generate your certificate now.",
        });
        certActions.openCertificateDialog();
      }
    }
  };

  const handleMarkLessonCompleted = async (lessonId: number) => {
    const lesson = learningState.lessons.find(l => l.id === lessonId);
    if (!lesson) return;
    const success = await learningActions.markLessonCompleted(lessonId);
    if (success) {
      toast({
        title: "Lesson Completed!",
        description: `Great job completing "${lesson.title}"`,
      });

      // Auto-update course progress
      await learningActions.updateCourseProgress();

      // Auto-navigate to next lesson if available
      if (navState.currentLessonIndex < learningState.lessons.length - 1) {
        setTimeout(() => {
          navActions.goToNextLesson();
        }, 1500);
      }
    } else {
      toast({
        title: "Error",
        description: "Failed to mark lesson as completed. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewActions.isReviewValid()) {
      toast({
        title: "Error",
        description: "Please fill in all review fields",
        variant: "destructive"
      });
      return;
    }

    const review = await learningActions.submitReview(
      reviewState.reviewData.rating,
      reviewState.reviewData.title,
      reviewState.reviewData.comment
    );

    if (review) {
      reviewActions.closeReviewDialog();
      reviewActions.resetReviewData();
      toast({
        title: "Review Submitted!",
        description: "Thank you for your feedback",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleGenerateCertificate = async () => {
    const certificate = await learningActions.generateCertificate();
    if (certificate) {
      certActions.closeCertificateDialog();
      toast({
        title: "Certificate Generated!",
        description: "Your certificate is ready for download",
      });
    } else {
      certActions.closeCertificateDialog();
      toast({
        title: "Error",
        description: "Failed to generate certificate. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (learningState.loading) {
    return (
      <div className="container py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Loading course...</p>
      </div>
    );
  }

  if (learningState.error && isAuthenticated) {
    return (
      <div className="container py-16 text-center">
        <Alert className="max-w-md mx-auto">
          <AlertDescription>{learningState.error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!learningState.course) {
    return (
      <div className="container py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Loading course...</p>
      </div>
    );
  }

  // For unauthenticated users, show course preview
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-card">
          <div className="container flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/courses/${params.id}`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Course
              </Button>
              <div>
                <h1 className="text-lg font-semibold">{learningState.course.title}</h1>
                <p className="text-sm text-muted-foreground">Course Preview</p>
              </div>
            </div>
            
            <Button
              onClick={() => router.push('/auth/login')}
              className="bg-primary"
            >
              Enroll to Learn
            </Button>
          </div>
        </div>

        <div className="container py-8">
          <Card>
            <CardHeader>
              <CardTitle>Course Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                You need to be logged in and enrolled in this course to access the learning content.
              </p>
              <div className="flex gap-4">
                <Button onClick={() => router.push('/auth/login')}>
                  Login to Enroll
                </Button>
                <Button variant="outline" onClick={() => router.push(`/courses/${params.id}`)}>
                  View Course Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!navState.currentLesson) {
    return (
      <div className="container py-16 text-center">
        <p>No lesson data available</p>
      </div>
    );
  }

  // Debug logging
  console.log('📊 Learning state:', {
    course: learningState.course?.title,
    enrollment: learningState.enrollment?.id,
    lessons: learningState.lessons.length,
    progresses: learningState.lessonProgresses.length,
    currentLesson: navState.currentLesson?.title,
    overallProgress: learningState.overallProgress
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/courses/${params.id}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Course
            </Button>
            <div>
              <h1 className="text-lg font-semibold">{learningState.course.title}</h1>
              <p className="text-sm text-muted-foreground">
                Lesson {navState.currentLessonIndex + 1} of {learningState.totalLessons}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{learningState.overallProgress}% Complete</p>
              <ProgressBar value={Number(learningState.overallProgress) || 0} className="w-32" />
            </div>
            
            {learningState.enrollment?.isCompleted && (
              <Button
                onClick={() => certActions.openCertificateDialog()}
                className="bg-gradient-to-r from-purple-600 to-blue-600"
              >
                <Award className="h-4 w-4 mr-2" />
                {learningState.certificate ? 'View Certificate' : 'Get Certificate'}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container flex gap-6 py-6">
        {/* Main Content */}
        <div className="flex-1">
          {/* Video Player */}
          <Card className="mb-6">
            <CardContent className="p-0">
              <div key={`lesson-${navState.currentLesson?.id ?? 'unknown'}`} className="aspect-video bg-black rounded-lg relative">
                {navState.currentLesson?.videoUrl ? (
                  <div className="w-full h-full">
                    {navState.currentLesson.videoUrl.includes('youtube.com') || navState.currentLesson.videoUrl.includes('youtu.be') ? (
                      // Handle YouTube URLs
                      <iframe
                        className="w-full h-full rounded-lg"
                        src={navState.currentLesson.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={navState.currentLesson.title}
                      />
                    ) : (
                      // Handle direct video files
                      <video
                        className="w-full h-full rounded-lg"
                        controls
                        src={navState.currentLesson.videoUrl}
                        onTimeUpdate={(e) => {
                          const currentTime = e.currentTarget.currentTime;
                          navActions.setCurrentTime(currentTime);
                          
                          // Auto-update progress every 30 seconds to avoid too many API calls
                          if (currentTime > 0 && navState.totalTime > 0 && 
                              Math.floor(currentTime) % 30 === 0 && 
                              Math.floor(currentTime) !== navState.lastProgressUpdate) {
                            const progressPercent = Math.min(Math.round((currentTime / navState.totalTime) * 100), 95);
                            if (progressPercent > 0) {
                              navActions.setLastProgressUpdate(Math.floor(currentTime));
                              handleLessonProgressUpdate(navState.currentLesson?.id ?? 0, 30, progressPercent);
                            }
                          }
                        }}
                        onLoadedMetadata={(e) => navActions.setTotalTime(e.currentTarget.duration)}
                      />
                    )}
                  </div>
                ) : navState.currentLesson?.content ? (
                  <div className="flex items-center justify-center h-full text-white p-8">
                    <div className="text-center max-w-2xl">
                      <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-xl font-semibold mb-4">Text Content</h3>
                      <div className="text-left bg-gray-800 p-6 rounded-lg">
                        <p className="whitespace-pre-wrap">{navState.currentLesson.content}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-white">
                    <div className="text-center">
                      <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>No content available for this lesson</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Video Controls */}
              <div className="p-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">{navState.currentLesson?.title ?? ''}</h2>
                  <Button
                    onClick={() => navState.currentLesson && handleMarkLessonCompleted(Number(navState.currentLesson.id) || 0)}
                    disabled={navState.currentLesson ? learningActions.getLessonProgress(navState.currentLesson.documentId || 0)?.isCompleted : true}
                    variant={navState.currentLesson && learningActions.getLessonProgress(navState.currentLesson.documentId || 0)?.isCompleted ? "secondary" : "default"}
                  >
                   { console.log("resullllllt", navState.currentLesson && learningActions.getLessonProgress(navState?.currentLesson?.documentId || 0), navState?.currentLesson?.documentId)}
                    {navState.currentLesson && learningActions.getLessonProgress(navState?.currentLesson?.documentId || 0)?.isCompleted ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Completed
                      </>
                    ) : (
                      <>
                        <Circle className="h-4 w-4 mr-2" />
                        Mark Complete
                      </>
                    )}
                  </Button>
                </div>
                
                <p className="text-muted-foreground mb-4">
                  {navState.currentLesson?.description ?? ''}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navActions.goToPreviousLesson();
                      }}
                      disabled={navState.currentLessonIndex === 0}
                    >
                      <SkipBack className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navActions.goToNextLesson();
                      }}
                      disabled={navState.currentLessonIndex >= learningState.lessons.length - 1}
                    >
                      Next
                      <SkipForward className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      <Clock className="h-4 w-4 inline mr-1" />
                      {Number(navState.currentLesson?.duration) || 'N/A'} min
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course Actions */}
          <div className="flex gap-4 mb-6">
            {learningState.hasUserReviewed ? (
              <div className="flex items-center gap-2 p-4 border rounded-lg bg-muted/50">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <div>
                  <p className="font-medium text-sm">Review Submitted</p>
                  <p className="text-xs text-muted-foreground">
                    You rated this course {learningState.reviews.find(r => (r.student as any)?.id === user?.id || (r.student as any)?.documentId === user?.documentId)?.rating || 0}/5 stars
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    &quot;{learningState.reviews.find(r => (r.student as any)?.id === user?.id || (r.student as any)?.documentId === user?.documentId)?.title || ''}&quot;
                  </p>
                </div>
              </div>
            ) : (
              <Dialog open={reviewState.showReviewDialog} onOpenChange={reviewActions.closeReviewDialog}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline"
                    onClick={() => reviewActions.openReviewDialog()}
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Leave Review
                  </Button>
                </DialogTrigger>
                <DialogContent aria-describedby="review-dialog-description">
                  <DialogHeader>
                    <DialogTitle>Leave a Review</DialogTitle>
                  </DialogHeader>
                  <div id="review-dialog-description" className="space-y-4">
                    <div>
                      <Label htmlFor="rating">Rating</Label>
                      <div className="flex gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => reviewActions.updateReviewData({ rating: star })}
                            className={`p-1 ${star <= reviewState.reviewData.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                          >
                            <Star className="h-5 w-5 fill-current" />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={reviewState.reviewData.title}
                        onChange={(e) => reviewActions.updateReviewData({ title: e.target.value })}
                        placeholder="Review title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="comment">Comment</Label>
                      <Textarea
                        id="comment"
                        value={reviewState.reviewData.comment}
                        onChange={(e) => reviewActions.updateReviewData({ comment: e.target.value })}
                        placeholder="Share your thoughts about this course..."
                        rows={4}
                      />
                    </div>
                    <Button onClick={handleSubmitReview} className="w-full">
                      Submit Review
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80">
          {/* Course Progress */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Course Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Overall Progress</span>
                    <span>{learningState.overallProgress}%</span>
                  </div>
                  <ProgressBar value={Number(learningState.overallProgress) || 0} />
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Completed Lessons</span>
                  <span>{learningState.completedLessons} / {learningState.totalLessons}</span>
                </div>
                
                {learningState.enrollment?.isCompleted && (
                  <Badge className="w-full justify-center bg-green-100 text-green-800">
                    <Award className="h-4 w-4 mr-2" />
                    Course Completed!
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Lesson List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lessons</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {learningState.lessons.map((lesson, index) => {
                  const progress = learningActions.getLessonProgress(lesson.documentId || 0);
                  const isCompleted = progress?.isCompleted || false;
                  const isCurrent = navState.currentLessonIndex === index;
                  
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => {
                        navActions.setCurrentLesson(lesson, index);
                      }}
                      className={`w-full text-left p-3 border-b hover:bg-muted/50 transition-colors ${
                        isCurrent ? 'bg-primary/10 border-l-4 border-l-primary' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {isCompleted ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground" />
                          )}
                          <div>
                            <p className="font-medium text-sm">{lesson.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {Number(lesson.duration) || 'N/A'} min
                            </p>
                          </div>
                        </div>
                        {progress && progress.progressPercentage > 0 && progress.progressPercentage < 100 && (
                          <div className="text-xs text-muted-foreground">
                            {progress.progressPercentage}%
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Certificate Dialog */}
      <Dialog open={certState.showCertificateDialog} onOpenChange={certActions.closeCertificateDialog}>
        <DialogContent aria-describedby="certificate-dialog-description">
          <DialogHeader>
            <DialogTitle>🎉 Certificate of Completion</DialogTitle>
          </DialogHeader>
          <div id="certificate-dialog-description" className="text-center space-y-4">
            {learningState.certificate ? (
              <>
                <div className="bg-gradient-to-br from-purple-100 to-blue-100 p-6 rounded-lg">
                  <Award className="h-16 w-16 mx-auto mb-4 text-purple-600" />
                  <h3 className="text-xl font-bold mb-2">Certificate Generated!</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Certificate ID: {learningState.certificate.certificateId}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Verification Code: {learningState.certificate.verificationCode}
                  </p>
                </div>
                <Button className="w-full" onClick={certActions.downloadCertificate}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Certificate
                </Button>
              </>
            ) : (
              <>
                <div className="bg-gradient-to-br from-purple-100 to-blue-100 p-6 rounded-lg">
                  <Award className="h-16 w-16 mx-auto mb-4 text-purple-600" />
                  <h3 className="text-xl font-bold mb-2">Congratulations!</h3>
                  <p className="text-muted-foreground">
                    You&apos;ve successfully completed the course. Generate your certificate now!
                  </p>
                </div>
                <Button onClick={handleGenerateCertificate} className="w-full">
                  <Award className="h-4 w-4 mr-2" />
                  Generate Certificate
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
