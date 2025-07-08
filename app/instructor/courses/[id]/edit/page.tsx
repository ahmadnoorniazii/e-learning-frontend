"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { strapiAPI } from '@/lib/strapi';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { StrapiCourse } from '@/lib/strapi';

export default function EditCourse() {
  const { id } = useParams();
  const courseId = Array.isArray(id) ? id[0] : id;

  const router = useRouter();
  const [course, setCourse] = useState<StrapiCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    level: '',
  });

  const fetchCourse = async () => {
    try {
      console.log('Fetching course with ID:', courseId);
      setLoading(true);
      setError(null);

      const response = await strapiAPI.getCourseById(courseId);

      console.log('API Response:', response);

      if (response.data) {
        const { attributes } = response.data;

        // Handle description field
        const description = Array.isArray(attributes.description)
          ? attributes.description.map((item: any) => item.children.map((child: any) => child.text).join('')).join('\n')
          : attributes.description || '';

        setCourse(response.data);
        setFormData({
          title: attributes.title,
          description,
          price: attributes.price.toString(),
          category: attributes.category,
          level: attributes.level,
        });
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
  }, [courseId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      await strapiAPI.updateCourse(courseId, formData);

      router.push(`/instructor/courses/${courseId}`);
    } catch (err) {
      console.error('Error updating course:', err);
      setError('Failed to update course. Please try again later.');
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

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Edit Course</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Course Title"
          required
        />
        <Textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Course Description"
          required
        />
        <Input
          name="price"
          type="number"
          value={formData.price}
          onChange={handleInputChange}
          placeholder="Course Price"
          required
        />
        <Input
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          placeholder="Course Category"
          required
        />
        <Input
          name="level"
          value={formData.level}
          onChange={handleInputChange}
          placeholder="Course Level"
          required
        />
        <Button type="submit" className="w-full">
          Save Changes
        </Button>
      </form>
    </div>
  );
}
