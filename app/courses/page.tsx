"use client";

import { useState, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CourseCard } from '@/components/ui/course-card';
import { strapiAPI } from '@/lib/strapi';
import { Course } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';

const categories = [
  'All Categories',
  'Web Development',
  'Data Science', 
  'Design',
  'Marketing',
  'Business',
  'Photography'
];

const levels = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];
const sortOptions = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' }
];

export default function CoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedLevel, setSelectedLevel] = useState('All Levels');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchCourses();
  }, [selectedCategory, selectedLevel, sortBy]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: any = {
        instructor: user?.id,
      };
      if (selectedCategory !== 'All Categories') {
        filters.category = selectedCategory;
      }
      if (selectedLevel !== 'All Levels') {
        filters.level = selectedLevel.toLowerCase();
      }
      if (searchQuery) {
        filters.title = searchQuery;
      }

      const response = await strapiAPI.getCourses({
        page: 1,
        pageSize: 50,
        filters,
      });

      const transformedCourses: Course[] = response.data?.map(course => ({
        id: course.id.toString(),
        title: course.attributes.title,
        description: course.attributes.description,
        instructor: {
          id: course.attributes.instructor?.data?.id.toString() || '1',
          name: course.attributes.instructor?.data?.attributes.username || 'Unknown Instructor',
          email: course.attributes.instructor?.data?.attributes.email || '',
          role: 'instructor' as const,
          avatar: course.attributes.instructor?.data?.attributes.profile?.avatar?.url,
          createdAt: new Date().toISOString(),
        },
        thumbnail: course.attributes.thumbnail?.data?.attributes.url || 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=800',
        price: course.attributes.price,
        category: course.attributes.category,
        level: course.attributes.level as 'beginner' | 'intermediate' | 'advanced',
        duration: course.attributes.duration || 0,
        lessonsCount: course.attributes.lessons?.data?.length || 0,
        studentsCount: course.attributes.studentsCount || 0,
        rating: course.attributes.rating || 0,
        reviewsCount: course.attributes.reviewsCount || 0,
        tags: course.attributes.tags || [],
        createdAt: course.attributes.createdAt,
        lessons: course.attributes.lessons?.data?.map(lesson => ({
          id: lesson.id.toString(),
          title: lesson.attributes.title,
          description: lesson.attributes.description,
          duration: lesson.attributes.duration,
          order: lesson.attributes.order,
          videoUrl: lesson.attributes.videoUrl,
        })) || [],
      })) || [];

      setCourses(transformedCourses);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'popular':
      default:
        return b.studentsCount - a.studentsCount;
    }
  });

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">All Courses</h1>
        <p className="text-muted-foreground">
          Discover {courses.length} courses from expert instructors
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-8">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search and Filters */}
      <Card className="border-0 shadow-md mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search courses, instructors, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full lg:w-48 h-12">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Level Filter */}
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-full lg:w-48 h-12">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                {levels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-48 h-12">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <p className="text-muted-foreground">
            Showing {sortedCourses.length} of {courses.length} courses
          </p>
          {selectedCategory !== 'All Categories' && (
            <Badge variant="secondary">
              {selectedCategory}
              <button
                onClick={() => setSelectedCategory('All Categories')}
                className="ml-2 text-xs hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          )}
          {selectedLevel !== 'All Levels' && (
            <Badge variant="secondary">
              {selectedLevel}
              <button
                onClick={() => setSelectedLevel('All Levels')}
                className="ml-2 text-xs hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Course Grid/List */}
      {sortedCourses.length > 0 ? (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        }>
          {sortedCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No courses found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search criteria or explore different categories
          </p>
          <Button onClick={() => {
            setSearchQuery('');
            setSelectedCategory('All Categories');
            setSelectedLevel('All Levels');
          }}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}