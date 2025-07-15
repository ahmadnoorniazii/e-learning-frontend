"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Course, Lesson } from '@/lib/api-client';
import { Plus, Trash2, Save, CheckCircle, AlertCircle, Clock, Eye } from 'lucide-react';

interface EnhancedLesson extends Lesson {
  status: 'draft' | 'saved' | 'error' | 'loading';
  lastSaved?: Date;
  hasChanges?: boolean;
}

export default function EditCourse() {
  const { id } = useParams();
  const courseId = Array.isArray(id) ? id[0] : id;

  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [lessons, setLessons] = useState<EnhancedLesson[]>([]);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    price: 0,
    isFree: false,
    isPremium: false,
    difficultyLevel: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    duration: 0,
    objectives: '',
    prerequisites: '',
    introVideoUrl: '',
    promoVideoUrl: '',
    category: undefined as number | undefined,
  });

  const fetchCourse = async () => {
    try {
      console.log('Fetching course with ID:', courseId);
      setLoading(true);
      setError(null);

      const response = await apiClient.getCourse(courseId, {
        populate: ['instructor', 'category', 'lessons']
      });

      console.log('API Response:', response);

      if (response.data) {
        const courseData = response.data;
        setCourse(courseData);
        
        setFormData({
          title: courseData.title || '',
          description: courseData.description || '',
          shortDescription: courseData.shortDescription || '',
          price: courseData.price || 0,
          isFree: courseData.isFree || false,
          isPremium: courseData.isPremium || false,
          difficultyLevel: (courseData.difficultyLevel as 'beginner' | 'intermediate' | 'advanced') || 'beginner',
          duration: courseData.duration || 0,
          objectives: courseData.objectives || '',
          prerequisites: courseData.prerequisites || '',
          introVideoUrl: courseData.introVideoUrl || '',
          promoVideoUrl: courseData.promoVideoUrl || '',
          category: courseData.category?.data?.id
        });

        // Set lessons if they exist
        console.log('Course lessons data:', courseData.lessons);
        if (courseData.lessons?.data) {
          const enhancedLessons = courseData.lessons.data.map((lesson: any) => ({
            ...lesson,
            status: 'saved' as const,
            hasChanges: false
          }));
          setLessons(enhancedLessons);
          console.log('Setting lessons:', enhancedLessons);
        } else {
          console.log('No lessons found in course data');
          // Try to fetch lessons separately
          try {
            const lessonsResponse = await apiClient.getLessons({
              filters: { course: { documentId: { $eq: courseData.documentId } } }
            });
            console.log('Fetched lessons separately:', lessonsResponse);
            if (lessonsResponse.data) {
              const enhancedLessons = lessonsResponse.data.map((lesson: any) => ({
                ...lesson,
                status: 'saved' as const,
                hasChanges: false
              }));
              setLessons(enhancedLessons);
            }
          } catch (lessonError) {
            console.error('Error fetching lessons separately:', lessonError);
          }
        }
      } else {
        setError('Course not found');
      }
    } catch (err) {
      console.error('Error fetching course:', err);
      setError('Failed to load course details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === 'number' ? parseFloat(value) || 0 : value 
    }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ 
      ...prev, 
      [name]: name === 'category' ? parseInt(value) || undefined : value 
    }));
  };

  const getLessonStatusIcon = (status: EnhancedLesson['status']) => {
    switch (status) {
      case 'saved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'loading':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'draft':
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getLessonStatusText = (status: EnhancedLesson['status']) => {
    switch (status) {
      case 'saved':
        return 'Saved';
      case 'error':
        return 'Error';
      case 'loading':
        return 'Saving...';
      case 'draft':
      default:
        return 'Draft';
    }
  };

  // Lesson management functions
  const addLesson = () => {
    const newLesson: EnhancedLesson = {
      title: '',
      description: '',
      content: '',
      videoUrl: '',
      duration: 0,
      sortOrder: lessons.length + 1,
      lessonType: 'video',
              course: course?.documentId || course?.id?.toString() || '',
      status: 'draft',
      hasChanges: true
    };
    setLessons([...lessons, newLesson]);
  };

  const removeLesson = (index: number) => {
    const updatedLessons = lessons.filter((_, i) => i !== index);
    // Update order numbers
    const reorderedLessons = updatedLessons.map((lesson, i) => ({
      ...lesson,
      sortOrder: i + 1
    }));
    setLessons(reorderedLessons);
  };

  const updateLesson = (index: number, field: keyof EnhancedLesson, value: string | number) => {
    const updatedLessons = lessons.map((lesson, i) => 
      i === index ? { 
        ...lesson, 
        [field]: value,
        status: 'draft' as const,
        hasChanges: true
      } : lesson
    );
    setLessons(updatedLessons);
  };

  const saveLesson = async (lesson: EnhancedLesson, index: number) => {
    try {
      setLessonLoading(true);
      
      // Update lesson status to loading
      setLessons(prev => prev.map((l, i) => 
        i === index ? { ...l, status: 'loading' as const } : l
      ));
      
      const lessonData = {
        title: lesson.title,
        description: lesson.description,
        content: lesson.content,
        videoUrl: lesson.videoUrl,
        duration: lesson.duration,
        sortOrder: lesson.sortOrder,
        lessonType: lesson.lessonType,
        course: course?.documentId ?? ''
      } as any;

      if (lesson.id) {
        // Update existing lesson
        await apiClient.updateLesson(lesson.id.toString(), lessonData);
        console.log('Lesson updated successfully');
      } else {
        // Create new lesson
        const response = await apiClient.createLesson(lessonData);
        console.log('Lesson created successfully:', response);
        // Update the lesson in state with the new ID
        const updatedLessons = lessons.map((l, i) => 
          i === index ? { 
            ...l, 
            id: response.data.id,
            status: 'saved' as const,
            hasChanges: false,
            lastSaved: new Date()
          } : l
        );
        setLessons(updatedLessons);
      }

      // Update lesson status to saved
      setLessons(prev => prev.map((l, i) => 
        i === index ? { 
          ...l, 
          status: 'saved' as const,
          hasChanges: false,
          lastSaved: new Date()
        } : l
      ));
      
      setSuccess('Lesson saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving lesson:', err);
      setError('Failed to save lesson. Please try again.');
      
      // Update lesson status to error
      setLessons(prev => prev.map((l, i) => 
        i === index ? { ...l, status: 'error' as const } : l
      ));
    } finally {
      setLessonLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const courseData = {
        title: formData.title,
        description: formData.description,
        shortDescription: formData.shortDescription,
        price: formData.price,
        isFree: formData.isFree,
        isPremium: formData.isPremium,
        difficultyLevel: formData.difficultyLevel,
        duration: formData.duration,
        objectives: formData.objectives,
        prerequisites: formData.prerequisites,
        introVideoUrl: formData.introVideoUrl,
        promoVideoUrl: formData.promoVideoUrl,
        ...(formData.category && { category: formData.category }),
      } as any;

      await apiClient.updateCourse(course.documentId, courseData);
      setSuccess('Course updated successfully!');
      
      setTimeout(() => {
        router.push('/instructor/courses');
      }, 2000);
    } catch (err) {
      console.error('Error updating course:', err);
      setError('Failed to update course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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

  if (!course) {
    return (
      <Alert variant="destructive" className="m-8">
        <AlertDescription>Course not found</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <Eye className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Course</h1>
          <p className="text-muted-foreground">Update your course information and content</p>
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
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter course title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (USD) *</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="99.99"
                    disabled={formData.isFree}
                    required
                  />
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isFree"
                      checked={formData.isFree}
                      onChange={(e) => handleCheckboxChange('isFree', e.target.checked)}
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
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleInputChange}
                placeholder="Brief description for course cards"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Course Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
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
                  name="objectives"
                  value={formData.objectives}
                  onChange={handleInputChange}
                  placeholder="What will students learn?"
                  rows={3}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prerequisites">Prerequisites *</Label>
                <Textarea
                  id="prerequisites"
                  name="prerequisites"
                  value={formData.prerequisites}
                  onChange={handleInputChange}
                  placeholder="What should students know before starting?"
                  rows={3}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.category?.toString() || ''} 
                  onValueChange={(value) => handleSelectChange('category', value)}
                >
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
                <Label htmlFor="difficultyLevel">Difficulty Level</Label>
                <Select 
                  value={formData.difficultyLevel} 
                  onValueChange={(value) => handleSelectChange('difficultyLevel', value)}
                >
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
                <Label htmlFor="introVideoUrl">Introduction Video URL</Label>
                <Input
                  id="introVideoUrl"
                  name="introVideoUrl"
                  value={formData.introVideoUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/intro.mp4"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="promoVideoUrl">Promotional Video URL</Label>
                <Input
                  id="promoVideoUrl"
                  name="promoVideoUrl"
                  value={formData.promoVideoUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/promo.mp4"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
        <Input
                id="duration"
                name="duration"
                type="number"
                min="0"
                value={formData.duration}
          onChange={handleInputChange}
                placeholder="120"
              />
            </div>
          </CardContent>
        </Card>

        {/* Lesson Management */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Course Lessons</CardTitle>
              <Button type="button" onClick={addLesson} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Lesson
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {lessons.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No lessons added yet. Click &quot;Add Lesson&quot; to get started.
              </p>
            ) : (
              lessons.map((lesson, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">Lesson {index + 1}</h4>
                      <div className="flex items-center space-x-1">
                        {getLessonStatusIcon(lesson.status)}
                        <span className="text-xs text-muted-foreground">
                          {getLessonStatusText(lesson.status)}
                        </span>
                        {lesson.hasChanges && lesson.status !== 'draft' && (
                          <span className="text-xs text-orange-500">(Modified)</span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => saveLesson(lesson, index)}
                        disabled={lessonLoading || lesson.status === 'loading'}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {lesson.status === 'loading' ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLesson(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Lesson Title *</Label>
                      <Input
                        value={lesson.title || ''}
                        onChange={(e) => updateLesson(index, 'title', e.target.value)}
                        placeholder='Enter lesson title'
          required
        />
                    </div>
                    <div className="space-y-2">
                      <Label>Duration (minutes)</Label>
        <Input
                        type="number"
                        min="0"
                        value={lesson.duration || 0}
                        onChange={(e) => updateLesson(index, 'duration', parseInt(e.target.value) || 0)}
                        placeholder="30"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Lesson Description *</Label>
                    <Textarea
                      value={lesson.description || ''}
                      onChange={(e) => updateLesson(index, 'description', e.target.value)}
                      placeholder="Describe what this lesson covers"
                      rows={2}
          required
        />
                  </div>

                  <div className="space-y-2">
                    <Label>Video URL</Label>
                    <Input
                      value={lesson.videoUrl || ''}
                      onChange={(e) => updateLesson(index, 'videoUrl', e.target.value)}
                      placeholder="https://example.com/video.mp4"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Lesson Content</Label>
                    <Textarea
                      value={lesson.content || ''}
                      onChange={(e) => updateLesson(index, 'content', e.target.value)}
                      placeholder="Additional content, notes, or resources for this lesson"
                      rows={3}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
        </Button>
        </div>
      </form>
    </div>
  );
}
