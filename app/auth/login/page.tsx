"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { BookOpen, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionMessage, setSessionMessage] = useState('');
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for session expiration or logout reason
    const reason = searchParams.get('reason');
    if (reason === 'session-expired') {
      setSessionMessage('Your session has expired. Please log in again.');
    } else if (reason === 'unauthorized') {
      setSessionMessage('Access denied. Please log in to continue.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      console.log('🎯 Login successful, user role:', user.role);
      
      // Small delay to ensure state updates are processed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Role-based routing with window.location as fallback
      let redirectUrl = '/dashboard/student'; // default
      
      switch (user.role) {
        case 'admin':
          console.log('🔄 Redirecting to admin dashboard');
          redirectUrl = '/admin';
          break;
        case 'instructor':
          console.log('🔄 Redirecting to instructor dashboard');
          redirectUrl = '/instructor';
          break;
        case 'student':
        default:
          console.log('🔄 Redirecting to student dashboard');
          redirectUrl = '/dashboard/student';
          break;
      }
      
      // Try router.push first, then fallback to window.location
      try {
        router.push(redirectUrl);
        // If router.push doesn't work after a short delay, force redirect
        setTimeout(() => {
          if (window.location.pathname === '/auth/login') {
            console.log('🔄 Router.push failed, using window.location');
            window.location.href = redirectUrl;
          }
        }, 1000);
      } catch (routerError) {
        console.log('🔄 Router.push failed, using window.location immediately');
        window.location.href = redirectUrl;
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
              <BookOpen className="h-6 w-6" />
            </div>
            <span className="font-bold text-2xl">EduPlatform</span>
          </Link>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account to continue learning
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sessionMessage && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{sessionMessage}</AlertDescription>
              </Alert>
            )}
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            <div className="text-center">
              <Link href="/auth/forgot-password" className="text-sm text-muted-foreground hover:text-primary">
                Forgot your password?
              </Link>
            </div>


            <div className="text-center">
              <span className="text-sm text-muted-foreground">
                Don&#39;t have an account?{' '}
                <Link href="/auth/register" className="text-primary hover:underline">
                  Sign up
                </Link>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}