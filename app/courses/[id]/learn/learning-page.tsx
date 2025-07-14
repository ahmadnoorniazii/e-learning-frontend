"use client";

import { useState, useEffect } from 'react';
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
import courseService from '@/lib/course-service';
import { apiClient, Course, Lesson, Enrollment, LessonProgress, CourseReview, Certificate } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

interface LearningPageData {
  course: Course;
  enrollment: Enrollment;
  lessons: Lesson[];
  lessonProgresses: LessonProgress[];
  reviews: CourseReview[];
  certificate?: Certificate;
}

export default function LearningPage({ params }: { params: { id: string } }) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [data, setData] = useState<LearningPageData | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  
  // Review dialog state
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    title: '',
    comment: ''
  });
  
  // Certificate dialog state
  const [showCertificateDialog, setShowCertificateDialog] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    initializeLearningData();
  }, [isAuthenticated, params.id]);

  const initializeLearningData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Check if user is enrolled
      const enrollment = await courseService.checkEnrollmentStatus(params.id);
      if (!enrollment) {
        router.push(`/courses/${params.id}`);
        return;
      }

      // Get course details with lessons
      const courseResponse = await apiClient.getCourse(params.id, {
        lessons: { populate: '*' },
        instructor: true,
        category: true,
        thumbnail: true,
        avatar: true
      });

      if (!courseResponse.data) {
        setError('Course not found');
        return;
      }

      const course = courseResponse.data;
      const lessons = course.lessons?.data || [];

      // Get lesson progress for this enrollment
      const lessonProgresses = await courseService.getLessonProgressForCourse(enrollment.id.toString());

      // Get course reviews
      const reviewsResponse = await courseService.getCourseReviews(params.id);
      const reviews = reviewsResponse.data;

      // Check for certificate if course is completed
      let certificate: Certificate | undefined;
      if (enrollment.isCompleted) {
        const certificates = await courseService.getMyCertificates();
        certificate = certificates.find(cert => 
          ((cert.course as any)?.id || (cert.course as any)?.data?.id)?.toString() === params.id &&
          ((cert.student as any)?.id || (cert.student as any)?.data?.id)?.toString() === user.id
        );
      }

      // Find current lesson (first incomplete or first lesson)
      let lessonIndex = 0;
      const incompleteLessonIndex = lessons.findIndex(lesson => {
        const progress = lessonProgresses.find(p => 
          ((p.lesson as any)?.id || (p.lesson as any)?.data?.id) === lesson.id
        );
        return !progress || !progress.isCompleted;
      });
      
      if (incompleteLessonIndex !== -1) {
        lessonIndex = incompleteLessonIndex;
      }

      setData({
        course,
        enrollment,
        lessons,
        lessonProgresses,
        reviews,
        certificate
      });

      setCurrentLesson(lessons[lessonIndex] || null);
      setCurrentLessonIndex(lessonIndex);

    } catch (err) {
      console.error('Error fetching learning data:', err);
      setError('Failed to load course data');
    } finally {
      setLoading(false);
    }
  };

  const getLessonProgress = (lessonId: number): LessonProgress | null => {
    if (!data) return null;
    return data.lessonProgresses.find(p => p.lesson.data.id === lessonId) || null;
  };

  const updateLessonProgress = async (lessonId: number, timeSpent: number, progressPercentage: number) => {
    if (!data || !user) return;

    try {
      const workflow = await courseService.completeWorkflow();
      
      // Track lesson progress
      const updatedProgress = await workflow.trackLessonProgress(
        data.enrollment.id.toString(),
        lessonId,
        timeSpent,
        progressPercentage
      );

      // Update local state
      const updatedProgresses = [...data.lessonProgresses];
      const existingIndex = updatedProgresses.findIndex(p => p.lesson.data.id === lessonId);
      
      if (existingIndex !== -1) {
        updatedProgresses[existingIndex] = updatedProgress;
      } else {
        updatedProgresses.push(updatedProgress);
      }

      // Update course progress
      const updatedEnrollment = await workflow.updateCourseProgress(data.enrollment.id.toString());

      setData({
        ...data,
        enrollment: updatedEnrollment,
        lessonProgresses: updatedProgresses
      });

      // Check if course is completed and show certificate option
      if (updatedEnrollment.isCompleted && !data.certificate) {
        toast({
          title: "🎉 Congratulations!",
          description: "You've completed the course! Generate your certificate now.",
        });
        setShowCertificateDialog(true);
      }

    } catch (error) {
      console.error('Error updating lesson progress:', error);
      toast({
        title: "Error",
        description: "Failed to update lesson progress",
        variant: "destructive"
      });
    }
  };

  const markLessonCompleted = async (lessonId: number) => {
    const lesson = data?.lessons.find(l => l.id === lessonId);
    if (!lesson) return;

    await updateLessonProgress(lessonId, currentTime || lesson.duration || 0, 100);
    
    toast({
      title: "Lesson Completed!",
      description: `Great job completing "${lesson.title}"`,
    });
  };

  const goToNextLesson = () => {
    if (!data || currentLessonIndex >= data.lessons.length - 1) return;
    
    const nextIndex = currentLessonIndex + 1;
    setCurrentLessonIndex(nextIndex);
    setCurrentLesson(data.lessons[nextIndex]);
    setCurrentTime(0);
  };

  const goToPreviousLesson = () => {
    if (!data || currentLessonIndex <= 0) return;
    
    const prevIndex = currentLessonIndex - 1;
    setCurrentLessonIndex(prevIndex);
    setCurrentLesson(data.lessons[prevIndex]);
    setCurrentTime(0);
  };

  const submitReview = async () => {
    if (!data || !reviewData.title.trim() || !reviewData.comment.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all review fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const workflow = await courseService.completeWorkflow();
      const review = await workflow.leaveReview(
        data.course.id,
        reviewData.rating,
        reviewData.title,
        reviewData.comment
      );

      setData({
        ...data,
        reviews: [review, ...data.reviews]
      });

      setShowReviewDialog(false);
      setReviewData({ rating: 5, title: '', comment: '' });
      
      toast({
        title: "Review Submitted!",
        description: "Thank you for your feedback",
      });
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive"
      });
    }
  };

  const generateCertificate = async () => {
    if (!data) return;

    try {
      const workflow = await courseService.completeWorkflow();
      const certificate = await workflow.generateCertificate(
        data.enrollment.id.toString(),
        data.course.id.toString()
      );

      setData({
        ...data,
        certificate
      });

      setShowCertificateDialog(false);
      
      toast({
        title: "Certificate Generated!",
        description: "Your certificate is ready for download",
      });
    } catch (error) {
      console.error('Error generating certificate:', error);
      toast({
        title: "Error",
        description: "Failed to generate certificate",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="container py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Loading course...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-16 text-center">
        <Alert className="max-w-md mx-auto">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data || !currentLesson) {
    return (
      <div className="container py-16 text-center">
        <p>No course data available</p>
      </div>
    );
  }

  const progressPercentage = data.enrollment.progress || 0;
  const completedLessons = data.lessonProgresses.filter(p => p.isCompleted).length;

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
              <h1 className="text-lg font-semibold">{data.course.title}</h1>
              <p className="text-sm text-muted-foreground">
                Lesson {currentLessonIndex + 1} of {data.lessons.length}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{progressPercentage}% Complete</p>
              <ProgressBar value={progressPercentage} className="w-32" />
            </div>
            
            {data.enrollment.isCompleted && (
              <Button
                onClick={() => setShowCertificateDialog(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600"
              >
                <Award className="h-4 w-4 mr-2" />
                {data.certificate ? 'View Certificate' : 'Get Certificate'}
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
              <div className="aspect-video bg-black rounded-lg relative">
                {currentLesson.videoUrl ? (
                  <video
                    className="w-full h-full rounded-lg"
                    controls
                    src={currentLesson.videoUrl}
                    onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                    onLoadedMetadata={(e) => setTotalTime(e.currentTarget.duration)}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-white">
                    <div className="text-center">
                      <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>No video available for this lesson</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Video Controls */}
              <div className="p-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">{currentLesson.title}</h2>
                  <Button
                    onClick={() => markLessonCompleted(currentLesson.id)}
                    disabled={getLessonProgress(currentLesson.id)?.isCompleted}
                    variant={getLessonProgress(currentLesson.id)?.isCompleted ? "secondary" : "default"}
                  >
                    {getLessonProgress(currentLesson.id)?.isCompleted ? (
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
                  {currentLesson.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPreviousLesson}
                      disabled={currentLessonIndex === 0}
                    >
                      <SkipBack className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToNextLesson}
                      disabled={currentLessonIndex >= data.lessons.length - 1}
                    >
                      Next
                      <SkipForward className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span><Clock className="h-4 w-4 inline mr-1" />{currentLesson.duration} min</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course Actions */}
          <div className="flex gap-4 mb-6">
            <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Star className="h-4 w-4 mr-2" />
                  Leave Review
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Leave a Review</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="rating">Rating</Label>
                    <div className="flex gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setReviewData({ ...reviewData, rating: star })}
                          className={`p-1 ${star <= reviewData.rating ? 'text-yellow-500' : 'text-gray-300'}`}
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
                      value={reviewData.title}
                      onChange={(e) => setReviewData({ ...reviewData, title: e.target.value })}
                      placeholder="Review title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="comment">Comment</Label>
                    <Textarea
                      id="comment"
                      value={reviewData.comment}
                      onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                      placeholder="Share your thoughts about this course..."
                      rows={4}
                    />
                  </div>
                  <Button onClick={submitReview} className="w-full">
                    Submit Review
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
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
                    <span>{progressPercentage}%</span>
                  </div>
                  <ProgressBar value={progressPercentage} />
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Completed Lessons</span>
                  <span>{completedLessons} / {data.lessons.length}</span>
                </div>
                
                {data.enrollment.isCompleted && (
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
                {data.lessons.map((lesson, index) => {
                  const progress = getLessonProgress(lesson.id);
                  const isCompleted = progress?.isCompleted || false;
                  const isCurrent = currentLessonIndex === index;
                  
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => {
                        setCurrentLessonIndex(index);
                        setCurrentLesson(lesson);
                        setCurrentTime(0);
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
                              {lesson.duration} min
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
      <Dialog open={showCertificateDialog} onOpenChange={setShowCertificateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🎉 Certificate of Completion</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            {data.certificate ? (
              <>
                <div className="bg-gradient-to-br from-purple-100 to-blue-100 p-6 rounded-lg">
                  <Award className="h-16 w-16 mx-auto mb-4 text-purple-600" />
                  <h3 className="text-xl font-bold mb-2">Certificate Generated!</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Certificate ID: {data.certificate.certificateId}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Verification Code: {data.certificate.verificationCode}
                  </p>
                </div>
                <Button className="w-full" onClick={() => window.print()}>
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
                    You've successfully completed the course. Generate your certificate now!
                  </p>
                </div>
                <Button onClick={generateCertificate} className="w-full">
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
