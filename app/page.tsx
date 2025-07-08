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

  useEffect(() => {
    fetchFeaturedCourses();
  }, [selectedCategory]);

  const fetchFeaturedCourses = async () => {
    try {
      setLoading(true);
      setError(null);

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
      setError('Failed to load courses. Please check your connection.');
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
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative container py-20 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                  Learn Without
                  <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                    Limits
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-blue-100 leading-relaxed">
                  Join thousands of students learning from industry experts. 
                  Master new skills and advance your career with our comprehensive courses.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6" asChild>
                  <Link href="/courses">
                    Start Learning Today
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-6"
                  asChild
                >
                  <Link href="/courses">Browse Courses</Link>
                </Button>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">50k+</div>
                  <div className="text-blue-200 text-sm">Students</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">1.2k+</div>
                  <div className="text-blue-200 text-sm">Instructors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">10k+</div>
                  <div className="text-blue-200 text-sm">Courses</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10">
                <Image
                  src="https://images.pexels.com/photos/5212324/pexels-photo-5212324.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Students learning online"
                  width={600}
                  height={400}
                  className="rounded-2xl shadow-2xl"
                />
              </div>
              {/* Floating elements */}
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-yellow-400 rounded-full opacity-80 animate-pulse" />
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-green-400 rounded-full opacity-60 animate-pulse delay-1000" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredStats.map((stat, index) => (
              <StatsCard key={index} {...stat} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Featured Courses
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover our most popular courses taught by industry experts
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-8">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Search and Filter */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category)}
                    className="h-12"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Course Grid */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>

              {filteredCourses.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground">
                    No courses found matching your criteria.
                  </p>
                </div>
              )}
            </>
          )}

          <div className="text-center mt-12">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link href="/courses">
                View All Courses
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-blue-100">
            Join thousands of successful students who have transformed their careers through our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6" asChild>
              <Link href="/auth/register">Get Started Free</Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-6"
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