/**
 * User Profile Service
 * Handles user profile-related API calls using the API client
 */

import { apiClient, UserProfile } from './api-client';

export interface CreateUserProfileData {
  firstName?: string;
  lastName?: string;
  bio?: string;
  dateOfBirth?: string;
  phone?: string;
  address?: string;
  isInstructor?: boolean;
  instructorBio?: string;
  expertise?: string[] | any;
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  learningGoals?: string;
  interests?: string[] | any;
  socialLinks?: {
    website?: string;
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  user?: number; // User ID relation
}

export interface UpdateUserProfileData extends Partial<CreateUserProfileData> {
  // All fields are optional for updates
}

export interface UserProfileFilters {
  isInstructor?: boolean;
  experienceLevel?: string;
  user?: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  start?: number;
  limit?: number;
}

class UserProfileService {
  
  /**
   * Get all user profiles (find)
   * GET /api/user-profiles
   */
  async getUserProfiles(params: {
    filters?: UserProfileFilters;
    populate?: string;
    sort?: string;
    pagination?: PaginationParams;
  } = {}): Promise<{ data: UserProfile[]; meta?: any }> {
    try {
      const searchParams = new URLSearchParams();
      
      // Add pagination
      if (params.pagination?.page) {
        searchParams.append('pagination[page]', params.pagination.page.toString());
      }
      if (params.pagination?.pageSize) {
        searchParams.append('pagination[pageSize]', params.pagination.pageSize.toString());
      }
      if (params.pagination?.start) {
        searchParams.append('pagination[start]', params.pagination.start.toString());
      }
      if (params.pagination?.limit) {
        searchParams.append('pagination[limit]', params.pagination.limit.toString());
      }
      
      // Add filters
      if (params.filters) {
        Object.entries(params.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(`filters[${key}][$eq]`, value.toString());
          }
        });
      }
      
      // Add population
      const populate = params.populate || 'avatar,user';
      searchParams.append('populate', populate);
      
      // Add sorting
      if (params.sort) {
        searchParams.append('sort', params.sort);
      }
      
      const response = await apiClient.getUserProfiles({
        page: params.pagination?.page,
        pageSize: params.pagination?.pageSize,
        populate: populate,
        filters: params.filters,
        sort: params.sort,
      });
      
