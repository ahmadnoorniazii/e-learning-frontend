"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Star, BookOpen, Users, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { instructorService, InstructorProfile } from '@/lib/instructor-service';

interface InstructorWithStats extends InstructorProfile {
  courseCount: number;
  averageRating: number;
  totalStudents: number;
}

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<InstructorWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInstructors() {
      try {
        setLoading(true);
        setError(null);

        // Fetch all instructors
        const result = await instructorService.getAllInstructors({
          pageSize: 50,
          sort: 'firstName:asc'
        });

        console.log('🔍 API Result:', result);
        console.log('🔍 Instructors data:', result.data);

        // Fetch stats for each instructor
        const instructorsWithStats = await Promise.all(
          result.data.map(async (instructor) => {
            try {
              const stats = await instructorService.getInstructorStats(instructor.user.id);
              return {
                ...instructor,
                ...stats
              };
            } catch (error) {
              console.error(`Error fetching stats for instructor ${instructor.id}:`, error);
              return {
                ...instructor,
                courseCount: 0,
                averageRating: 0,
                totalStudents: 0,
              };
            }
          })
        );

        console.log('🔍 Instructors with stats:', instructorsWithStats);

        setInstructors(instructorsWithStats);
      } catch (err) {
        console.error('Error fetching instructors:', err);
        setError('Failed to load instructors. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchInstructors();
  }, []);

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
    return 'Location not specified';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading instructors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Expert <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-300">Instructors</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
              Learn from industry professionals who bring real-world experience to every lesson
            </p>
            <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold text-lg px-12 py-6 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300" asChild>
              <Link href="/auth/register">Become an Instructor</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* All Instructors */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">All Instructors</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Browse our complete roster of expert instructors across all categories
            </p>
          </div>

          {instructors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No instructors found. Please try again later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {instructors.map((instructor) => (
                <Card key={instructor.id} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-white/90 backdrop-blur-sm flex flex-col h-full">
                  <CardContent className="p-8 flex flex-col flex-1">
                    <div className="text-center mb-6">
                      <div className="relative inline-block">
                        <Avatar className="h-24 w-24 mx-auto ring-4 ring-white shadow-2xl">
                          <AvatarImage 
                            src={getAvatarUrl(instructor) || ''} 
                            alt={getInstructorName(instructor)}
                          />
                          <AvatarFallback className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                            {getInstructorName(instructor).split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mt-4 mb-2">
                        {getInstructorName(instructor)}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {instructor.bio || instructor.instructorBio || 'Experienced instructor'}
                      </p>
                    </div>

                    <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 mb-6">
                      <div className="flex items-center space-x-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{instructor.courseCount} courses</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{instructor.totalStudents} students</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{instructor.averageRating.toFixed(1)}</span>
                      </div>
                    </div>

                    <div className="flex-1 space-y-4 mb-6">
                      {instructor.expertise && instructor.expertise.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Expertise</h4>
                          <div className="flex flex-wrap gap-2">
                            {instructor.expertise.slice(0, 3).map((skill, index) => (
                              <Badge key={index} variant="secondary" className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200">
                                {skill}
                              </Badge>
                            ))}
                            {instructor.expertise.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{instructor.expertise.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-auto">
                      <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 mb-6">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{getInstructorLocation(instructor)}</span>
                        </div>
                      </div>

                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" asChild>
                        <Link href={`/instructors/${instructor.documentId}`}>
                          View Profile
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
