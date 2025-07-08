import { strapiAPI } from './strapi';

interface RegisterWithRoleRequest {
  username: string;
  email: string;
  password: string;
  role: 'student' | 'instructor';
}

interface RegisterWithRoleResponse {
  success: boolean;
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
    roleId?: number;
  };
  jwt: string;
  message?: string;
  warning?: string;
}

export class AuthWithRoleService {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
  }

  /**
   * Register a user with a specific role using the custom API endpoint
   */
  async registerWithRole(data: RegisterWithRoleRequest): Promise<RegisterWithRoleResponse> {
    try {
      console.log('🔐 AuthWithRole: Attempting registration with role:', data.role);
      
      const response = await fetch('/api/auth/register-with-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Non-JSON response:', text);
        throw new Error('Server returned non-JSON response. Check server logs.');
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.details || result.error || 'Registration failed');
      }

      if (!result.success) {
        throw new Error(result.error || 'Registration failed');
      }

      console.log('✅ AuthWithRole: Registration successful, user role:', result.user.role);
      
      // Store the JWT token
      if (typeof window !== 'undefined' && result.jwt) {
        localStorage.setItem('strapi-token', result.jwt);
      }

      return result;
    } catch (error) {
      console.error('❌ AuthWithRole: Registration error:', error);
      throw error;
    }
  }

  /**
   * Test the role-based registration endpoint
   */
  async testEndpoint(): Promise<any> {
    try {
      const response = await fetch('/api/auth/register-with-role', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ AuthWithRole: Test endpoint error:', error);
      throw error;
    }
  }
}

export const authWithRoleService = new AuthWithRoleService();