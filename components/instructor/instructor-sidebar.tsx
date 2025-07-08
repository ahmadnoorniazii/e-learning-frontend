"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  BarChart3, 
  MessageSquare,
  Settings,
  Award,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Dashboard', href: '/instructor', icon: LayoutDashboard },
  { name: 'My Courses', href: '/instructor/courses', icon: BookOpen },
  { name: 'Create Course', href: '/instructor/courses/create', icon: Plus },
  { name: 'Students', href: '/instructor/students', icon: Users },
  { name: 'Analytics', href: '/instructor/analytics', icon: BarChart3 },
  { name: 'Reviews', href: '/instructor/reviews', icon: MessageSquare },
  { name: 'Certificates', href: '/instructor/certificates', icon: Award },
  { name: 'Settings', href: '/instructor/settings', icon: Settings },
];

export function InstructorSidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center">
          <Link href="/instructor" className="flex items-center space-x-2 text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg">Instructor</span>
          </Link>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          pathname === item.href
                            ? 'bg-gray-800 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800',
                          'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors'
                        )}
                      >
                        <Icon className="h-6 w-6 shrink-0" />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}