      return response;
    } catch (error) {
      console.error('❌ UserProfileService: Error fetching user profiles:', error);
      throw new Error('Failed to fetch user profiles');
    }
  }

  /**
   * Get specific user profile (findOne)
   * GET /api/user-profiles/:id
   */
  async getUserProfile(id: string, populate: string = 'avatar,user'): Promise<UserProfile> {
    try {
      const response = await apiClient.getUserProfile(id, populate);
      return response.data;
    } catch (error) {
      console.error('❌ UserProfileService: Error fetching user profile:', error);
      throw new Error('Failed to fetch user profile');
    }
  }

  /**
   * Get current user's profile
   */
  async getMyProfile(): Promise<UserProfile | null> {
    try {
      // First get current user
      const currentUser = await apiClient.getCurrentUser();
      
      // Then get their profile
      const profiles = await this.getUserProfiles({
        filters: { user: currentUser.id },
        populate: 'avatar,user',
      });
      
      return profiles.data.length > 0 ? profiles.data[0] : null;
    } catch (error) {
      console.error('❌ UserProfileService: Error fetching my profile:', error);
      return null;
    }
  }

  /**
   * Create new user profile (create)
   * POST /api/user-profiles
   */
  async createUserProfile(profileData: CreateUserProfileData): Promise<UserProfile> {
    try {
      const response = await apiClient.createUserProfile(profileData);
      return response.data;
    } catch (error) {
      console.error('❌ UserProfileService: Error creating user profile:', error);
      throw new Error('Failed to create user profile');
    }
  }

  /**
   * Update user profile (update)
   * PUT /api/user-profiles/:id
   */
  async updateUserProfile(id: string, profileData: UpdateUserProfileData): Promise<UserProfile> {
    try {
      const response = await apiClient.updateUserProfile(id, profileData);
      return response.data;
    } catch (error) {
      console.error('❌ UserProfileService: Error updating user profile:', error);
      throw new Error('Failed to update user profile');
    }
  }

  /**
   * Update my profile
   */
  async updateMyProfile(profileData: UpdateUserProfileData): Promise<UserProfile> {
    try {
      const myProfile = await this.getMyProfile();
      
      if (!myProfile) {
        // Create profile if it doesn't exist
        const currentUser = await apiClient.getCurrentUser();
        return await this.createUserProfile({
          ...profileData,
          user: currentUser.id,
        });
      }
      
      return await this.updateUserProfile(myProfile.id.toString(), profileData);
    } catch (error) {
      console.error('❌ UserProfileService: Error updating my profile:', error);
      throw new Error('Failed to update profile');
    }
  }

  /**
   * Delete user profile (delete)
   * DELETE /api/user-profiles/:id
   */
  async deleteUserProfile(id: string): Promise<void> {
    try {
      await apiClient.deleteUserProfile(id);
    } catch (error) {
      console.error('❌ UserProfileService: Error deleting user profile:', error);
      throw new Error('Failed to delete user profile');
    }
  }

  /**
   * Get instructor profiles
   */
  async getInstructorProfiles(params: {
    pagination?: PaginationParams;
    sort?: string;
  } = {}): Promise<{ data: UserProfile[]; meta?: any }> {
    return await this.getUserProfiles({
      filters: { isInstructor: true },
      populate: 'avatar,user',
      sort: params.sort || 'createdAt:desc',
      pagination: params.pagination,
    });
  }

  /**
   * Search profiles by name or bio
   */
  async searchProfiles(query: string, params: {
    pagination?: PaginationParams;
    onlyInstructors?: boolean;
  } = {}): Promise<{ data: UserProfile[]; meta?: any }> {
    try {
      // For now, get all profiles and filter client-side
      // In a real implementation, you'd want server-side search
      const filters: any = {};
      
      if (params.onlyInstructors) {
        filters.isInstructor = true;
      }
      
      const response = await apiClient.getUserProfiles({
        page: params.pagination?.page,
        pageSize: params.pagination?.pageSize,
        populate: 'avatar,user',
        filters,
      });
      
      // Client-side filtering for search
      const filteredData = response.data.filter(profile => {
        const searchText = query.toLowerCase();
        return (
          profile.firstName?.toLowerCase().includes(searchText) ||
          profile.lastName?.toLowerCase().includes(searchText) ||
          profile.bio?.toLowerCase().includes(searchText)
        );
      });
      
      return {
        data: filteredData,
        meta: response.meta,
      };
    } catch (error) {
      console.error('❌ UserProfileService: Error searching profiles:', error);
      return { data: [] };
    }
  }

  /**
   * Upload avatar for profile
   */
  async uploadAvatar(profileId: string, file: File): Promise<UserProfile> {
    try {
      // First upload the file
      const formData = new FormData();
      formData.append('files', file);
      formData.append('ref', 'api::user-profile.user-profile');
      formData.append('refId', profileId);
      formData.append('field', 'avatar');
      
      await apiClient.uploadFile(formData);
      
      // Then get the updated profile
      return await this.getUserProfile(profileId);
    } catch (error) {
      console.error('❌ UserProfileService: Error uploading avatar:', error);
      throw new Error('Failed to upload avatar');
    }
  }

  /**
   * Utility methods
   */
  
  getFullName(profile: UserProfile): string {
    if (profile.firstName && profile.lastName) {
      return `${profile.firstName} ${profile.lastName}`;
    } else if (profile.firstName) {
      return profile.firstName;
    } else if (profile.lastName) {
      return profile.lastName;
    }
    return 'Unknown User';
  }

  getDisplayName(profile: UserProfile): string {
    return this.getFullName(profile);
  }

  getAvatarUrl(profile: UserProfile): string | null {
    return profile.avatar?.url || null;
  }

  getExperienceBadgeColor(level?: string): string {
    switch (level) {
      case 'beginner':
        return 'green';
      case 'intermediate':
        return 'blue';
      case 'advanced':
        return 'purple';
      case 'expert':
        return 'gold';
      default:
        return 'gray';
    }
  }

  formatSocialLinks(socialLinks?: any): {
    website?: string;
    linkedin?: string;
    twitter?: string;
    github?: string;
  } {
    if (!socialLinks || typeof socialLinks !== 'object') {
      return {};
    }
    
    return {
      website: socialLinks.website,
      linkedin: socialLinks.linkedin,
      twitter: socialLinks.twitter,
      github: socialLinks.github,
    };
  }

  isProfileComplete(profile: UserProfile): boolean {
    const requiredFields = ['firstName', 'lastName'];
    return requiredFields.every(field => profile[field as keyof UserProfile]);
  }

  getProfileCompletionPercentage(profile: UserProfile): number {
    const fields = [
      'firstName',
      'lastName', 
      'bio',
      'avatar',
      'phone',
      'dateOfBirth',
    ];
    
    const completedFields = fields.filter(field => {
      const value = profile[field as keyof UserProfile];
      return value !== null && value !== undefined && value !== '';
    });
    
    return Math.round((completedFields.length / fields.length) * 100);
  }
}

export const userProfileService = new UserProfileService();
export default userProfileService;
