"use client";

import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Link from 'next/link';

const faqData = [
  {
    category: 'Getting Started',
    questions: [
      {
        question: 'How do I create an account?',
        answer: 'To create an account, click the "Sign Up" button in the top right corner of our homepage. Choose between a Student or Instructor account type, fill in your personal information, and verify your email address. Once verified, you can start exploring courses or creating content.'
      },
      {
        question: 'What\'s the difference between Student and Instructor accounts?',
        answer: 'Student accounts are designed for learners who want to enroll in courses, track their progress, earn certificates, and interact with instructors. Instructor accounts allow you to create and manage courses, upload content, interact with students, view detailed analytics, and earn revenue from course sales.'
      },
      {
        question: 'Is there a mobile app available?',
        answer: 'Currently, our platform is optimized for web browsers on both desktop and mobile devices. We\'re working on dedicated mobile apps for iOS and Android, which will be available soon. You can access all features through your mobile browser in the meantime.'
      },
      {
        question: 'How do I reset my password?',
        answer: 'If you\'ve forgotten your password, click "Forgot Password" on the login page. Enter your email address, and we\'ll send you a password reset link. Follow the instructions in the email to create a new password. Make sure to check your spam folder if you don\'t see the email.'
      }
    ]
  },
  {
    category: 'Courses & Learning',
    questions: [
      {
        question: 'How do I enroll in a course?',
        answer: 'Browse our course catalog by visiting the Courses page. Click on any course that interests you to view its details, curriculum, and instructor information. If you decide to enroll, click the "Enroll Now" button and complete the payment process. You\'ll have immediate access to the course content.'
      },
      {
        question: 'Can I access courses offline?',
        answer: 'Our courses require an internet connection to stream video content and access interactive features. However, you can download course materials, PDFs, and resources for offline reference. We\'re working on offline video downloads for premium subscribers.'
      },
      {
        question: 'How long do I have access to a course?',
        answer: 'Once you enroll in a course, you have lifetime access to all course materials. You can learn at your own pace, revisit lessons anytime, and access any future updates the instructor makes to the course content.'
      },
      {
        question: 'Do I get a certificate after completing a course?',
        answer: 'Yes! Upon successful completion of a course (completing all lessons and any required assignments), you\'ll receive a digital certificate of completion. You can download it as a PDF and share it on professional networks like LinkedIn.'
      },
      {
        question: 'Can I get a refund if I\'m not satisfied?',
        answer: 'We offer a 30-day money-back guarantee on all courses. If you\'re not satisfied with a course for any reason, you can request a full refund within 30 days of purchase. Refunds are processed within 5-7 business days.'
      }
    ]
  },
  {
    category: 'Payment & Billing',
    questions: [
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards (Visa, MasterCard, American Express, Discover), PayPal, Apple Pay, Google Pay, and various local payment methods depending on your region. All payments are processed securely through our encrypted payment system.'
      },
      {
        question: 'Are there any subscription fees?',
        answer: 'No, we don\'t have subscription fees. You pay once for each course and have lifetime access. However, we do offer a premium membership that provides additional benefits like priority support, exclusive content, and discounts on future purchases.'
      },
      {
        question: 'Do you offer discounts or promotions?',
        answer: 'Yes! We regularly offer promotions, seasonal sales, and bulk discounts. Students get special pricing, and we offer discounts for purchasing multiple courses. Sign up for our newsletter or follow us on social media to stay updated on the latest deals.'
      },
      {
        question: 'Can I purchase courses for someone else?',
        answer: 'Absolutely! You can purchase courses as gifts for friends, family, or colleagues. During checkout, select "This is a gift" and provide the recipient\'s email address. They\'ll receive instructions on how to access their gifted course.'
      }
    ]
  },
  {
    category: 'Technical Support',
    questions: [
      {
        question: 'I\'m having trouble accessing my course. What should I do?',
        answer: 'First, try refreshing your browser and clearing your cache. Ensure you\'re logged into the correct account. Check your internet connection and try using a different browser. If the problem persists, contact our support team with details about the issue.'
      },
      {
        question: 'The video won\'t play. How can I fix this?',
        answer: 'Video playback issues can usually be resolved by: 1) Checking your internet connection, 2) Trying a different browser, 3) Disabling browser extensions, 4) Clearing your browser cache, 5) Ensuring JavaScript is enabled. If none of these work, contact our technical support team.'
      },
      {
        question: 'Why is the video quality poor?',
        answer: 'Video quality automatically adjusts based on your internet connection speed. For better quality, ensure you have a stable, high-speed internet connection. You can also manually adjust video quality using the settings gear icon in the video player.'
      },
      {
        question: 'I\'m experiencing slow loading times. What can I do?',
        answer: 'Slow loading can be caused by internet connection issues, browser problems, or high server traffic. Try refreshing the page, clearing your browser cache, using a different browser, or checking your internet speed. Contact support if the issue continues.'
      }
    ]
  },
  {
    category: 'Account Management',
    questions: [
      {
        question: 'How do I update my profile information?',
        answer: 'Go to your profile page by clicking on your avatar in the top right corner and selecting "Profile". Click the "Edit Profile" button to update your personal information, bio, profile picture, and social links. Don\'t forget to save your changes.'
      },
      {
        question: 'Can I change my email address?',
        answer: 'Yes, you can change your email address in your account settings. Go to Profile > Settings > Account tab, enter your new email address, and verify it through the confirmation email we send. Your old email will no longer be associated with your account.'
      },
      {
        question: 'How do I delete my account?',
        answer: 'To delete your account, go to Profile > Settings > Security tab and scroll down to the "Danger Zone" section. Click "Delete Account" and follow the confirmation steps. Please note that this action is irreversible and will permanently delete all your data.'
      },
      {
        question: 'Can I have multiple accounts?',
        answer: 'Each person should have only one account on our platform. However, you can switch between Student and Instructor roles within the same account if you want to both learn and teach. Contact support if you need help merging multiple accounts.'
      }
    ]
  }
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const filteredFAQs = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(q =>
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative container mx-auto py-20 md:py-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Frequently Asked
              <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Questions
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 leading-relaxed mb-8 max-w-3xl mx-auto">
              Find quick answers to common questions about our platform, courses, and services.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg bg-white/10 border-white/20 text-white placeholder:text-gray-300 backdrop-blur-sm"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {filteredFAQs.map((category, categoryIndex) => (
            <div key={category.category} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <HelpCircle className="h-6 w-6 mr-3 text-blue-600" />
                {category.category}
              </h2>
              
              <div className="space-y-4">
                {category.questions.map((faq, questionIndex) => {
                  const itemId = `${categoryIndex}-${questionIndex}`;
                  const isOpen = openItems.includes(itemId);
                  
                  return (
                    <Card key={questionIndex} className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <CardHeader 
                            className="cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => toggleItem(itemId)}
                          >
                            <CardTitle className="flex items-center justify-between text-left">
                              <span className="text-lg font-semibold text-gray-900">
                                {faq.question}
                              </span>
                              {isOpen ? (
                                <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                              )}
                            </CardTitle>
                          </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <CardContent className="pt-0">
                            <p className="text-gray-600 leading-relaxed">
                              {faq.answer}
                            </p>
                          </CardContent>
                        </CollapsibleContent>
                      </Collapsible>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}

          {filteredFAQs.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <HelpCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600 mb-6">
                We couldn't find any FAQs matching "{searchQuery}". Try different keywords or browse all categories.
              </p>
              <Button onClick={() => setSearchQuery('')} variant="outline">
                Clear Search
              </Button>
            </div>
          )}

          {/* Contact Support CTA */}
          <div className="mt-16 text-center">
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white">
              <CardContent className="p-12">
                <h2 className="text-3xl font-bold mb-4">Still have questions?</h2>
                <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
                  Can't find the answer you're looking for? Our support team is ready to help.
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
                    <Link href="/support">Browse Help Center</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}