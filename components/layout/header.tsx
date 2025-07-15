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
  { name: 'Instructors', href: '/instructors' },
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
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-gradient-to-r from-gray-900/95 via-slate-900/95 to-gray-900/95 backdrop-blur-xl supports-[backdrop-filter]:bg-gradient-to-r supports-[backdrop-filter]:from-gray-900/90 supports-[backdrop-filter]:via-slate-900/90 supports-[backdrop-filter]:to-gray-900/90 px-4 sm:px-6 lg:px-8 shadow-lg">
      <div className="container mx-auto flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent group-hover:from-cyan-200 group-hover:via-blue-200 group-hover:to-purple-200 transition-all duration-300">
            EduPlatform
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">

          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-sm font-semibold transition-all duration-300 relative group ${
                pathname === item.href
                  ? 'text-cyan-400'
                  : 'text-gray-300 hover:text-cyan-300'
              }`}
            >
              {item.name}
              <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 group-hover:w-full ${pathname === item.href ? 'w-full' : ''}`}></span>
            </Link>
          ))}
          {isAuthenticated && (
            <button
              onClick={handleDashboardClick}
              className={`text-sm font-semibold transition-all duration-300 relative group ${
                isDashboardActive()
                  ? 'text-cyan-400'
                  : 'text-gray-300 hover:text-cyan-300'
              }`}
            >
              {getDashboardLabel()}
              <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 group-hover:w-full ${isDashboardActive() ? 'w-full' : ''}`}></span>
            </button>
          )}
          
          {/* API Test Link - Only for development */}
          {process.env.NODE_ENV === 'development' && (
            <Link
              href="/test-api"
              className={`text-sm font-semibold transition-all duration-300 relative group ${
                pathname === '/test-api'
                  ? 'text-cyan-400'
                  : 'text-gray-300 hover:text-cyan-300'
              }`}
            >
              <TestTube className="h-4 w-4 inline mr-1" />
              API Test
              <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 group-hover:w-full ${pathname === '/test-api' ? 'w-full' : ''}`}></span>
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
                  <Button variant="ghost" size="icon" className="relative hidden md:flex text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300">
                    <Bell className="h-5 w-5" />
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs shadow-lg">
                      2
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80 bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-xl" align="end" forceMount>
                  <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-t-xl">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    <Link href="/notifications" className="text-sm text-cyan-600 hover:text-cyan-700 hover:underline font-medium">
                      View all
                    </Link>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {mockNotifications.slice(0, 4).map((notification) => (
                      <div key={notification.id} className={`p-4 border-b border-gray-100 hover:bg-cyan-50/50 cursor-pointer transition-all duration-200 ${notification.unread ? 'bg-blue-50/70' : ''}`}>
                        <div className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${notification.unread ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'bg-gray-300'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-gray-900">{notification.title}</p>
                            <p className="text-sm text-gray-600 line-clamp-2">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
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
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-transparent hover:ring-cyan-400/30 transition-all duration-300 hover:scale-105">
                    <Avatar className="h-10 w-10 ring-2 ring-white/20 hover:ring-cyan-400/50 transition-all duration-300">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-semibold">
                        {user?.name?.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-60 bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-xl" align="end" forceMount>
                  <div className="flex items-center justify-start gap-3 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-t-xl">
                    <Avatar className="h-12 w-12 ring-2 ring-cyan-200">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-semibold">
                        {user?.name?.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-semibold text-gray-900">{user?.name}</p>
                      <p className="w-[180px] truncate text-sm text-gray-600">
                        {user?.email}
                      </p>
                      <Badge variant="secondary" className="text-xs w-fit bg-cyan-100 text-cyan-700 hover:bg-cyan-200 capitalize">
                        {user?.role}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-gray-200" />
                  <DropdownMenuItem asChild className="hover:bg-cyan-50 focus:bg-cyan-50">
                    <Link href="/profile" className="flex items-center p-3 cursor-pointer">
                      <UserCircle className="h-5 w-5 mr-3 text-cyan-600" />
                      <span className="font-medium">Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDashboardClick} className="hover:bg-cyan-50 focus:bg-cyan-50 p-3 cursor-pointer">
                    <span className="font-medium">{getDashboardLabel()}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="hover:bg-cyan-50 focus:bg-cyan-50">
                    <Link href="/profile/settings" className="flex items-center p-3 cursor-pointer">
                      <Settings className="h-5 w-5 mr-3 text-cyan-600" />
                      <span className="font-medium">Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  {process.env.NODE_ENV === 'development' && (
                    <DropdownMenuItem asChild className="hover:bg-cyan-50 focus:bg-cyan-50">
                      <Link href="/test-api" className="flex items-center p-3 cursor-pointer">
                        <TestTube className="h-5 w-5 mr-3 text-cyan-600" />
                        <span className="font-medium">API Test</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-gray-200" />
                  <DropdownMenuItem onClick={handleLogout} className="hover:bg-red-50 focus:bg-red-50 p-3 cursor-pointer text-red-600">
                    <LogOut className="h-5 w-5 mr-3" />
                    <span className="font-medium">Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center space-x-3">
              <Button variant="ghost" asChild className="text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 font-semibold">
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-600 hover:via-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-xl font-semibold">
                <Link href="/auth/register">Sign Up</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300"
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
        <div className="md:hidden border-t border-white/10 bg-gradient-to-r from-gray-900/98 via-slate-900/98 to-gray-900/98 backdrop-blur-xl">
          <div className="container mx-auto py-6 space-y-6">
            {/* Mobile Navigation */}
            <nav className="flex flex-col space-y-2">
              <Link
                href="/instructors"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 text-left ${
                  pathname === '/instructors'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                Instructors
              </Link>
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 text-left ${
                    pathname === item.href
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
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
                  className={`px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 text-left ${
                    isDashboardActive()
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {getDashboardLabel()}
                </button>
              )}

              {process.env.NODE_ENV === 'development' && (
                <Link
                  href="/test-api"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 text-left ${
                    pathname === '/test-api'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <TestTube className="h-4 w-4 inline mr-2" />
                  API Test
                </Link>
              )}
              
              {!isAuthenticated && (
                <div className="flex flex-col space-y-3 pt-6 border-t border-white/10">
                  <Button variant="ghost" asChild className="justify-start text-gray-300 hover:text-white hover:bg-white/10 rounded-xl font-semibold">
                    <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                  <Button asChild className="justify-start bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-600 hover:via-blue-700 hover:to-purple-700 shadow-lg rounded-xl font-semibold">
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