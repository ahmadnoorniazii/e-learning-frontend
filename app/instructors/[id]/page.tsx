"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, BookOpen, Users, Award, MapPin, Globe, Mail, ArrowLeft, Calendar, Clock, Play, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress as ProgressBar } from '@/components/ui/progress';
import { instructorService, InstructorProfile, Course, Review } from '@/lib/instructor-service';

export default function InstructorDetailsPage() {
  const params = useParams();
  const instructorId = params.id as string;
  
  const [instructor, setInstructor] = useState<InstructorProfile | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<{
    courseCount: number;
    totalStudents: number;
    averageRating: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInstructorData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch instructor profile
        const instructorData = await instructorService.getInstructorById(instructorId);
        setInstructor(instructorData);

        // Fetch instructor's courses, reviews, and stats in parallel
        const [coursesData, reviewsData, statsData] = await Promise.all([
          instructorService.getInstructorCourses(instructorData.user.id, { 
            pageSize: 20,
            sort: 'rating:desc'
          }),
          instructorService.getInstructorReviews(instructorData.user.id, { 
            pageSize: 10
          }),
          instructorService.getInstructorStats(instructorData.user.id)
        ]);

        setCourses(coursesData.data);
        setReviews(reviewsData.data);
        setStats(statsData);

      } catch (err) {
        console.error('Error fetching instructor data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load instructor data');
      } finally {
        setLoading(false);
      }
    }

    if (instructorId) {
      fetchInstructorData();
    }
  }, [instructorId]);

  const getInstructorName = (instructor: InstructorProfile) => {
    if (instructor.firstName && instructor.lastName) {
      return `${instructor.firstName} ${instructor.lastName}`;
    }
    if (instructor.firstName) return instructor.firstName;
    if (instructor.lastName) return instructor.lastName;
    return instructor.user.username;
  };

  const getInstructorLocation = (instructor: InstructorProfile) => {
    if (instructor.city && instructor.country) {
      return `${instructor.city}, ${instructor.country}`;
    }
    if (instructor.city) return instructor.city;
    if (instructor.country) return instructor.country;
    return null;
  };

  const getAvatarUrl = (instructor: InstructorProfile) => {
    if (instructor.avatar?.url) {
      // Check if URL is already absolute
      if (instructor.avatar.url.startsWith('http')) {
        return instructor.avatar.url;
      }
      // For relative URLs, prepend the base URL
      return `${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}${instructor.avatar.url}`;
    }
    return null;
  };

  const getCourseImageUrl = (course: Course) => {
    if (course.thumbnail?.url) {
      // Check if URL is already absolute
      if (course.thumbnail.url.startsWith('http')) {
        return course.thumbnail.url;
      }
      // For relative URLs, prepend the base URL
      return `${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}${course.thumbnail.url}`;
    }
    return null;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading instructor profile...</p>
        </div>
      </div>
    );
  }

  if (error || !instructor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Instructor not found'}</p>
          <div className="space-x-4">
            <Button onClick={() => window.location.reload()}>Try Again</Button>
            <Button variant="outline" asChild>
              <Link href="/instructors">Back to Instructors</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/instructors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Instructors
            </Link>
          </Button>
        </div>
      </div>

      {/* Instructor Profile Header */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-white/20">
                  <AvatarImage src={getAvatarUrl(instructor) || undefined} alt={getInstructorName(instructor)} />
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    {getInstructorName(instructor).split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                  Online
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{getInstructorName(instructor)}</h1>
                <p className="text-xl text-blue-100 mb-4">{instructor.occupation || 'Expert Instructor'}</p>
                <p className="text-blue-100 mb-6 leading-relaxed">
                  {instructor.bio || instructor.instructorBio || 'Passionate educator committed to helping students succeed.'}
                </p>

                <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="font-semibold">{stats?.averageRating.toFixed(1) || 'New'}</span>
                    <span className="text-blue-100">Rating</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-300" />
                    <span className="font-semibold">{stats?.totalStudents.toLocaleString() || '0'}</span>
                    <span className="text-blue-100">Students</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-blue-300" />
                    <span className="font-semibold">{stats?.courseCount || '0'}</span>
                    <span className="text-blue-100">Courses</span>
                  </div>
                  {getInstructorLocation(instructor) && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-blue-300" />
                      <span className="text-blue-100">{getInstructorLocation(instructor)}</span>
                    </div>
                  )}
                </div>

                {instructor.expertise && instructor.expertise.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {instructor.expertise.map((specialty, index) => (
                      <Badge key={index} variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="courses">Courses ({courses.length})</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>

            <TabsContent value="about">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        About {getInstructorName(instructor)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose max-w-none">
                        {instructor.instructorBio ? (
                          <div dangerouslySetInnerHTML={{ __html: instructor.instructorBio }} />
                        ) : (
                          <p className="text-gray-700 leading-relaxed">
                            {instructor.bio || 'This instructor is passionate about sharing knowledge and helping students achieve their learning goals.'}
                          </p>
                        )}
                      </div>

                      {instructor.expertise && instructor.expertise.length > 0 && (
                        <div className="mt-6">
                          <h3 className="font-semibold text-gray-900 mb-3">Areas of Expertise</h3>
                          <div className="flex flex-wrap gap-2">
                            {instructor.expertise.map((skill, index) => (
                              <Badge key={index} variant="outline">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Instructor Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Courses</span>
                        <span className="font-semibold">{stats?.courseCount || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Students</span>
                        <span className="font-semibold">{stats?.totalStudents?.toLocaleString() || '0'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Reviews</span>
                        <span className="font-semibold">{reviews.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Experience Level</span>
                        <span className="font-semibold capitalize">{instructor.experienceLevel || 'Expert'}</span>
                      </div>
                      {stats && stats.averageRating > 0 && (
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-gray-600">Average Rating</span>
                            <span className="font-semibold">{stats.averageRating.toFixed(1)}/5.0</span>
                          </div>
                          <ProgressBar value={stats.averageRating * 20} className="h-2" />
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {instructor.socialLinks && Object.keys(instructor.socialLinks).length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Social Links</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {instructor.socialLinks.website && (
                          <div className="flex items-center gap-3">
                            <Globe className="h-4 w-4 text-gray-500" />
                            <a 
                              href={instructor.socialLinks.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                              Website <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                        {instructor.socialLinks.linkedin && (
                          <div className="flex items-center gap-3">
                            <svg className="h-4 w-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                            <a 
                              href={instructor.socialLinks.linkedin} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                              LinkedIn <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                        {instructor.socialLinks.twitter && (
                          <div className="flex items-center gap-3">
                            <svg className="h-4 w-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                            </svg>
                            <a 
                              href={instructor.socialLinks.twitter} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                              Twitter <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                        {instructor.socialLinks.github && (
                          <div className="flex items-center gap-3">
                            <svg className="h-4 w-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                            <a 
                              href={instructor.socialLinks.github} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                              GitHub <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="courses">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Courses by {getInstructorName(instructor)}</h2>
                
                {courses.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">This instructor hasn&apos;t published any courses yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                      <Card key={course.id} className="hover:shadow-lg transition-shadow">
                        <div className="relative">
                          {getCourseImageUrl(course) ? (
                            <Image
                              src={getCourseImageUrl(course)!}
                              alt={course.title}
                              width={400}
                              height={200}
                              className="w-full h-48 object-cover rounded-t-lg"
                            />
                          ) : (
                            <div className="w-full h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg flex items-center justify-center">
                              <BookOpen className="h-12 w-12 text-white/70" />
                            </div>
                          )}
                          <div className="absolute top-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-sm">
                            ${course.price || 0}
                          </div>
                        </div>
                        <CardContent className="p-6">
                          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{course.title}</h3>
                          {course.description && (
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                          )}
                          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span>{course.reviews && course.reviews.length > 0 ? 
                                (course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length).toFixed(1) : 'New'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>0</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{course.duration || 'TBD'}</span>
                            </div>
                            <div className="flex items-center gap-1 capitalize">
                              <Award className="h-4 w-4" />
                              <span>{course.level || 'Beginner'}</span>
                            </div>
                          </div>
                          <Button className="w-full" asChild>
                            <Link href={`/courses/${course.documentId}`}>
                              View Course
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="reviews">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Student Reviews</h2>
                  {stats && stats.averageRating > 0 && (
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-400 fill-current" />
                      <span className="text-lg font-semibold">{stats.averageRating.toFixed(1)}</span>
                      <span className="text-gray-600">({reviews.length} reviews)</span>
                    </div>
                  )}
                </div>

                {reviews.length === 0 ? (
                  <div className="text-center py-12">
                    <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No reviews yet for this instructor&apos;s courses.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <Card key={review.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                                {review.student?.username.substring(0, 2).toUpperCase() || 'NA'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <h4 className="font-semibold">{review.student?.username || 'Anonymous'}</h4>
                                  <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-4 w-4 ${
                                          i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <span className="text-sm text-gray-500">{timeAgo(review.createdAt)}</span>
                              </div>
                              <p className="text-gray-700 mb-2">{review.comment}</p>
                              <p className="text-xs text-gray-500">Course: {review.course?.title || 'Unknown Course'}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="contact">
              <Card>
                <CardHeader>
                  <CardTitle>Get in Touch</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <Mail className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-semibold">Email</p>
                        <p className="text-gray-600">{instructor.user.email}</p>
                      </div>
                    </div>
                    
                    {instructor.phoneNumber && (
                      <div className="flex items-center gap-4">
                        <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <div>
                          <p className="font-semibold">Phone</p>
                          <p className="text-gray-600">{instructor.phoneNumber}</p>
                        </div>
                      </div>
                    )}
                    
                    {getInstructorLocation(instructor) && (
                      <div className="flex items-center gap-4">
                        <MapPin className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-semibold">Location</p>
                          <p className="text-gray-600">{getInstructorLocation(instructor)}</p>
                        </div>
                      </div>
                    )}

                    {instructor.socialLinks?.website && (
                      <div className="flex items-center gap-4">
                        <Globe className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-semibold">Website</p>
                          <a 
                            href={instructor.socialLinks.website} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            {instructor.socialLinks.website} <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
