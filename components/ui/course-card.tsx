import Image from 'next/image';
import Link from 'next/link';
import { Star, Clock, Users, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Course } from '@/lib/types';

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0 ? `${hours}h ${remainingMinutes}m` : `${minutes}m`;
  };

  return (
    <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 group bg-white overflow-hidden h-full flex flex-col">
      <Link href={`/courses/${course.id}`}>
        <div className="relative overflow-hidden">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-3 right-3">
            <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-lg">
              {course.category}
            </Badge>
          </div>
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-white/90 text-gray-800 border-0">
              {course.level}
            </Badge>
          </div>
        </div>
      </Link>
      
      <CardContent className="p-6 space-y-4 flex-1 flex flex-col">
        <div>
          <Link href={`/courses/${course.id}`}>
            <h3 className="font-bold text-xl line-clamp-2 group-hover:text-blue-600 transition-colors duration-300 mb-2">
              {course.title}
            </h3>
          </Link>
          <p className="text-gray-600 line-clamp-2 leading-relaxed">
            {course.description}
          </p>
        </div>

        <div className="flex items-center space-x-3 py-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={course.instructor.avatar} alt={course.instructor.name} />
            <AvatarFallback className="text-xs">
              {course.instructor.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-gray-700">{course.instructor.name}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-3 text-gray-600">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{course.rating}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{course.studentsCount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{formatDuration(course.duration)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <BookOpen className="h-4 w-4" />
              <span>{course.lessonsCount}</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            ${course.price}
          </div>
        </div>
        
        <Button asChild className="w-full mt-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 mt-auto">
          <Link href={`/courses/${course.id}`}>
            View Course
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}