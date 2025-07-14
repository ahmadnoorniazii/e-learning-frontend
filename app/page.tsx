"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpen, Users, Award, TrendingUp, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CourseCard } from '@/components/ui/course-card';
import { useFeaturedCourses } from '@/hooks/use-featured-courses';
import { StatsCard } from '@/components/ui/stats-card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { strapiAPI } from '@/lib/strapi';
import { Course } from '@/lib/types';

import { mockCourses, getMockCoursesByCategory } from '@/lib/mock-data';
import { usePlatformStats } from '@/hooks/use-platform-stats';


import { useCategories } from '@/hooks/use-categories';



export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const [searchQuery, setSearchQuery] = useState('');

  // Featured Courses API integration
  const { courses: featuredCourses, loading: featuredLoading, error: featuredError } = useFeaturedCourses();



  // Map API course to UI Course type
  function mapApiCourseToUICourse(course: any): import('@/lib/types').Course {
    const baseURL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
    
    // Debug logging for course ID mapping
    console.log('🆔 Course ID mapping:', {
      title: course.title,
      numericId: course.id,
      documentId: course.documentId,
      finalId: course.documentId || course.id?.toString() || ''
    });
    
    // Debug logging for thumbnail
    console.log('🖼️ Course thumbnail data:', {
      courseId: course.id,
      title: course.title,
      thumbnail: course.thumbnail,
      hasThumbnail: !!course.thumbnail,
      thumbnailUrl: course.thumbnail?.url,
      thumbnailFormats: course.thumbnail?.formats
    });
    
    // Try to get the best available thumbnail format
    let thumbnailUrl = null;
    if (course.thumbnail?.url) {
      // Use the medium format if available, fallback to main URL
      if (course.thumbnail.formats?.medium?.url) {
        thumbnailUrl = `${baseURL}${course.thumbnail.formats.medium.url}`;
      } else if (course.thumbnail.formats?.small?.url) {
        thumbnailUrl = `${baseURL}${course.thumbnail.formats.small.url}`;
      } else {
        thumbnailUrl = `${baseURL}${course.thumbnail.url}`;
      }
    }
    
    return {
      id: course.documentId || course.id?.toString() || '', // Use documentId for Strapi v5
      title: course.title ?? course.attributes?.title ?? '',
      description: course.description ?? course.attributes?.description ?? '',
      instructor: {
        id: course.instructor?.data?.id?.toString() ?? course.instructor?.id?.toString() ?? '1',
        name: course.instructor?.data?.attributes?.username ?? course.instructor?.username ?? 'Unknown Instructor',
        email: course.instructor?.data?.attributes?.email ?? course.instructor?.email ?? '',
        role: 'instructor',
        avatar: course.instructor?.data?.attributes?.profile?.avatar?.url 
          ? `${baseURL}${course.instructor?.data?.attributes?.profile?.avatar?.url}`
          : undefined,
        createdAt: new Date().toISOString(),
      },
      thumbnail: thumbnailUrl || undefined,
      avatar: course.avatar?.url 
        ? `${baseURL}${course.avatar.url}`
        : (course.avatar as any)?.data?.attributes?.url
        ? `${baseURL}${(course.avatar as any).data.attributes.url}`
        : undefined,
      price: course.price ?? course.attributes?.price ?? 0,
      category: course.category?.data?.attributes?.name || course.category?.name || '',
      level: course.level ?? course.attributes?.level ?? 'beginner',
      duration: course.duration ?? course.attributes?.duration ?? 0,
      lessonsCount: course.lessonsCount ?? course.attributes?.lessons?.data?.length ?? 0,
      studentsCount: course.studentsCount ?? 0,
      rating: course.rating ?? 0,
      reviewsCount: course.reviewsCount ?? 0,
      tags: course.tags?.map((t: any) => t.name || t) ?? [],
      createdAt: course.createdAt ?? new Date().toISOString(),
      lessons: [], // Not needed for card
      isEnrolled: course.isEnrolled,
      progress: course.progress,
    };
  }

  const filteredCourses = featuredCourses
    .map(mapApiCourseToUICourse)
    .filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All Categories' || course.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

  const { stats, loading: statsLoading, error: statsError } = usePlatformStats();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        <div className="container mx-auto px-4 py-8 text-center relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                  Learn Without
                  <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Limits
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-200 leading-relaxed">
                  Join thousands of students learning from industry experts. 
                  Master new skills and advance your career with our comprehensive courses.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold text-lg px-12 py-6 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-white/20" asChild>
                  <Link href="/courses">
                    Start Learning Today
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button 
                  variant="outline"
                  size="lg" 
                  className="border-2 border-white/60 text-white bg-white/10 hover:bg-white/20 hover:text-white hover:border-white/80 backdrop-blur-sm font-semibold text-lg px-12 py-6 rounded-2xl transform hover:scale-105 transition-all duration-300 shadow-xl"
                  asChild
                >
                  <Link href="/courses">Browse Courses</Link>
                </Button>
              </div>

              <div className="flex items-center space-x-8 pt-8">
                <div className="text-center group">
                  <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">50k+</div>
                  <div className="text-gray-300 text-sm group-hover:text-white transition-colors">Students</div>
                </div>
                <div className="text-center group">
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">1.2k+</div>
                  <div className="text-gray-300 text-sm group-hover:text-white transition-colors">Instructors</div>
                </div>
                <div className="text-center group">
                  <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">10k+</div>
                  <div className="text-gray-300 text-sm group-hover:text-white transition-colors">Courses</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 transform hover:scale-105 transition-transform duration-500">
                <Image
                  src="https://images.pexels.com/photos/5212324/pexels-photo-5212324.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Students learning online"
                  width={600}
                  height={400}
                  className="rounded-2xl shadow-2xl border border-white/20"
                />
              </div>
              {/* Floating elements */}
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-80 animate-bounce" />
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full opacity-60 animate-bounce delay-1000" />
              <div className="absolute top-1/2 -right-8 w-16 h-16 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full opacity-70 animate-bounce delay-500" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {statsLoading ? (
              <div className="col-span-4 text-center text-gray-500">Loading stats...</div>
            ) : statsError ? (
              <div className="col-span-4 text-center text-red-500">{statsError}</div>
            ) : stats ? (
              <>
                <div className="transform hover:scale-105 transition-transform duration-300">
                  <StatsCard title="Active Students" value={stats.students?.toLocaleString?.() || stats.students} description="Learning worldwide" icon={Users} trend={{ value: 12, isPositive: true }} />
                </div>
                <div className="transform hover:scale-105 transition-transform duration-300">
                  <StatsCard title="Expert Instructors" value={stats.instructors?.toLocaleString?.() || stats.instructors} description="Industry professionals" icon={Award} trend={{ value: 8, isPositive: true }} />
                </div>
                <div className="transform hover:scale-105 transition-transform duration-300">
                  <StatsCard title="Courses Available" value={stats.courses?.toLocaleString?.() || stats.courses} description="Across all categories" icon={BookOpen} trend={{ value: 15, isPositive: true }} />
                </div>
                <div className="transform hover:scale-105 transition-transform duration-300">
                  <StatsCard title="Completion Rate" value={stats.completionRate + '%'} description="Student success rate" icon={TrendingUp} trend={{ value: 3, isPositive: true }} />
                </div>
              </>
            ) : null}
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
              Featured Courses
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover our most popular courses taught by industry experts
            </p>
          </div>


          {featuredError && (
            <Alert variant="destructive" className="mb-8">
              <AlertDescription>{featuredError}</AlertDescription>
            </Alert>
          )}

          {/* Category Filter */}
          <div className="flex justify-center mb-12">
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                key="all"
                variant={selectedCategory === 'All Categories' ? "default" : "outline"}
                onClick={() => setSelectedCategory('All Categories')}
                className={`h-12 px-6 rounded-xl transition-all duration-300 ${
                  selectedCategory === 'All Categories'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                All Categories
              </Button>
              {categoriesLoading ? (
                <span className="text-gray-500 flex items-center">Loading...</span>
              ) : categoriesError ? (
                <span className="text-red-500 flex items-center">{categoriesError}</span>
              ) : (
                categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.name ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`h-12 px-6 rounded-xl transition-all duration-300 ${
                      selectedCategory === category.name
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                        : 'border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    {category.name}
                  </Button>
                ))
              )}
            </div>
          </div>

          {/* Course Grid */}
          {featuredLoading ? (
            <div className="flex items-center justify-center h-80">
              <div className="relative">
                <div className="animate-spin rounded-full h-32 w-32 border-4 border-blue-200"></div>
                <div className="animate-spin rounded-full h-32 w-32 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredCourses.slice(0, 8).map((course) => (
                  <div key={course.id} className="transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
                    <CourseCard course={course} />
                  </div>
                ))}
              </div>

              <div className="text-center mt-12">
                <Button asChild size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-lg px-12 py-6 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300">
                  <Link href="/courses">
                    View All Courses
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 relative z-10">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl mb-10 max-w-3xl mx-auto text-gray-200 leading-relaxed relative z-10">
            Join thousands of successful students who have transformed their careers through our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center relative z-10">
            <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold text-lg px-12 py-6 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-white/20" asChild>
              <Link href="/auth/register">Get Started Free</Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-2 border-white/60 text-white bg-white/10 hover:bg-white/20 hover:text-white hover:border-white/80 backdrop-blur-sm font-semibold text-lg px-12 py-6 rounded-2xl transform hover:scale-105 transition-all duration-300 shadow-xl"
              asChild
            >
              <Link href="/courses">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}