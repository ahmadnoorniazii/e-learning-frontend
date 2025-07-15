"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  BookOpen, 
  BarChart3, 
  MessageSquare,
  Users,
  Award,
  Settings,
  Home,
  Plus
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/instructor', icon: Home },
  { name: 'My Courses', href: '/instructor/courses', icon: BookOpen },
  { name: 'Create Course', href: '/instructor/courses/create', icon: Plus },
  { name: 'Analytics', href: '/instructor/analytics', icon: BarChart3 },
  { name: 'Reviews', href: '/instructor/reviews', icon: MessageSquare },
  { name: 'Students', href: '/instructor/students', icon: Users },
  { name: 'Certificates', href: '/instructor/certificates', icon: Award },
];

export function InstructorSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r">
      <div className="flex h-16 shrink-0 items-center border-b px-6">
        <h1 className="text-lg font-semibold">Instructor Panel</h1>
        </div>
        <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7 px-6 py-4">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          pathname === item.href
                        ? 'bg-gray-50 text-primary'
                        : 'text-gray-700 hover:text-primary hover:bg-gray-50',
                      'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                        )}
                      >
                    <item.icon
                      className={cn(
                        pathname === item.href ? 'text-primary' : 'text-gray-400 group-hover:text-primary',
                        'h-6 w-6 shrink-0'
                      )}
                      aria-hidden="true"
                    />
                        {item.name}
                      </Link>
                    </li>
              ))}
              </ul>
            </li>
          </ul>
        </nav>
    </div>
  );
}