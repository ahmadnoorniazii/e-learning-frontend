"use client";

import { useState, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, Grid, List, Star, Clock, Users, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CourseCard } from '@/components/ui/course-card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Course } from '@/lib/types';
import { mockCourses, getMockCoursesByCategory } from '@/lib/mock-data';
import Link from 'next/link';

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

      // Use mock data for now
      let coursesToShow = getMockCoursesByCategory(selectedCategory);
      
      // Apply level filter
      if (selectedLevel !== 'All Levels') {
        coursesToShow = coursesToShow.filter(course => 
          course.level.toLowerCase() === selectedLevel.toLowerCase()
        );
      }
      
      setCourses(coursesToShow);
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

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0 ? `${hours}h ${remainingMinutes}m` : `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container py-8">
          <div className="flex items-center justify-center h-80">
            <div className="relative">
              <div className="animate-spin rounded-full h-32 w-32 border-4 border-blue-200"></div>
              <div className="animate-spin rounded-full h-32 w-32 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container py-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent">
          All Courses
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover {mockCourses.length} courses from expert instructors across all categories
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-8 max-w-2xl mx-auto">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search and Filters */}
      <Card className="border-0 shadow-xl mb-12 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search courses, instructors, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-14 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full lg:w-48 h-14 border-2 border-gray-200 rounded-xl">
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
              <SelectTrigger className="w-full lg:w-48 h-14 border-2 border-gray-200 rounded-xl">
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
              <SelectTrigger className="w-full lg:w-48 h-14 border-2 border-gray-200 rounded-xl">
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
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <p className="text-lg text-gray-600">
            Showing <span className="font-semibold text-blue-600">{sortedCourses.length}</span> of <span className="font-semibold">{mockCourses.length}</span> courses
          </p>
          {selectedCategory !== 'All Categories' && (
            <Badge variant="secondary" className="px-3 py-1 bg-blue-100 text-blue-800">
              {selectedCategory}
              <button
                onClick={() => setSelectedCategory('All Categories')}
                className="ml-2 text-xs hover:text-red-600 transition-colors"
              >
                ×
              </button>
            </Badge>
          )}
          {selectedLevel !== 'All Levels' && (
            <Badge variant="secondary" className="px-3 py-1 bg-purple-100 text-purple-800">
              {selectedLevel}
              <button
                onClick={() => setSelectedLevel('All Levels')}
                className="ml-2 text-xs hover:text-red-600 transition-colors"
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
            className={`${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'border-2 border-gray-200'} rounded-lg`}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className={`${viewMode === 'list' ? 'bg-blue-600 text-white' : 'border-2 border-gray-200'} rounded-lg`}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Course Grid/List */}
      {sortedCourses.length > 0 ? (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {sortedCourses.map((course) => (
                <div key={course.id} className="transform hover:scale-105 transition-all duration-300">
                  <CourseCard course={course} />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {sortedCourses.map((course) => (
                <Card key={course.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="md:w-80 flex-shrink-0">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-48 md:h-full object-cover rounded-xl"
                        />
                      </div>
                      <div className="flex-1 space-y-4">
                        <div>
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                              <Link href={`/courses/${course.id}`}>
                                {course.title}
                              </Link>
                            </h3>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-blue-600">${course.price}</div>
                            </div>
                          </div>
                          <p className="text-gray-600 line-clamp-2 mb-4">{course.description}</p>
                        </div>
                        
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={course.instructor.avatar} alt={course.instructor.name} />
                              <AvatarFallback>
                                {course.instructor.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium text-gray-700">{course.instructor.name}</span>
                          </div>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {course.category}
                          </Badge>
                          <Badge variant="secondary" className="bg-purple-50 text-purple-700">
                            {course.level}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-6 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{course.rating}</span>
                              <span>({course.reviewsCount})</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4" />
                              <span>{course.studentsCount.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{formatDuration(course.duration)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <BookOpen className="h-4 w-4" />
                              <span>{course.lessonsCount} lessons</span>
                            </div>
                          </div>
                          <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl">
                            <Link href={`/courses/${course.id}`}>
                              View Course
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <Search className="h-16 w-16 text-gray-400" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-4">No courses found</h3>
          <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
            Try adjusting your search criteria or explore different categories
          </p>
          <Button 
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All Categories');
              setSelectedLevel('All Levels');
            }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            Clear Filters
          </Button>
        </div>
      )}
      </div>
    </div>
  );
}