import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle, Users, BookOpen, Award, Target, Heart, Lightbulb, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const stats = [
  { number: '50,000+', label: 'Active Students', icon: Users },
  { number: '1,200+', label: 'Expert Instructors', icon: Award },
  { number: '10,000+', label: 'Courses Available', icon: BookOpen },
  { number: '94%', label: 'Completion Rate', icon: Target },
];

const values = [
  {
    icon: Heart,
    title: 'Student-Centered',
    description: 'We put learners first, designing every experience around their success and growth.'
  },
  {
    icon: Lightbulb,
    title: 'Innovation',
    description: 'We embrace cutting-edge technology to create engaging and effective learning experiences.'
  },
  {
    icon: Globe,
    title: 'Accessibility',
    description: 'Quality education should be accessible to everyone, anywhere in the world.'
  },
  {
    icon: Award,
    title: 'Excellence',
    description: 'We maintain the highest standards in content quality and educational outcomes.'
  },
];

const team = [
  {
    name: 'Sarah Johnson',
    role: 'CEO & Co-Founder',
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
    bio: 'Former education technology executive with 15+ years of experience in online learning.'
  },
  {
    name: 'Michael Chen',
    role: 'CTO & Co-Founder',
    image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
    bio: 'Technology leader passionate about building scalable platforms that democratize education.'
  },
  {
    name: 'Dr. Emily Rodriguez',
    role: 'Head of Content',
    image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
    bio: 'Educational researcher and former university professor specializing in online pedagogy.'
  },
  {
    name: 'David Kim',
    role: 'Head of Design',
    image: 'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=400',
    bio: 'UX designer focused on creating intuitive and engaging learning experiences.'
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
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
              Empowering Learners
              <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Worldwide
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 leading-relaxed mb-8 max-w-3xl mx-auto">
              We're on a mission to make quality education accessible to everyone, everywhere. 
              Join millions of learners who are transforming their lives through our platform.
            </p>
            <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-lg px-12 py-6 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300" asChild>
              <Link href="/courses">Start Learning Today</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                We believe that education is the key to unlocking human potential. Our platform 
                connects passionate instructors with eager learners, creating a global community 
                where knowledge flows freely and growth never stops.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Democratize access to quality education</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Foster a global learning community</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Empower instructors to share their expertise</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Drive innovation in online education</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <Image
                src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Team collaboration"
                width={600}
                height={400}
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These core principles guide everything we do and shape the culture of our platform.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Passionate educators and technologists working together to transform online learning.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="relative mb-6">
                    <Image
                      src={member.image}
                      alt={member.name}
                      width={120}
                      height={120}
                      className="rounded-full mx-auto shadow-lg"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-4">{member.role}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="container mx-auto text-center relative z-10 px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Join Our Learning Community
          </h2>
          <p className="text-xl mb-10 max-w-3xl mx-auto text-gray-200 leading-relaxed">
            Whether you're looking to learn new skills or share your expertise, 
            we'd love to have you as part of our growing community.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-lg px-12 py-6 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-white/20" asChild>
              <Link href="/auth/register">Start Learning</Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-2 border-white/40 text-white hover:bg-white/20 hover:text-white hover:border-white/60 backdrop-blur-sm text-lg px-12 py-6 rounded-2xl transform hover:scale-105 transition-all duration-300 shadow-xl"
              asChild
            >
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}