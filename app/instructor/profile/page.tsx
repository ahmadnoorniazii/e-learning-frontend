"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { User, Camera, Save, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { InstructorProfile } from "@/lib/instructor-service";

export default function InstructorProfilePage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<InstructorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const { toast } = useToast();

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:1337";

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = "/auth/login";
      return;
    }
    if (isAuthenticated && user && user.id) {
      console.log("Fetching profile for user ID:", user.id);
      fetchUserProfileByUserId(user.id);
    }
  }, [isAuthenticated, authLoading, user]);

  // Helper to fetch user-profile by user.id
  const fetchUserProfileByUserId = async (userId: number | string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth-token') || localStorage.getItem('strapi-token');
      const res = await fetch(`${BACKEND_URL}/api/user-profiles?filters[user][id][$eq]=${userId}&populate[0]=user&populate[1]=avatar`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Profile fetch error:", errorText);
        console.error("Response status:", res.status);
        throw new Error(`Failed to fetch user profile: ${res.status} - ${errorText}`);
      }
      const result = await res.json();
      console.log("Profile fetch result:", result);
      const data = result.data && result.data[0];
      if (!data) throw new Error("Profile not found");
      // Construct full avatar URL
      const avatarUrl = data.avatar?.url ? 
        (data.avatar.url.startsWith('http') ? 
          data.avatar.url : 
          `${BACKEND_URL}${data.avatar.url}`) : 
        "";

      setProfile({
        ...data,
        name: data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : data.user?.username || "Instructor",
        email: data.user?.email || "",
        avatar: avatarUrl,
        expertise: Array.isArray(data.expertise) ? data.expertise : (typeof data.expertise === 'string' ? data.expertise.split(',').map((item: string) => item.trim()) : []),
      });
      if (avatarUrl) setAvatarPreview(avatarUrl);
    } catch (error: any) {
      setProfile(null);
      toast({
        title: "Error",
        description: error.message || "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!profile) return;

    try {
      setSaving(true);
      console.log("Starting profile update...");
      const userId = user?.id;
      console.log("User ID from auth hook:", userId);
      if (!userId) {
        toast({
          title: "Error",
          description: "User not authenticated",
          variant: "destructive",
        });
        return;
      }

      // Get authentication token
      const token = localStorage.getItem('auth-token') || localStorage.getItem('strapi-token');
      console.log("Auth token found:", !!token);
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication token not found",
          variant: "destructive",
        });
        return;
      }

      // First, get the user-profile ID by user ID
      const profileResponse = await fetch(`${BACKEND_URL}/api/user-profiles?filters[user][id][$eq]=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!profileResponse.ok) {
        throw new Error("Failed to fetch user profile");
      }
      const profileResult = await profileResponse.json();
      const userProfile = profileResult.data && profileResult.data[0];
      
      if (!userProfile) {
        throw new Error("User profile not found");
      }

      // Prepare the update data
      const updateData = {
        bio: profile.bio || profile.instructorBio || "",
        expertise: (() => {
          if (!profile.expertise) return [];
          if (typeof profile.expertise === 'string') {
            return (profile.expertise as string).split(',').map((item: string) => item.trim());
          }
          return profile.expertise as string[];
        })(),
      };
      console.log("Update data:", updateData);

      // Update the user-profile
      const response = await fetch(`${BACKEND_URL}/api/user-profiles/${userProfile.id}`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: updateData
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        console.error("Response status:", response.status);
        console.error("Response headers:", Object.fromEntries(response.headers.entries()));
        throw new Error(`Failed to update profile: ${response.status} - ${errorText}`);
      }

      // Handle avatar upload separately if needed
      if (avatarFile) {
        const avatarFormData = new FormData();
        avatarFormData.append("files", avatarFile);
        
        const avatarResponse = await fetch(`${BACKEND_URL}/api/upload`, {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: avatarFormData,
        });

        if (avatarResponse.ok) {
          const avatarResult = await avatarResponse.json();
          const avatarId = avatarResult[0]?.id;
          
          if (avatarId) {
            // Update the user-profile with the new avatar
            await fetch(`${BACKEND_URL}/api/user-profiles/${userProfile.id}`, {
              method: "PUT",
              headers: {
                'Authorization': `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                data: {
                  avatar: avatarId
                }
              }),
            });
          }
        }
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      // Refresh profile data
      if (user && user.id) {
        console.log("Refreshing profile data for user ID:", user.id);
        await fetchUserProfileByUserId(user.id);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
          <p className="text-muted-foreground">Unable to load your profile information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground mt-2">
            Update your instructor profile information
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your personal information and profile details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                                      <AvatarImage 
                    src={avatarPreview || (typeof profile?.avatar === 'string' ? profile.avatar : '')} 
                    alt="Instructor Avatar" 
                  />
                    <AvatarFallback>
                      <User className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors"
                  >
                    <Camera className="h-4 w-4" />
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Click the camera icon to upload a new avatar
                </p>
              </div>

              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profile.user?.username || "Instructor"}
                  disabled
                  className="bg-muted"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              {/* Email Field (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={profile.user?.email || ""}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed. Contact support if you need to update your email.
                </p>
              </div>

              {/* Bio Field */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio || profile.instructorBio || ""}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell students about yourself and your teaching experience..."
                  rows={4}
                />
              </div>

              {/* Expertise Field */}
              <div className="space-y-2">
                <Label htmlFor="expertise">Areas of Expertise</Label>
                <Input
                  id="expertise"
                  value={Array.isArray(profile.expertise) ? profile.expertise.join(", ") : (typeof profile.expertise === 'string' ? profile.expertise : "")}
                  onChange={(e) => {
                    const value = e.target.value;
                    const expertiseArray = value.split(',').map((item: string) => item.trim()).filter((item: string) => item.length > 0);
                    setProfile({ 
                      ...profile, 
                      expertise: expertiseArray
                    });
                  }}
                  placeholder="e.g., Web Development, Data Science, Design"
                />
                <p className="text-xs text-muted-foreground">
                  List your main areas of expertise separated by commas
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 