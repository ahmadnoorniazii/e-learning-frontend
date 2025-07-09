"use client";

import { useState } from 'react';
import { Search, HelpCircle, MessageSquare, Book, Video, FileText, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

const faqData = [
  {
    category: 'Getting Started',
    questions: [
      {
        question: 'How do I create an account?',
        answer: 'Click the "Sign Up" button in the top right corner and choose between Student or Instructor account. Fill in your details and verify your email to get started.'
      },
      {
        question: 'What\'s the difference between Student and Instructor accounts?',
        answer: 'Student accounts can enroll in courses, track progress, and earn certificates. Instructor accounts can create and manage courses, view analytics, and earn revenue from course sales.'
      },
      {
        question: 'How do I enroll in a course?',
        answer: 'Browse our course catalog, click on a course you\'re interested in, and click the "Enroll Now" button. You\'ll need to complete the payment process to access the course content.'
      }
    ]
  },
  {
    category: 'Courses & Learning',
    questions: [
      {
        question: 'Can I access courses offline?',
        answer: 'Currently, our courses require an internet connection to access. However, you can download course materials and resources for offline reference.'
      },
      {
        question: 'How long do I have access to a course?',
        answer: 'Once you enroll in a course, you have lifetime access to the content. You can learn at your own pace and revisit materials anytime.'
      },
      {
        question: 'Do I get a certificate after completing a course?',
        answer: 'Yes! Upon successful completion of a course, you\'ll receive a digital certificate that you can download and share on professional networks.'
      }
    ]
  },
  {
    category: 'Payment & Billing',
    questions: [
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and various local payment methods depending on your region.'
      },
      {
        question: 'Can I get a refund?',
        answer: 'Yes, we offer a 30-day money-back guarantee. If you\'re not satisfied with a course, you can request a full refund within 30 days of purchase.'
      },
      {
        question: 'Do you offer discounts or promotions?',
        answer: 'We regularly offer promotions and discounts. Sign up for our newsletter or follow us on social media to stay updated on the latest deals.'
      }
    ]
  },
  {
    category: 'Technical Support',
    questions: [
      {
        question: 'I\'m having trouble accessing my course. What should I do?',
        answer: 'First, try refreshing your browser or clearing your cache. If the problem persists, check your internet connection. Contact our support team if you continue to experience issues.'
      },
      {
        question: 'The video won\'t play. How can I fix this?',
        answer: 'Ensure you have a stable internet connection and try using a different browser. Disable browser extensions that might interfere with video playback. Contact support if the issue continues.'
      },
      {
        question: 'How do I reset my password?',
        answer: 'Click "Forgot Password" on the login page, enter your email address, and follow the instructions in the reset email we send you.'
      }
    ]
  }
];

const supportResources = [
  {
    icon: Book,
    title: 'User Guide',
    description: 'Comprehensive guide to using our platform',
    link: '/guide'
  },
  {
    icon: Video,
    title: 'Video Tutorials',
    description: 'Step-by-step video tutorials',
    link: '/tutorials'
  },
  {
    icon: FileText,
    title: 'Documentation',
    description: 'Technical documentation and API reference',
    link: '/docs'
  },
  {
    icon: MessageSquare,
    title: 'Community Forum',
    description: 'Connect with other users and get help',
    link: '/forum'
  }
];

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Getting Started');

  const filteredFAQs = faqData.filter(category =>
    category.questions.some(q =>
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative container mx-auto py-20 md:py-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              How can we
              <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                help you?
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 leading-relaxed mb-8 max-w-3xl mx-auto">
              Find answers to common questions, browse our help resources, or get in touch with our support team.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search for help articles, FAQs, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg bg-white/10 border-white/20 text-white placeholder:text-gray-300 backdrop-blur-sm"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* Support Resources */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Support Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportResources.map((resource, index) => {
              const Icon = resource.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{resource.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{resource.description}</p>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={resource.link}>
                        Learn More
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* FAQ Section */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Frequently Asked Questions</h2>
          
          <Tabs defaultValue="Getting Started" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-8 bg-white/90 backdrop-blur-sm">
              {faqData.map((category) => (
                <TabsTrigger key={category.category} value={category.category} className="text-sm">
                  {category.category}
                </TabsTrigger>
              ))}
            </TabsList>

            {faqData.map((category) => (
              <TabsContent key={category.category} value={category.category}>
                <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <HelpCircle className="h-5 w-5" />
                      <span>{category.category}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {category.questions
                        .filter(q => 
                          searchQuery === '' || 
                          q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          q.answer.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((faq, index) => (
                        <div key={index} className="border-b last:border-b-0 pb-6 last:pb-0">
                          <h3 className="font-semibold text-gray-900 mb-3 text-lg">{faq.question}</h3>
                          <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </section>

        {/* Contact Support CTA */}
        <section className="mt-16 text-center">
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white">
            <CardContent className="p-12">
              <h2 className="text-4xl font-bold mb-6">Still Need Help?</h2>
              <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
                Can't find what you're looking for? Our support team is here to help you 24/7.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold text-lg px-12 py-6 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300" asChild>
                  <Link href="/contact">Contact Support</Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-2 border-white/40 text-white hover:bg-white/20 hover:text-white hover:border-white/60 backdrop-blur-sm font-semibold text-lg px-12 py-6 rounded-2xl transform hover:scale-105 transition-all duration-300"
                  asChild
                >
                  <Link href="/contact">Live Chat</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}