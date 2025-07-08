"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { strapiAPI } from '@/lib/strapi';

interface Lesson {
  title: string;
  description: string;
  duration: number;
  order: number;
  videoUrl: string;
}

export default function CreateCoursePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    price: 0,
    category: 'Web Development',
    level: 'beginner',
    duration: 0,
    tags: [] as string[],
  });

  const [lessons, setLessons] = useState<Lesson[]>([
    { title: '', description: '', duration: 0, order: 1, videoUrl: '' }
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
      { title: '', description: '', duration: 0, order: lessons.length + 1, videoUrl: '' }
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

  const updateLesson = (index: number, field: keyof Lesson, value: string | number) => {
    const updatedLessons = lessons.map((lesson, i) => 
      i === index ? { ...lesson, [field]: value } : lesson
    );
    setLessons(updatedLessons);
  };

  const calculateTotalDuration = () => {
    return lessons.reduce((total, lesson) => total + lesson.duration, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate required fields
      if (!courseData.title.trim()) {
        throw new Error('Course title is required');
      }
      if (!courseData.description.trim()) {
        throw new Error('Course description is required');
      }
      if (courseData.price <= 0) {
        throw new Error('Course price must be greater than 0');
      }
      if (lessons.some(lesson => !lesson.title.trim())) {
        throw new Error('All lessons must have a title');
      }

      const totalDuration = calculateTotalDuration();

      // Create course
      const coursePayload = {
        title: courseData.title,
        description: courseData.description,
        price: courseData.price,
        category: courseData.category,
        level: courseData.level,
        publicationStatus: 'draft',
        duration: totalDuration,
        tags: courseData.tags,
        instructors: {id : Number(user.id)},
        studentsCount: 0,
        rating: 0,
        reviewsCount: 0,
      };

      const courseResponse = await strapiAPI.createCourse(coursePayload);

      // Create lessons
      const courseId = courseResponse.data.id;
      for (const lesson of lessons) {
        await strapiAPI.createLesson({
          ...lesson,
          course: courseId,
        });
      }

      setSuccess('Course and lessons created successfully!');
      setTimeout(() => {
        router.push('/instructor/courses');
      }, 2000);
    } catch (err) {
      console.error('Error creating course or lessons:', err);
      setError(err instanceof Error ? err.message : 'Failed to create course or lessons');
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
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={courseData.price}
                  onChange={(e) => setCourseData({ ...courseData, price: parseFloat(e.target.value) || 0 })}
                  placeholder="99.99"
                  required
                />
              </div>
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
                <Label htmlFor="category">Category</Label>
                <Select value={courseData.category} onValueChange={(value) => setCourseData({ ...courseData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Web Development">Web Development</SelectItem>
                    <SelectItem value="Data Science">Data Science</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Photography">Photography</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">Difficulty Level</Label>
                <Select value={courseData.level} onValueChange={(value) => setCourseData({ ...courseData, level: value })}>
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
                  <h4 className="font-medium">Lesson {index + 1}</h4>
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
                  <Label>Lesson Description</Label>
                  <Textarea
                    value={lesson.description}
                    onChange={(e) => updateLesson(index, 'description', e.target.value)}
                    placeholder="Describe what this lesson covers"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Video URL (optional)</Label>
                  <Input
                    value={lesson.videoUrl}
                    onChange={(e) => updateLesson(index, 'videoUrl', e.target.value)}
                    placeholder="https://example.com/video.mp4"
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
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Course'}
          </Button>
        </div>
      </form>
    </div>
  );
}