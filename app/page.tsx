"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpen, Users, Award, TrendingUp, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CourseCard } from '@/components/ui/course-card';
import { StatsCard } from '@/components/ui/stats-card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { strapiAPI } from '@/lib/strapi';
import { Course } from '@/lib/types';
import { mockCourses, getMockCoursesByCategory } from '@/lib/mock-data';

const categories = [
  'All Categories',
  'Web Development',
  'Data Science',
  'Design',
  'Marketing',
  'Business',
  'Photography',
];

const featuredStats = [
  {
    title: 'Active Students',
    value: '50,000+',
    description: 'Learning worldwide',
    icon: Users,
    trend: { value: 12, isPositive: true }
  },
  {
    title: 'Expert Instructors',
    value: '1,200+',
    description: 'Industry professionals',
    icon: Award,
    trend: { value: 8, isPositive: true }
  },
  {
    title: 'Courses Available',
    value: '10,000+',
    description: 'Across all categories',
    icon: BookOpen,
    trend: { value: 15, isPositive: true }
  },
  {
    title: 'Completion Rate',
    value: '94%',
    description: 'Student success rate',
    icon: TrendingUp,
    trend: { value: 3, isPositive: true }
  }
];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false);

  useEffect(() => {
    fetchFeaturedCourses();
  }, [selectedCategory]);

  const fetchFeaturedCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      // If we're already using mock data, continue using it
      if (useMockData) {
        const mockData = getMockCoursesByCategory(selectedCategory);
        setCourses(mockData);
        setLoading(false);
        return;
      }

      const filters: any = {};
      if (selectedCategory !== 'All Categories') {
        filters.category = selectedCategory;
      }

      const response = await strapiAPI.getCourses({
        page: 1,
        pageSize: 8,
        filters
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
          createdAt: new Date().toISOString()
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
          videoUrl: lesson.attributes.videoUrl
        })) || []
      })) || [];

      setCourses(transformedCourses);
    } catch (err) {
      console.error('Error fetching courses:', err);
      
      // Check if this is a connection error
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      if (errorMessage.includes('connect') || errorMessage.includes('fetch') || errorMessage.includes('timeout')) {
        console.log('🔄 Strapi server not available, switching to mock data');
        setUseMockData(true);
        const mockData = getMockCoursesByCategory(selectedCategory);
        setCourses(mockData);
        setError('Demo mode: Using sample data. To connect to Strapi, ensure your backend server is running at http://localhost:1337');
      } else {
        setError(`Failed to load courses: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

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
        <div className="relative container py-20 md:py-32">
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
                  className="border-2 border-white/40 text-white hover:bg-white/20 hover:text-white hover:border-white/60 backdrop-blur-sm font-semibold text-lg px-12 py-6 rounded-2xl transform hover:scale-105 transition-all duration-300 shadow-xl"
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
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredStats.map((stat, index) => (
              <div key={index} className="transform hover:scale-105 transition-transform duration-300">
                <StatsCard {...stat} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
              Featured Courses
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover our most popular courses taught by industry experts
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-8">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Category Filter */}
          <div className="flex justify-center mb-12">
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className={`h-12 px-6 rounded-xl transition-all duration-300 ${
                    selectedCategory === category 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105' 
                      : 'border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Course Grid */}
          {loading ? (
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
        <div className="container text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 relative z-10">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl mb-10 max-w-3xl mx-auto text-gray-200 leading-relaxed relative z-10">
            Join thousands of successful students who have transformed their careers through our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center relative z-10">
            <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold text-lg px-12 py-6 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-white/20" asChild>
              <Link href="/auth/register">Get Started Free</Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-2 border-white/40 text-white hover:bg-white/20 hover:text-white hover:border-white/60 backdrop-blur-sm font-semibold text-lg px-12 py-6 rounded-2xl transform hover:scale-105 transition-all duration-300 shadow-xl"
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