import { strapiAPI, StrapiUser } from './strapi';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  avatar?: string;
  username?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
}

class AuthService {
  private currentUser: AuthUser | null = null;

  async login(email: string, password: string): Promise<AuthUser> {
    try {
      console.log('🔐 AuthService: Attempting login for:', email);
      const response = await strapiAPI.login(email, password);
      
      const user: AuthUser = {
        id: response.user.id.toString(),
        name: this.getUserDisplayName(response.user),
        email: response.user.email,
        role: this.mapStrapiRoleToAppRole(response.user.role?.name || 'authenticated'),
        avatar: response.user.profile?.avatar?.url,
        username: response.user.username,
      };

      this.currentUser = user;
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth-user', JSON.stringify(user));
      }
      
      console.log('✅ AuthService: Login successful, user role:',response, user.role);
      console.log('🔄 AuthService: User object:', user);
      return user;
    } catch (error) {
      console.error('❌ AuthService: Login error:', error);
      throw new Error('Invalid credentials');
    }
  }

  async register(name: string, email: string, password: string, role: 'student' | 'instructor' = 'student'): Promise<AuthUser> {
    try {
      console.log('📝 AuthService: Attempting registration for:', email, 'as', role);
      
      // Use email as username if name is not provided or is just email
      const username = name && name !== email ? name.replace(/\s+/g, '').toLowerCase() : email.split('@')[0];
      
      const response = await strapiAPI.register(email, password, username);
      
      const user: AuthUser = {
        id: response.user.id.toString(),
        name: name || response.user.username || response.user.email,
        email: response.user.email,
        role: role, // Use the requested role
        username: response.user.username,
      };

      this.currentUser = user;
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth-user', JSON.stringify(user));
      }
      
      console.log('✅ AuthService: Registration successful, user role:', user.role);
      return user;
    } catch (error) {
      console.error('❌ AuthService: Registration error:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('email')) {
          throw new Error('This email is already registered');
        } else if (error.message.includes('username')) {
          throw new Error('This username is already taken');
        } else if (error.message.includes('password')) {
          throw new Error('Password must be at least 6 characters long');
        }
      }
      
      throw new Error('Registration failed. Please try again.');
    }
  }

  logout(): void {
    console.log('🚪 AuthService: Logging out user');
    strapiAPI.logout();
    this.currentUser = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-user');
    }
  }

  getCurrentUser(): AuthUser | null {
    if (this.currentUser) return this.currentUser;
    
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('auth-user');
      if (stored) {
        try {
          this.currentUser = JSON.parse(stored);
          console.log('👤 AuthService: Restored user from storage:', this.currentUser?.role);
        } catch (error) {
          console.error('❌ AuthService: Error parsing stored user:', error);
          localStorage.removeItem('auth-user');
        }
      }
    }
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  private getUserDisplayName(user: StrapiUser): string {
    if (user.profile?.firstName && user.profile?.lastName) {
      return `${user.profile.firstName} ${user.profile.lastName}`;
    }
    return user.username || user.email;
  }

  private mapStrapiRoleToAppRole(strapiRole: string): 'student' | 'instructor' | 'admin' {
    console.log('🔄 AuthService: Mapping Strapi role:', strapiRole);
    
    if (!strapiRole) {
      console.log('🔄 AuthService: No role provided, defaulting to student');
      return 'student';
    }
    
    // Handle different role naming conventions
    const roleName = strapiRole.toLowerCase();
    
    if (roleName.includes('admin')) {
      return 'admin';
    } else if (roleName.includes('instructor') || roleName.includes('teacher')) {
      return 'instructor';
    } else if (roleName.includes('student')) {
      return 'student';
    } else {
      // Default fallback for authenticated users
      console.log('🔄 AuthService: Unknown role, defaulting to student:', strapiRole);
      return 'student';
    }
  }
}

export const authService = new AuthService();