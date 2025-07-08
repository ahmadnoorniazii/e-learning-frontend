"use client";

import { useState } from 'react';
import { Download, Calendar, FileText, TrendingUp, Users, BookOpen, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const reportTypes = [
  {
    id: 'revenue',
    title: 'Revenue Report',
    description: 'Detailed revenue breakdown by courses, categories, and time periods',
    icon: DollarSign,
    lastGenerated: '2024-01-28',
    status: 'ready'
  },
  {
    id: 'enrollment',
    title: 'Enrollment Report',
    description: 'Student enrollment trends and course popularity metrics',
    icon: Users,
    lastGenerated: '2024-01-27',
    status: 'ready'
  },
  {
    id: 'course-performance',
    title: 'Course Performance',
    description: 'Course completion rates, ratings, and engagement analytics',
    icon: BookOpen,
    lastGenerated: '2024-01-26',
    status: 'generating'
  },
  {
    id: 'instructor-analytics',
    title: 'Instructor Analytics',
    description: 'Instructor performance, earnings, and student feedback',
    icon: TrendingUp,
    lastGenerated: '2024-01-25',
    status: 'ready'
  },
  {
    id: 'user-activity',
    title: 'User Activity Report',
    description: 'User engagement, session duration, and platform usage',
    icon: Users,
    lastGenerated: '2024-01-24',
    status: 'ready'
  },
  {
    id: 'financial-summary',
    title: 'Financial Summary',
    description: 'Comprehensive financial overview including taxes and fees',
    icon: FileText,
    lastGenerated: '2024-01-23',
    status: 'ready'
  }
];

const scheduledReports = [
  {
    id: '1',
    name: 'Weekly Revenue Summary',
    type: 'revenue',
    frequency: 'Weekly',
    nextRun: '2024-02-05',
    recipients: ['admin@example.com', 'finance@example.com']
  },
  {
    id: '2',
    name: 'Monthly Enrollment Report',
    type: 'enrollment',
    frequency: 'Monthly',
    nextRun: '2024-02-01',
    recipients: ['admin@example.com', 'marketing@example.com']
  },
  {
    id: '3',
    name: 'Quarterly Performance Review',
    type: 'course-performance',
    frequency: 'Quarterly',
    nextRun: '2024-04-01',
    recipients: ['admin@example.com', 'instructors@example.com']
  }
];

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('last-30-days');
  const [selectedFormat, setSelectedFormat] = useState('pdf');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return <Badge variant="default">Ready</Badge>;
      case 'generating':
        return <Badge variant="secondary">Generating...</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleGenerateReport = (reportId: string) => {
    console.log(`Generating report: ${reportId}`);
    // Here you would call your API to generate the report
  };

  const handleDownloadReport = (reportId: string) => {
    console.log(`Downloading report: ${reportId}`);
    // Here you would call your API to download the report
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground">Generate and download detailed platform reports</p>
      </div>

      {/* Report Generation Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Custom Report</CardTitle>
          <CardDescription>
            Configure and generate custom reports for specific time periods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Time Period</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last-7-days">Last 7 days</SelectItem>
                  <SelectItem value="last-30-days">Last 30 days</SelectItem>
                  <SelectItem value="last-3-months">Last 3 months</SelectItem>
                  <SelectItem value="last-6-months">Last 6 months</SelectItem>
                  <SelectItem value="last-year">Last year</SelectItem>
                  <SelectItem value="custom">Custom range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Format</label>
              <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button>
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Reports */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Available Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            return (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Icon className="h-8 w-8 text-primary" />
                    {getStatusBadge(report.status)}
                  </div>
                  <CardTitle className="text-lg">{report.title}</CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      Last generated: {new Date(report.lastGenerated).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleGenerateReport(report.id)}
                        disabled={report.status === 'generating'}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Generate
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleDownloadReport(report.id)}
                        disabled={report.status !== 'ready'}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Scheduled Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Reports</CardTitle>
          <CardDescription>
            Automatically generated reports sent to specified recipients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scheduledReports.map((report, index) => (
              <div key={report.id}>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">{report.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>Type: {report.type}</span>
                      <span>Frequency: {report.frequency}</span>
                      <span>Next run: {new Date(report.nextRun).toLocaleDateString()}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Recipients: {report.recipients.join(', ')}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <Calendar className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {index < scheduledReports.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}