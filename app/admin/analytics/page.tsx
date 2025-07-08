"use client";

import { useState, useEffect } from 'react';
import { TrendingUp, Users, BookOpen, DollarSign, Calendar, Download, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatsCard } from '@/components/ui/stats-card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { strapiAPI } from '@/lib/strapi';

interface AnalyticsData {
  totalRevenue: number;
  totalEnrollments: number;
  activeCourses: number;
  averageRating: number;
  revenueData: Array<{ month: string; revenue: number; enrollments: number }>;
  categoryData: Array<{ name: string; value: number; color: string }>;
  userGrowthData: Array<{ month: string; students: number; instructors: number }>;
  topCoursesData: Array<{ name: string; enrollments: number; revenue: number }>;
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('6months');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch analytics data from Strapi
      const [
        dashboardData,
        revenueData,
        userAnalytics,
        courseAnalytics
      ] = await Promise.all([
        strapiAPI.getAnalytics(),
        strapiAPI.getRevenueAnalytics(timeRange),
        strapiAPI.getUserAnalytics(timeRange),
        strapiAPI.getCourseAnalytics(timeRange)
      ]);

      setAnalyticsData({
        totalRevenue: dashboardData?.totalRevenue || 0,
        totalEnrollments: dashboardData?.totalEnrollments || 0,
        activeCourses: dashboardData?.activeCourses || 0,
        averageRating: dashboardData?.averageRating || 0,
        revenueData: revenueData?.monthlyData || [],
        categoryData: courseAnalytics?.categoryDistribution || [],
        userGrowthData: userAnalytics?.growthData || [],
        topCoursesData: courseAnalytics?.topCourses || []
      });
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data. Please check your Strapi backend connection.');
      
      // Fallback to mock data for development
      setAnalyticsData({
        totalRevenue: 125430,
        totalEnrollments: 2847,
        activeCourses: 156,
        averageRating: 4.8,
        revenueData: [
          { month: 'Jan', revenue: 12000, enrollments: 45 },
          { month: 'Feb', revenue: 15000, enrollments: 52 },
          { month: 'Mar', revenue: 18000, enrollments: 61 },
          { month: 'Apr', revenue: 22000, enrollments: 73 },
          { month: 'May', revenue: 25000, enrollments: 84 },
          { month: 'Jun', revenue: 28000, enrollments: 92 },
        ],
        categoryData: [
          { name: 'Web Development', value: 35, color: '#8884d8' },
          { name: 'Data Science', value: 25, color: '#82ca9d' },
          { name: 'Design', value: 20, color: '#ffc658' },
          { name: 'Marketing', value: 15, color: '#ff7300' },
          { name: 'Business', value: 5, color: '#00ff00' },
        ],
        userGrowthData: [
          { month: 'Jan', students: 1200, instructors: 45 },
          { month: 'Feb', students: 1350, instructors: 48 },
          { month: 'Mar', students: 1520, instructors: 52 },
          { month: 'Apr', students: 1780, instructors: 58 },
          { month: 'May', students: 2100, instructors: 65 },
          { month: 'Jun', students: 2450, instructors: 72 },
        ],
        topCoursesData: [
          { name: 'React Development', enrollments: 234, revenue: 23400 },
          { name: 'Python for Data Science', enrollments: 189, revenue: 18900 },
          { name: 'UI/UX Design', enrollments: 156, revenue: 15600 },
          { name: 'Digital Marketing', enrollments: 134, revenue: 13400 },
          { name: 'Machine Learning', enrollments: 98, revenue: 9800 },
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const analyticsStats = analyticsData ? [
    {
      title: 'Total Revenue',
      value: `$${analyticsData.totalRevenue.toLocaleString()}`,
      description: '+23% from last month',
      icon: DollarSign,
      trend: { value: 23, isPositive: true }
    },
    {
      title: 'Total Enrollments',
      value: analyticsData.totalEnrollments.toLocaleString(),
      description: '+12% from last month',
      icon: Users,
      trend: { value: 12, isPositive: true }
    },
    {
      title: 'Active Courses',
      value: analyticsData.activeCourses.toString(),
      description: '+8 new this month',
      icon: BookOpen,
      trend: { value: 8, isPositive: true }
    },
    {
      title: 'Avg. Course Rating',
      value: analyticsData.averageRating.toFixed(1),
      description: '+0.2 from last month',
      icon: TrendingUp,
      trend: { value: 4, isPositive: true }
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
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track platform performance and insights</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="3months">Last 3 months</SelectItem>
              <SelectItem value="6months">Last 6 months</SelectItem>
              <SelectItem value="1year">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {analyticsStats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {analyticsData && (
        <>
          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue & Enrollments</CardTitle>
                <CardDescription>Monthly revenue and enrollment trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="right" dataKey="enrollments" fill="#8884d8" name="Enrollments" />
                    <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#82ca9d" name="Revenue ($)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Course Categories</CardTitle>
                <CardDescription>Distribution of courses by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analyticsData.categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* User Growth */}
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>Students and instructors growth over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData.userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="students" stackId="1" stroke="#8884d8" fill="#8884d8" />
                    <Area type="monotone" dataKey="instructors" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Courses */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Courses</CardTitle>
                <CardDescription>Courses with highest enrollments</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.topCoursesData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="enrollments" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { action: 'New user registration', user: 'john@example.com', time: '2 minutes ago' },
                    { action: 'Course enrollment', user: 'sarah@example.com', time: '5 minutes ago' },
                    { action: 'Course completion', user: 'mike@example.com', time: '10 minutes ago' },
                    { action: 'New course published', user: 'instructor@example.com', time: '15 minutes ago' },
                    { action: 'Payment received', user: 'alice@example.com', time: '20 minutes ago' },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div>
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm text-muted-foreground">{activity.user}</p>
                      </div>
                      <span className="text-sm text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { metric: 'Course Completion Rate', value: '87%', change: '+5%' },
                    { metric: 'Average Session Duration', value: '45 min', change: '+12%' },
                    { metric: 'Student Satisfaction', value: '4.8/5', change: '+0.2' },
                    { metric: 'Instructor Response Time', value: '2.3 hours', change: '-15%' },
                    { metric: 'Platform Uptime', value: '99.9%', change: '0%' },
                  ].map((metric, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <span className="font-medium">{metric.metric}</span>
                      <div className="text-right">
                        <div className="font-medium">{metric.value}</div>
                        <div className={`text-sm ${metric.change.startsWith('+') ? 'text-green-600' : metric.change.startsWith('-') ? 'text-red-600' : 'text-muted-foreground'}`}>
                          {metric.change}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}