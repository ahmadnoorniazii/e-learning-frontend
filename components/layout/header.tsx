"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, BookOpen, Menu, User, X, LogOut, TestTube, Settings, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Courses', href: '/courses' },
  { name: 'About', href: '/about' },
];

const mockNotifications = [
  { id: '1', title: 'New course available', message: 'Advanced React Development is now live', time: '2 hours ago', unread: true },
  { id: '2', title: 'Assignment due soon', message: 'JavaScript Fundamentals assignment due tomorrow', time: '1 day ago', unread: true },
  { id: '3', title: 'Course completed', message: 'Congratulations on completing Python Basics', time: '3 days ago', unread: false },
  { id: '4', title: 'New message', message: 'Instructor replied to your question', time: '1 week ago', unread: false },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleDashboardClick = () => {
    if (user?.role === 'admin') {
      router.push('/admin');
    } else if (user?.role === 'instructor') {
      router.push('/instructor');
    } else {
      router.push('/dashboard/student');
    }
  };

  const getDashboardLabel = () => {
    if (user?.role === 'admin') return 'Admin Panel';
    if (user?.role === 'instructor') return 'Instructor Dashboard';
    return 'My Dashboard';
  };

  const getDashboardPath = () => {
    if (user?.role === 'admin') return '/admin';
    if (user?.role === 'instructor') return '/instructor';
    return '/dashboard/student';
  };

  const isDashboardActive = () => {
    const dashboardPath = getDashboardPath();
    return pathname.startsWith(dashboardPath) || 
           (pathname === '/dashboard' && user?.role === 'student');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/95 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl text-white">
            EduPlatform
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/instructors"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === '/instructors'
                ? 'text-blue-400'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Instructors
          </Link>
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === item.href
                  ? 'text-blue-400'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              {item.name}
            </Link>
          ))}
          {isAuthenticated && (
            <button
              onClick={handleDashboardClick}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isDashboardActive()
                  ? 'text-blue-400'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              {getDashboardLabel()}
            </button>
          )}
          
          {/* API Test Link - Only for development */}
          {process.env.NODE_ENV === 'development' && (
            <Link
              href="/test-api"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === '/test-api'
                  ? 'text-blue-400'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <TestTube className="h-4 w-4 inline mr-1" />
              API Test
            </Link>
          )}
        </nav>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative hidden md:flex text-gray-300 hover:text-white">
                    <Bell className="h-5 w-5" />
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                      2
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80" align="end" forceMount>
                  <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold">Notifications</h3>
                    <Link href="/notifications" className="text-sm text-primary hover:underline">
                      View all
                    </Link>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {mockNotifications.slice(0, 4).map((notification) => (
                      <div key={notification.id} className={`p-4 border-b hover:bg-muted/50 cursor-pointer ${notification.unread ? 'bg-blue-50/50' : ''}`}>
                        <div className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${notification.unread ? 'bg-blue-500' : 'bg-gray-300'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{notification.title}</p>
                            <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-transparent hover:ring-primary/20 transition-all">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback>
                        {user?.name?.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user?.name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user?.email}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {user?.role}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <UserCircle className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDashboardClick}>
                    {getDashboardLabel()}
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile/settings" className="flex items-center">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  {process.env.NODE_ENV === 'development' && (
                    <DropdownMenuItem asChild>
                      <Link href="/test-api">
                        <TestTube className="h-4 w-4 mr-2" />
                        API Test
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild className="text-gray-300 hover:text-white">
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Link href="/auth/register">Sign Up</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-gray-300 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-gray-900">
          <div className="container mx-auto py-4 space-y-4">
            {/* Mobile Navigation */}
            <nav className="flex flex-col space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors text-left ${
                    pathname === item.href
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              
              {isAuthenticated && (
                <button
                  onClick={() => {
                    handleDashboardClick();
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors text-left ${
                    isDashboardActive()
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {getDashboardLabel()}
                </button>
              )}

              {process.env.NODE_ENV === 'development' && (
                <Link
                  href="/test-api"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors text-left ${
                    pathname === '/test-api'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <TestTube className="h-4 w-4 inline mr-2" />
                  API Test
                </Link>
              )}
              
              {!isAuthenticated && (
                <div className="flex flex-col space-y-2 pt-4 border-t">
                  <Button variant="ghost" asChild className="justify-start text-gray-300 hover:text-white">
                    <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                  <Button asChild className="justify-start bg-gradient-to-r from-blue-600 to-purple-600">
                    <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                      Sign Up
                    </Link>
                  </Button>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}