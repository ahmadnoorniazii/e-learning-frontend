"use client";

import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, SlidersHorizontal, Grid, List, Star, Clock, Users, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CourseCard } from '@/components/ui/course-card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Course as ApiCourse, CourseCategory } from '@/lib/api-client';
import courseService from '@/lib/course-service';
import categoriesService from '@/lib/categories-service';
import Link from 'next/link';
import Image from 'next/image';

// Transform API course to match CourseCard expectations
const transformCourse = (apiCourse: ApiCourse): any => {
  const baseURL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
  
  const thumbnailUrl = apiCourse.thumbnail?.url ? `${baseURL}${apiCourse.thumbnail.url}` : null;
  const avatarUrl = apiCourse.avatar?.url ? `${baseURL}${apiCourse.avatar.url}` : null;
  
  // Debug logging
  console.log('Transforming course:', {
    id: apiCourse.id,
    documentId: apiCourse.documentId,
    title: apiCourse.title,
    thumbnailUrl,
    avatarUrl,
    rawThumbnail: apiCourse.thumbnail,
    rawAvatar: apiCourse.avatar
  });
  
  return {
    id: apiCourse.documentId || apiCourse.id.toString(), // Use documentId for Strapi v5
    title: apiCourse.title,
    description: apiCourse.description,
    slug: apiCourse.slug,
    thumbnail: thumbnailUrl,
    avatar: avatarUrl,
    price: apiCourse.price,
    rating: apiCourse.rating || 0,
    totalRatings: apiCourse.totalRatings || 0,
    enrollmentCount: apiCourse.enrollmentCount || 0,
    studentsCount: apiCourse.enrollmentCount || 0,
    reviewsCount: apiCourse.totalRatings || 0,
    duration: apiCourse.duration || 0,
    level: apiCourse.difficultyLevel || 'beginner',
    // Handle both nested and direct category structure
    category: (apiCourse as any).category?.name || apiCourse.category?.data?.attributes?.name || 'Uncategorized',
    // Handle both nested and direct tags structure
    tags: (apiCourse as any).tags?.map?.((tag: any) => tag.name) || 
          apiCourse.tags?.data?.map?.((tag: any) => tag.attributes?.name || tag.name) || [],
    instructor: {
      name: (apiCourse as any).instructor?.username || 
            apiCourse.instructor?.data?.attributes?.username || 'Unknown Instructor',
      avatar: null
    },
    lessonsCount: (apiCourse as any).lessons?.length || 
                  apiCourse.lessons?.data?.length || 0,
    createdAt: apiCourse.createdAt,
    isFree: apiCourse.isFree || false,
    isPremium: apiCourse.isPremium || false,
    featured: apiCourse.featured || false,
    isActive: apiCourse.isActive !== false // Default to true if not specified
  };
};

