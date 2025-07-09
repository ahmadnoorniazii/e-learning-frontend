"use client";

import { useState } from 'react';
import { Bell, Check, Trash2, Filter, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const notifications = [
  {
    id: '1',
    title: 'New course available',
    message: 'Advanced React Development is now live and ready for enrollment. Join thousands of students already learning.',
    time: '2 hours ago',
    unread: true,
    type: 'course',
    priority: 'high'
  },
  {
    id: '2',
    title: 'Assignment due soon',
    message: 'JavaScript Fundamentals assignment is due tomorrow at 11:59 PM. Make sure to submit your work on time.',
    time: '1 day ago',
    unread: true,
    type: 'assignment',
    priority: 'urgent'
  },
  {
    id: '3',
    title: 'Course completed',
    message: 'Congratulations on completing Python Basics! Your certificate is now available for download.',
    time: '3 days ago',
    unread: false,
    type: 'achievement',
    priority: 'normal'
  },
  {
    id: '4',
    title: 'New message from instructor',
    message: 'Sarah Johnson replied to your question in the React Development course discussion.',
    time: '1 week ago',
    unread: false,
    type: 'message',
    priority: 'normal'
  },
  {
    id: '5',
    title: 'Payment confirmation',
    message: 'Your payment for "UI/UX Design Masterclass" has been processed successfully.',
    time: '1 week ago',
    unread: false,
    type: 'payment',
    priority: 'normal'
  },
  {
    id: '6',
    title: 'Course reminder',
    message: 'You have 3 unfinished lessons in "Data Science with Python". Continue your learning journey!',
    time: '2 weeks ago',
    unread: false,
    type: 'reminder',
    priority: 'low'
  },
];

export default function NotificationsPage() {
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [filter, setFilter] = useState('all');

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return notification.unread;
    if (filter === 'read') return !notification.unread;
    return true;
  });

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleSelectNotification = (id: string) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(nId => nId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const handleMarkAsRead = (ids: string[]) => {
    // Here you would update the notifications in your backend
    console.log('Marking as read:', ids);
  };

  const handleDelete = (ids: string[]) => {
    // Here you would delete the notifications from your backend
    console.log('Deleting:', ids);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'course': return '📚';
      case 'assignment': return '📝';
      case 'achievement': return '🏆';
      case 'message': return '💬';
      case 'payment': return '💳';
      case 'reminder': return '⏰';
      default: return '🔔';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 border-red-200';
      case 'high': return 'bg-orange-100 border-orange-200';
      case 'normal': return 'bg-blue-100 border-blue-200';
      case 'low': return 'bg-gray-100 border-gray-200';
      default: return 'bg-gray-100 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-600">
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {selectedNotifications.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkAsRead(selectedNotifications)}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Mark as Read
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(selectedNotifications)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setFilter('all')}>
                    All Notifications
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('unread')}>
                    Unread Only
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('read')}>
                    Read Only
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6 bg-white/90 backdrop-blur-sm">
              <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
              <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle>All Notifications</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSelectAll}
                    >
                      {selectedNotifications.length === filteredNotifications.length ? 'Deselect All' : 'Select All'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                          notification.unread ? 'bg-blue-50/50' : ''
                        } ${getPriorityColor(notification.priority)}`}
                        onClick={() => handleSelectNotification(notification.id)}
                      >
                        <div className="flex items-start space-x-4">
                          <input
                            type="checkbox"
                            checked={selectedNotifications.includes(notification.id)}
                            onChange={() => handleSelectNotification(notification.id)}
                            className="mt-1"
                          />
                          
                          <div className="text-2xl">
                            {getNotificationIcon(notification.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h3 className={`font-medium ${notification.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                                    {notification.title}
                                  </h3>
                                  {notification.unread && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                  )}
                                  <Badge variant="outline" className="text-xs">
                                    {notification.priority}
                                  </Badge>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed mb-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500">{notification.time}</p>
                              </div>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleMarkAsRead([notification.id])}>
                                    <Check className="h-4 w-4 mr-2" />
                                    Mark as Read
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDelete([notification.id])}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="unread">
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Unread Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                  {notifications.filter(n => n.unread).length === 0 ? (
                    <div className="text-center py-12">
                      <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                      <p className="text-gray-600">You have no unread notifications.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {notifications.filter(n => n.unread).map((notification) => (
                        <div key={notification.id} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-start space-x-3">
                            <div className="text-xl">{getNotificationIcon(notification.type)}</div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 mb-1">{notification.title}</h4>
                              <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                              <p className="text-xs text-gray-500">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="courses">
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Course Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {notifications.filter(n => ['course', 'assignment', 'achievement'].includes(n.type)).map((notification) => (
                      <div key={notification.id} className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-start space-x-3">
                          <div className="text-xl">{getNotificationIcon(notification.type)}</div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">{notification.title}</h4>
                            <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                            <p className="text-xs text-gray-500">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system">
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>System Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {notifications.filter(n => ['payment', 'message', 'reminder'].includes(n.type)).map((notification) => (
                      <div key={notification.id} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-start space-x-3">
                          <div className="text-xl">{getNotificationIcon(notification.type)}</div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">{notification.title}</h4>
                            <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                            <p className="text-xs text-gray-500">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}