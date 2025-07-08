"use client";

import { useState, useEffect } from 'react';
import { Users, BookOpen, DollarSign, TrendingUp, Eye, UserPlus, ShoppingCart, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/ui/stats-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { strapiAPI } from '@/lib/strapi';

interface DashboardData {
  totalUsers: number;
  activeCourses: number;
  totalRevenue: number;
  totalEnrollments: number;
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    joinedAt: string;
    avatar?: string;
  }>;
  recentCourses: Array<{
    id: string;
    title: string;
    instructor: string;
    students: number;
    revenue: string;
    status: string;
  }>;
}

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [analyticsData, usersData, coursesData] = await Promise.all([
        strapiAPI.getAnalytics(),
        strapiAPI.getUsers({ page: 1, pageSize: 5 }),
        strapiAPI.getCourses({ page: 1, pageSize: 5 })
      ]);

      const recentUsers = usersData.data?.map(user => ({
        id: user.id.toString(),
        name: user.username || user.email,
        email: user.email,
        role: user.role?.name || 'student',
        joinedAt: user.createdAt,
        avatar: user.profile?.avatar?.url
      })) || [];

      const recentCourses = coursesData.data?.map(course => ({
        id: course.id.toString(),
        title: course.attributes.title,
        instructor: course.attributes.instructor?.data?.attributes.username || 'Unknown',
        students: 0, // This would come from enrollments
        revenue: `$${course.attributes.price}`,
        status: course.attributes.status
      })) || [];

      setDashboardData({
        totalUsers: analyticsData?.totalUsers || usersData.meta?.pagination?.total || 0,
        activeCourses: analyticsData?.activeCourses || coursesData.meta?.pagination?.total || 0,
        totalRevenue: analyticsData?.totalRevenue || 0,
        totalEnrollments: analyticsData?.totalEnrollments || 0,
        recentUsers,
        recentCourses
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please check your Strapi backend connection.');
      
      // Fallback to mock data for development
      setDashboardData({
        totalUsers: 2847,
        activeCourses: 156,
        totalRevenue: 45231,
        totalEnrollments: 1234,
        recentUsers: [
          {
            id: '1',
            name: 'Alice Johnson',
            email: 'alice@example.com',
            role: 'student',
            joinedAt: '2024-01-28',
            avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150'
          },
          {
            id: '2',
            name: 'Bob Smith',
            email: 'bob@example.com',
            role: 'instructor',
            joinedAt: '2024-01-27',
            avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'
          },
          {
            id: '3',
            name: 'Carol Davis',
            email: 'carol@example.com',
            role: 'student',
            joinedAt: '2024-01-26',
            avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150'
          }
        ],
        recentCourses: [
          {
            id: '1',
            title: 'Advanced React Patterns',
            instructor: 'Sarah Johnson',
            students: 45,
            revenue: '$2,250',
            status: 'published'
          },
          {
            id: '2',
            title: 'Machine Learning Basics',
            instructor: 'Dr. Mike Chen',
            students: 78,
            revenue: '$3,900',
            status: 'published'
          },
          {
            id: '3',
            title: 'Digital Marketing 2024',
            instructor: 'Emma Wilson',
            students: 23,
            revenue: '$1,150',
            status: 'draft'
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const adminStats = dashboardData ? [
    {
      title: 'Total Users',
      value: dashboardData.totalUsers.toLocaleString(),
      description: '+12% from last month',
      icon: Users,
      trend: { value: 12, isPositive: true }
    },
    {
      title: 'Active Courses',
      value: dashboardData.activeCourses.toString(),
      description: '+8 new this month',
      icon: BookOpen,
      trend: { value: 8, isPositive: true }
    },
    {
      title: 'Revenue',
      value: `$${dashboardData.totalRevenue.toLocaleString()}`,
      description: '+23% from last month',
      icon: DollarSign,
      trend: { value: 23, isPositive: true }
    },
    {
      title: 'Enrollments',
      value: dashboardData.totalEnrollments.toLocaleString(),
      description: '+15% from last month',
      icon: TrendingUp,
      trend: { value: 15, isPositive: true }
    }
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your platform's performance and activity
          </p>
        </div>
        <Button variant="outline" onClick={fetchDashboardData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminStats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {dashboardData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>Latest user registrations</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                View All
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData.recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={user.role === 'instructor' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(user.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Courses */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Courses</CardTitle>
                <CardDescription>Latest course submissions</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View All
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData.recentCourses.map((course) => (
                <div key={course.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{course.title}</p>
                    <p className="text-sm text-muted-foreground">by {course.instructor}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                        {course.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {course.students} students • {course.revenue}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-20 flex-col space-y-2">
              <Users className="h-6 w-6" />
              <span>Manage Users</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <BookOpen className="h-6 w-6" />
              <span>Review Courses</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <ShoppingCart className="h-6 w-6" />
              <span>View Orders</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}