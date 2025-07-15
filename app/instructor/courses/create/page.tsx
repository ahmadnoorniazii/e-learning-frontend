"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Plus, Trash2, Save, Eye, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { apiClient } from '@/lib/api-client';

interface Lesson {
  id?: string;
  title: string;
  description: string;
  duration: number;
  order: number;
  videoUrl: string;
  content?: string;
  resources?: string[];
  status: 'draft' | 'saved' | 'error';
  lastSaved?: Date;
}

export default function CreateCoursePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'draft' | 'publish'>('draft');

  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    price: 0,
    isFree: false,
    isPremium: false,
    categoryId: '',
    difficultyLevel: 'beginner',
    duration: 0,
    objectives: '',
    prerequisites: '',
    tags: [] as string[],
    thumbnail: null as File | null,
    introVideoUrl: '',
    promoVideoUrl: '',
  });

  const [lessons, setLessons] = useState<Lesson[]>([
    { 
      title: '', 
      description: '', 
      duration: 0, 
      order: 1, 
      videoUrl: '', 
      content: '', 
      resources: [],
      status: 'draft'
    }
  ]);

  const [currentTag, setCurrentTag] = useState('');

  const addTag = () => {
    if (currentTag.trim() && !courseData.tags.includes(currentTag.trim())) {
      setCourseData({
        ...courseData,
        tags: [...courseData.tags, currentTag.trim()]
      });
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setCourseData({
      ...courseData,
      tags: courseData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const addLesson = () => {
    setLessons([
      ...lessons,
      { 
        title: '', 
        description: '', 
        duration: 0, 
        order: lessons.length + 1, 
        videoUrl: '', 
        content: '',
        resources: [],
        status: 'draft'
      }
    ]);
  };

  const removeLesson = (index: number) => {
    const updatedLessons = lessons.filter((_, i) => i !== index);
    // Update order numbers
    const reorderedLessons = updatedLessons.map((lesson, i) => ({
      ...lesson,
      order: i + 1
    }));
    setLessons(reorderedLessons);
  };

  const updateLesson = (index: number, field: keyof Lesson, value: string | number | string[]) => {
    const updatedLessons = lessons.map((lesson, i) => 
      i === index ? { 
        ...lesson, 
        [field]: value,
        status: 'draft' // Mark as draft when changed
      } : lesson
    );
    setLessons(updatedLessons as any);
  };

  const getLessonStatusIcon = (status: Lesson['status']) => {
    switch (status) {
      case 'saved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'draft':
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getLessonStatusText = (status: Lesson['status']) => {
    switch (status) {
      case 'saved':
        return 'Saved';
      case 'error':
        return 'Error';
      case 'draft':
      default:
        return 'Draft';
    }
  };

  const calculateTotalDuration = () => {
    return lessons.reduce((total, lesson) => total + lesson.duration, 0);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCourseData({ ...courseData, thumbnail: file });
    }
  };

  const validateForm = () => {
    const errors: string[] = [];

    if (!courseData.title.trim()) errors.push('Course title is required');
    if (!courseData.description.trim()) errors.push('Course description is required');
    if (!courseData.shortDescription.trim()) errors.push('Short description is required');
    if (!courseData.objectives.trim()) errors.push('Course objectives are required');
    if (!courseData.prerequisites.trim()) errors.push('Prerequisites are required');
    if (lessons.length === 0) errors.push('At least one lesson is required');
    
    lessons.forEach((lesson, index) => {
      if (!lesson.title.trim()) errors.push(`Lesson ${index + 1} title is required`);
      if (!lesson.description.trim()) errors.push(`Lesson ${index + 1} description is required`);
    });

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate form
      const validationErrors = validateForm();
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      const totalDuration = calculateTotalDuration();

      // Prepare course data for API
      const coursePayload = {
        title: courseData.title,
        description: courseData.description,
        shortDescription: courseData.shortDescription,
        price: courseData.isFree ? 0 : courseData.price,
        isFree: courseData.isFree,
        isPremium: courseData.isPremium,
        difficultyLevel: courseData.difficultyLevel as 'beginner' | 'intermediate' | 'advanced',
        duration: totalDuration,
        objectives: courseData.objectives,
        prerequisites: courseData.prerequisites,
        introVideoUrl: courseData.introVideoUrl,
        promoVideoUrl: courseData.promoVideoUrl,
        // Category will be handled by ID
        category: courseData.categoryId ? parseInt(courseData.categoryId) : undefined,
        // Add instructor field
        instructor: user.id,
        // Publication status
        publishedAt: currentStep === 'publish' ? new Date().toISOString() : null,
      };

      // Create course
      const courseResponse = await apiClient.createCourse(coursePayload);
      console.log('Course created successfully:', courseResponse);
      console.log('📋 Course response structure:', {
        hasData: !!courseResponse.data,
        dataType: typeof courseResponse.data,
        dataKeys: courseResponse.data ? Object.keys(courseResponse.data) : [],
        fullResponse: JSON.stringify(courseResponse, null, 2)
      });

      // Create lessons for the course
      if (courseResponse.data && lessons.length > 0) {
        const courseId = courseResponse.data.id;
        console.log('🔍 Extracted course ID:', courseId, 'Type:', typeof courseId);
        
        if (!courseId) {
          console.error('Course ID missing after course creation. Payload:', courseResponse);
          throw new Error('Course ID missing after course creation');
        }
        console.log('Creating lessons for course:', courseId);
        
        // Update lessons with saved status
        const updatedLessons = lessons.map(lesson => ({ ...lesson, status: 'saved' as const }));
        setLessons(updatedLessons);
        
        for (const lesson of lessons) {
          try {
            const lessonPayload = {
              title: lesson.title,
              description: lesson.description,
              content: lesson.content || '',
              videoUrl: lesson.videoUrl || '',
              duration: lesson.duration,
              sortOrder: lesson.order,
              lessonType: 'video' as const,
              course: courseResponse?.data?.documentId || courseResponse?.data?.id?.toString()
            };
            console.log('📝 Creating lesson with payload:', JSON.stringify(lessonPayload, null, 2));
            const lessonResponse = await apiClient.createLesson(lessonPayload);
            console.log('Lesson created successfully:', lessonResponse);
          } catch (lessonError) {
            console.error('Error creating lesson:', lessonError);
            // Mark lesson as error
            setLessons(prev => prev.map(l => 
              l.title === lesson.title ? { ...l, status: 'error' as const } : l
            ));
          }
        }
      }

      setSuccess(`Course ${currentStep === 'publish' ? 'published' : 'saved as draft'} successfully!`);
      
      setTimeout(() => {
        router.push('/instructor/courses');
      }, 2000);
    } catch (err) {
      console.error('Error creating course:', err);
      setError(err instanceof Error ? err.message : 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Course</h1>
          <p className="text-muted-foreground">Share your knowledge with students worldwide</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title *</Label>
                <Input
                  id="title"
                  value={courseData.title}
                  onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                  placeholder="Enter course title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (USD) *</Label>
                <div className="flex items-center space-x-2">
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={courseData.price}
                  onChange={(e) => setCourseData({ ...courseData, price: parseFloat(e.target.value) || 0 })}
                  placeholder="99.99"
                    disabled={courseData.isFree}
                  required
                />
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isFree"
                      checked={courseData.isFree}
                      onChange={(e) => setCourseData({ ...courseData, isFree: e.target.checked })}
                    />
                    <Label htmlFor="isFree">Free Course</Label>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDescription">Short Description *</Label>
              <Input
                id="shortDescription"
                value={courseData.shortDescription}
                onChange={(e) => setCourseData({ ...courseData, shortDescription: e.target.value })}
                placeholder="Brief description for course cards"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Course Description *</Label>
              <Textarea
                id="description"
                value={courseData.description}
                onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                placeholder="Describe what students will learn in this course"
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="objectives">Course Objectives *</Label>
                <Textarea
                  id="objectives"
                  value={courseData.objectives}
                  onChange={(e) => setCourseData({ ...courseData, objectives: e.target.value })}
                  placeholder="What will students learn?"
                  rows={3}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prerequisites">Prerequisites *</Label>
                <Textarea
                  id="prerequisites"
                  value={courseData.prerequisites}
                  onChange={(e) => setCourseData({ ...courseData, prerequisites: e.target.value })}
                  placeholder="What should students know before starting?"
                  rows={3}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={courseData.categoryId} onValueChange={(value) => setCourseData({ ...courseData, categoryId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Web Development</SelectItem>
                    <SelectItem value="2">Data Science</SelectItem>
                    <SelectItem value="3">Design</SelectItem>
                    <SelectItem value="4">Marketing</SelectItem>
                    <SelectItem value="5">Business</SelectItem>
                    <SelectItem value="6">Photography</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">Difficulty Level</Label>
                <Select value={courseData.difficultyLevel} onValueChange={(value) => setCourseData({ ...courseData, difficultyLevel: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Video URLs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="introVideo">Introduction Video URL</Label>
                <Input
                  id="introVideo"
                  value={courseData.introVideoUrl}
                  onChange={(e) => setCourseData({ ...courseData, introVideoUrl: e.target.value })}
                  placeholder="https://example.com/intro.mp4"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="promoVideo">Promotional Video URL</Label>
                <Input
                  id="promoVideo"
                  value={courseData.promoVideoUrl}
                  onChange={(e) => setCourseData({ ...courseData, promoVideoUrl: e.target.value })}
                  placeholder="https://example.com/promo.mp4"
                />
              </div>
            </div>

            {/* Thumbnail Upload */}
            <div className="space-y-2">
              <Label>Course Thumbnail</Label>
              <div className="flex items-center space-x-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="max-w-xs"
                />
                {courseData.thumbnail && (
                  <Badge variant="outline">
                    {courseData.thumbnail.name}
                  </Badge>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex space-x-2">
                <Input
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {courseData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-primary/60 hover:text-primary"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Content */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Course Content</CardTitle>
              <Button type="button" onClick={addLesson} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Lesson
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {lessons.map((lesson, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">Lesson {index + 1}</h4>
                    <div className="flex items-center space-x-1">
                      {getLessonStatusIcon(lesson.status)}
                      <span className="text-xs text-muted-foreground">
                        {getLessonStatusText(lesson.status)}
                      </span>
                    </div>
                  </div>
                  {lessons.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLesson(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Lesson Title *</Label>
                    <Input
                      value={lesson.title}
                      onChange={(e) => updateLesson(index, 'title', e.target.value)}
                      placeholder="Enter lesson title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration (minutes)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={lesson.duration}
                      onChange={(e) => updateLesson(index, 'duration', parseInt(e.target.value) || 0)}
                      placeholder="30"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Lesson Description *</Label>
                  <Textarea
                    value={lesson.description}
                    onChange={(e) => updateLesson(index, 'description', e.target.value)}
                    placeholder="Describe what this lesson covers"
                    rows={2}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Video URL</Label>
                  <Input
                    value={lesson.videoUrl}
                    onChange={(e) => updateLesson(index, 'videoUrl', e.target.value)}
                    placeholder="https://example.com/video.mp4"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Lesson Content</Label>
                  <Textarea
                    value={lesson.content}
                    onChange={(e) => updateLesson(index, 'content', e.target.value)}
                    placeholder="Additional content, notes, or resources for this lesson"
                    rows={3}
                  />
                </div>
              </div>
            ))}

            <div className="text-sm text-muted-foreground">
              Total course duration: {Math.floor(calculateTotalDuration() / 60)}h {calculateTotalDuration() % 60}m
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-between items-center">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <div className="flex space-x-4">
            <Button 
              type="submit" 
              disabled={loading}
              variant="outline"
              onClick={() => setCurrentStep('draft')}
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save as Draft'}
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              onClick={() => setCurrentStep('publish')}
            >
              <Eye className="h-4 w-4 mr-2" />
              {loading ? 'Publishing...' : 'Publish Course'}
          </Button>
          </div>
        </div>
      </form>
    </div>
  );
}