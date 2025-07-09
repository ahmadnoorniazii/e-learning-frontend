"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  User, Mail, Lock, Bell, Shield, Globe, 
  Save, Eye, EyeOff, Trash2 
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState({
    // Account Settings
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    
    // Privacy Settings
    profileVisibility: 'public',
    showEmail: false,
    showProgress: true,
    allowMessages: true,
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: false,
    courseUpdates: true,
    marketingEmails: false,
    weeklyDigest: true,
    
    // Security Settings
    twoFactorAuth: false,
    loginAlerts: true,
    sessionTimeout: 30,
  });

  const handleSave = (section: string) => {
    console.log(`Saving ${section} settings:`, settings);
    // Here you would save to your backend
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      console.log('Deleting account...');
      // Here you would handle account deletion
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
            <p className="text-gray-600">Manage your account preferences and security settings</p>
          </div>

          <Tabs defaultValue="account" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8 bg-white/90 backdrop-blur-sm">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            {/* Account Settings */}
            <TabsContent value="account">
              <div className="space-y-6">
                <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>Personal Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={settings.name}
                          onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={settings.email}
                          onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                        />
                      </div>
                    </div>
                    <Button onClick={() => handleSave('account')} className="bg-gradient-to-r from-blue-600 to-purple-600">
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Lock className="h-5 w-5" />
                      <span>Change Password</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showPassword ? 'text' : 'password'}
                          value={settings.currentPassword}
                          onChange={(e) => setSettings({ ...settings, currentPassword: e.target.value })}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={settings.newPassword}
                          onChange={(e) => setSettings({ ...settings, newPassword: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={settings.confirmPassword}
                          onChange={(e) => setSettings({ ...settings, confirmPassword: e.target.value })}
                        />
                      </div>
                    </div>
                    <Button onClick={() => handleSave('password')} className="bg-gradient-to-r from-blue-600 to-purple-600">
                      <Save className="h-4 w-4 mr-2" />
                      Update Password
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Privacy Settings */}
            <TabsContent value="privacy">
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Privacy Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Profile Visibility</Label>
                      <p className="text-sm text-muted-foreground">
                        Control who can see your profile information
                      </p>
                    </div>
                    <select 
                      className="border rounded-md px-3 py-2"
                      value={settings.profileVisibility}
                      onChange={(e) => setSettings({ ...settings, profileVisibility: e.target.value })}
                    >
                      <option value="public">Public</option>
                      <option value="students">Students Only</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Email Address</Label>
                      <p className="text-sm text-muted-foreground">
                        Display your email on your public profile
                      </p>
                    </div>
                    <Switch
                      checked={settings.showEmail}
                      onCheckedChange={(checked) => setSettings({ ...settings, showEmail: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Learning Progress</Label>
                      <p className="text-sm text-muted-foreground">
                        Display your course progress publicly
                      </p>
                    </div>
                    <Switch
                      checked={settings.showProgress}
                      onCheckedChange={(checked) => setSettings({ ...settings, showProgress: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow Direct Messages</Label>
                      <p className="text-sm text-muted-foreground">
                        Let other users send you messages
                      </p>
                    </div>
                    <Switch
                      checked={settings.allowMessages}
                      onCheckedChange={(checked) => setSettings({ ...settings, allowMessages: checked })}
                    />
                  </div>
                  
                  <Button onClick={() => handleSave('privacy')} className="bg-gradient-to-r from-blue-600 to-purple-600">
                    <Save className="h-4 w-4 mr-2" />
                    Save Privacy Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications">
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="h-5 w-5" />
                    <span>Notification Preferences</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive push notifications in browser
                      </p>
                    </div>
                    <Switch
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => setSettings({ ...settings, pushNotifications: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Course Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about course updates and new content
                      </p>
                    </div>
                    <Switch
                      checked={settings.courseUpdates}
                      onCheckedChange={(checked) => setSettings({ ...settings, courseUpdates: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Marketing Emails</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive promotional emails and special offers
                      </p>
                    </div>
                    <Switch
                      checked={settings.marketingEmails}
                      onCheckedChange={(checked) => setSettings({ ...settings, marketingEmails: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Weekly Digest</Label>
                      <p className="text-sm text-muted-foreground">
                        Get a weekly summary of your learning progress
                      </p>
                    </div>
                    <Switch
                      checked={settings.weeklyDigest}
                      onCheckedChange={(checked) => setSettings({ ...settings, weeklyDigest: checked })}
                    />
                  </div>
                  
                  <Button onClick={() => handleSave('notifications')} className="bg-gradient-to-r from-blue-600 to-purple-600">
                    <Save className="h-4 w-4 mr-2" />
                    Save Notification Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security">
              <div className="space-y-6">
                <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="h-5 w-5" />
                      <span>Security Settings</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <Switch
                        checked={settings.twoFactorAuth}
                        onCheckedChange={(checked) => setSettings({ ...settings, twoFactorAuth: checked })}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Login Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified when someone logs into your account
                        </p>
                      </div>
                      <Switch
                        checked={settings.loginAlerts}
                        onCheckedChange={(checked) => setSettings({ ...settings, loginAlerts: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Session Timeout</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically log out after inactivity (minutes)
                        </p>
                      </div>
                      <Input
                        type="number"
                        className="w-20"
                        value={settings.sessionTimeout}
                        onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                      />
                    </div>
                    
                    <Button onClick={() => handleSave('security')} className="bg-gradient-to-r from-blue-600 to-purple-600">
                      <Save className="h-4 w-4 mr-2" />
                      Save Security Settings
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-red-50 border-red-200">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-red-700">
                      <Trash2 className="h-5 w-5" />
                      <span>Danger Zone</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-red-900 mb-2">Delete Account</h4>
                        <p className="text-sm text-red-700 mb-4">
                          Once you delete your account, there is no going back. Please be certain.
                        </p>
                        <Button 
                          variant="destructive" 
                          onClick={handleDeleteAccount}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}