const levels = ['All Levels', 'beginner', 'intermediate', 'advanced'];
const sortOptions = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' }
];

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedLevel, setSelectedLevel] = useState('All Levels');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [totalCourses, setTotalCourses] = useState(0);
  const [searchLoading, setSearchLoading] = useState(false);

  const fetchCourses = async () => {
    try {
      // Fetch courses with pagination (get more if needed)
      const response = await courseService.getPublicCourses({
        page: 1,
        pageSize: 100 // Get more courses for filtering
      });

      if (response && response.data) {
        const transformedCourses = response.data.map(transformCourse);
        setAllCourses(transformedCourses);
        setTotalCourses(response.meta?.pagination?.total || transformedCourses.length);
      } else {
        setAllCourses([]);
        setTotalCourses(0);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses. Please check your connection.');
      setAllCourses([]);
      setTotalCourses(0);
    }
  };

  const applyFiltersAndSort = useCallback(() => {
    let filteredCourses = [...allCourses];

    // Apply category filter
    if (selectedCategory !== 'All Categories') {
      filteredCourses = filteredCourses.filter((course: any) => 
        course.category === selectedCategory
      );
    }

    // Apply level filter
    if (selectedLevel !== 'All Levels') {
      filteredCourses = filteredCourses.filter((course: any) => 
        course.level === selectedLevel
      );
    }

    setCourses(filteredCourses);
  }, [allCourses, selectedCategory, selectedLevel]);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      applyFiltersAndSort();
      return;
    }

    try {
      setSearchLoading(true);
      const response = await courseService.searchCourses(query);
      
      if (response && response.data) {
        const transformedCourses = response.data.map(transformCourse);
        
        // Apply filters to search results
        let filteredResults = transformedCourses;
        
        if (selectedCategory !== 'All Categories') {
          filteredResults = filteredResults.filter((course: any) => 
            course.category === selectedCategory
          );
        }

        if (selectedLevel !== 'All Levels') {
          filteredResults = filteredResults.filter((course: any) => 
            course.level === selectedLevel
          );
        }

        setCourses(filteredResults);
      } else {
        setCourses([]);
      }
    } catch (err) {
      console.error('Error searching courses:', err);
      // Fallback to local search
      applyFiltersAndSort();
    } finally {
      setSearchLoading(false);
    }
  }, [selectedCategory, selectedLevel, applyFiltersAndSort]);

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, handleSearch]);

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load categories
        const categoriesData = await categoriesService.getCategories();
        setCategories(categoriesData);

        // Load all courses
        await fetchCourses();
      } catch (err) {
        console.error('Error initializing data:', err);
        setError('Failed to load data. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [applyFiltersAndSort]);

  // For local filtering when search is empty
  const filteredCourses = searchQuery.trim() ? courses : courses.filter(course => {
    const matchesSearch = !searchQuery.trim() || 
                         (course.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (course.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (course.tags || []).some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'price-low':
        return (a.price ?? 0) - (b.price ?? 0);
      case 'price-high':
        return (b.price ?? 0) - (a.price ?? 0);
      case 'rating':
        return (b.rating ?? 0) - (a.rating ?? 0);
      case 'popular':
      default:
        return (b.studentsCount ?? 0) - (a.studentsCount ?? 0);
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
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent">
          All Courses
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          {totalCourses > 0 ? (
            <>Discover {totalCourses} courses from expert instructors across all categories</>
          ) : (
            <>Explore our comprehensive course catalog</>
          )}
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
                disabled={searchLoading}
              />
              {searchLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                </div>
              )}
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full lg:w-48 h-14 border-2 border-gray-200 rounded-xl">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {['All Categories', ...categories.map(cat => cat.name)].map((categoryName) => (
                  <SelectItem key={categoryName} value={categoryName}>
                    {categoryName}
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
                    {level === 'All Levels' ? level : level.charAt(0).toUpperCase() + level.slice(1)}
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
            Showing <span className="font-semibold text-blue-600">{sortedCourses.length}</span> of <span className="font-semibold">{totalCourses}</span> courses
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
                  <div className="h-full">
                    <CourseCard course={course} />
                  </div>
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
                        <Image
                          src={course.thumbnail ?? '/placeholder-course.jpg'}
                          alt={course.title ?? 'Course'}
                          width={320}
                          height={192}
                          className="w-full h-48 md:h-full object-cover rounded-xl"
                        />
                      </div>
                      <div className="flex-1 space-y-4">
                        <div>
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                              <Link href={`/courses/${course.id}`}>
                                {course.title ?? 'Untitled Course'}
                              </Link>
                            </h3>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-blue-600">${course.price ?? 0}</div>
                            </div>
                          </div>
                          <p className="text-gray-600 line-clamp-2 mb-4">{course.description ?? 'No description available'}</p>
                        </div>
                        
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={course.instructor?.avatar} alt={course.instructor?.name ?? 'Instructor'} />
                              <AvatarFallback>
                                {(course.instructor?.name ?? 'IN').split(' ').map((n: string) => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium text-gray-700">{course.instructor?.name ?? 'Instructor'}</span>
                          </div>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {course.category ?? 'Uncategorized'}
                          </Badge>
                          <Badge variant="secondary" className="bg-purple-50 text-purple-700">
                            {course.level ?? 'All Levels'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-6 text-sm text-gray-600 flex-1">
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{course.rating ?? 0}</span>
                              <span>({course.reviewsCount ?? 0})</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4" />
                              <span>{(course.studentsCount ?? 0).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{formatDuration(course.duration ?? 0)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <BookOpen className="h-4 w-4" />
                              <span>{course.lessonsCount ?? 0} lessons</span>
                            </div>
                          </div>
                          <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl ml-4 flex-shrink-0">
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