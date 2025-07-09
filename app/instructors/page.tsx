import Image from 'next/image';
import Link from 'next/link';
import { Star, BookOpen, Users, Award, MapPin, Globe, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const instructors = [
  {
    id: '1',
    name: 'Sarah Johnson',
    title: 'Senior Full-Stack Developer',
    bio: 'Passionate educator with 8+ years of experience in web development. Specializes in React, Node.js, and modern JavaScript frameworks.',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.9,
    students: 15420,
    courses: 12,
    specialties: ['React', 'Node.js', 'JavaScript', 'TypeScript'],
    location: 'San Francisco, CA',
    website: 'https://sarahjohnson.dev',
    email: 'sarah@example.com',
    featured: true
  },
  {
    id: '2',
    name: 'Dr. Emily Rodriguez',
    title: 'Data Science Expert',
    bio: 'PhD in Computer Science with expertise in machine learning and data analysis. Former researcher at Stanford University.',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.8,
    students: 12300,
    courses: 8,
    specialties: ['Python', 'Machine Learning', 'Data Analysis', 'AI'],
    location: 'Boston, MA',
    website: 'https://emilyrodriguez.com',
    email: 'emily@example.com',
    featured: true
  },
  {
    id: '3',
    name: 'Michael Chen',
    title: 'React Development Specialist',
    bio: 'Frontend architect with deep expertise in React ecosystem. Previously worked at Google and Facebook.',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.9,
    students: 8750,
    courses: 6,
    specialties: ['React', 'Redux', 'JavaScript', 'Testing'],
    location: 'Seattle, WA',
    website: 'https://michaelchen.dev',
    email: 'michael@example.com',
    featured: true
  },
  {
    id: '4',
    name: 'Alex Parker',
    title: 'UI/UX Design Expert',
    bio: 'Award-winning designer with 10+ years of experience creating beautiful and functional user interfaces.',
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.7,
    students: 9650,
    courses: 10,
    specialties: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
    location: 'New York, NY',
    website: 'https://alexparker.design',
    email: 'alex@example.com',
    featured: false
  },
  {
    id: '5',
    name: 'James Wilson',
    title: 'Digital Marketing Strategist',
    bio: 'Marketing expert who has helped hundreds of businesses grow their online presence through effective digital strategies.',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.6,
    students: 11200,
    courses: 15,
    specialties: ['SEO', 'Google Ads', 'Social Media', 'Analytics'],
    location: 'Austin, TX',
    website: 'https://jameswilson.marketing',
    email: 'james@example.com',
    featured: false
  },
  {
    id: '6',
    name: 'Lisa Thompson',
    title: 'Business Strategy Consultant',
    bio: 'Former McKinsey consultant with expertise in business strategy, leadership, and organizational development.',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.8,
    students: 6420,
    courses: 7,
    specialties: ['Strategy', 'Leadership', 'Management', 'Communication'],
    location: 'Chicago, IL',
    website: 'https://lisathompson.biz',
    email: 'lisa@example.com',
    featured: false
  },
  {
    id: '7',
    name: 'David Kim',
    title: 'Photography Master',
    bio: 'Professional photographer and educator with work featured in National Geographic and Vogue.',
    avatar: 'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.7,
    students: 8900,
    courses: 9,
    specialties: ['DSLR', 'Composition', 'Lighting', 'Post-processing'],
    location: 'Los Angeles, CA',
    website: 'https://davidkim.photo',
    email: 'david@example.com',
    featured: false
  },
  {
    id: '8',
    name: 'Maria Garcia',
    title: 'Mobile App Developer',
    bio: 'iOS and Android development expert with apps downloaded by millions of users worldwide.',
    avatar: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.8,
    students: 7300,
    courses: 11,
    specialties: ['Swift', 'Kotlin', 'React Native', 'Flutter'],
    location: 'Miami, FL',
    website: 'https://mariagarcia.dev',
    email: 'maria@example.com',
    featured: false
  }
];

export default function InstructorsPage() {
  const featuredInstructors = instructors.filter(instructor => instructor.featured);
  const allInstructors = instructors;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="relative container mx-auto py-20 md:py-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Learn from
              <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Expert Instructors
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 leading-relaxed mb-8 max-w-3xl mx-auto">
              Our world-class instructors bring years of industry experience and passion for teaching 
              to help you master new skills and advance your career.
            </p>
            <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold text-lg px-12 py-6 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300" asChild>
              <Link href="/auth/register">Become an Instructor</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* Featured Instructors */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Featured Instructors</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Meet some of our top-rated instructors who are making a difference in students' lives
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredInstructors.map((instructor) => (
              <Card key={instructor.id} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-white/90 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="relative inline-block">
                      <Avatar className="h-24 w-24 mx-auto ring-4 ring-white shadow-2xl">
                        <AvatarImage src={instructor.avatar} alt={instructor.name} />
                        <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                          {instructor.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                        Featured
                      </Badge>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mt-4 mb-2">{instructor.name}</h3>
                    <p className="text-blue-600 font-medium mb-4">{instructor.title}</p>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-center space-x-6 text-sm">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{instructor.rating}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span>{instructor.students.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <BookOpen className="h-4 w-4 text-gray-500" />
                        <span>{instructor.courses} courses</span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed text-center">
                      {instructor.bio}
                    </p>

                    <div className="flex flex-wrap gap-2 justify-center">
                      {instructor.specialties.slice(0, 3).map((specialty) => (
                        <Badge key={specialty} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 mb-6">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{instructor.location}</span>
                    </div>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" asChild>
                    <Link href={`/instructors/${instructor.id}`}>
                      View Profile
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* All Instructors */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">All Instructors</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Browse our complete roster of expert instructors across all categories
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {allInstructors.map((instructor) => (
              <Card key={instructor.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <Avatar className="h-16 w-16 mx-auto mb-3">
                      <AvatarImage src={instructor.avatar} alt={instructor.name} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                        {instructor.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-bold text-gray-900 mb-1">{instructor.name}</h3>
                    <p className="text-blue-600 text-sm font-medium mb-3">{instructor.title}</p>
                  </div>

                  <div className="flex items-center justify-center space-x-4 text-xs mb-4">
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{instructor.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3 text-gray-500" />
                      <span>{instructor.students.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <BookOpen className="h-3 w-3 text-gray-500" />
                      <span>{instructor.courses}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 justify-center mb-4">
                    {instructor.specialties.slice(0, 2).map((specialty) => (
                      <Badge key={specialty} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>

                  <Button variant="outline" className="w-full text-sm" asChild>
                    <Link href={`/instructors/${instructor.id}`}>
                      View Profile
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-20 text-center">
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white">
            <CardContent className="p-12">
              <h2 className="text-4xl font-bold mb-6">Want to Become an Instructor?</h2>
              <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
                Share your expertise with thousands of students worldwide. Join our community of passionate educators.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold text-lg px-12 py-6 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300" asChild>
                  <Link href="/auth/register">Apply to Teach</Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-2 border-white/40 text-white hover:bg-white/20 hover:text-white hover:border-white/60 backdrop-blur-sm font-semibold text-lg px-12 py-6 rounded-2xl transform hover:scale-105 transition-all duration-300"
                  asChild
                >
                  <Link href="/about">Learn More</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}