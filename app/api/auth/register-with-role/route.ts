export const dynamic = 'force-dynamic';

interface RegisterWithRoleRequest {
  username: string;
  email: string;
  password: string;
  role: 'student' | 'instructor';
}

interface StrapiRole {
  id: number;
  name: string;
  description: string;
  type: string;
}

interface StrapiUser {
  id: number;
  username: string;
  email: string;
  role?: StrapiRole;
  confirmed: boolean;
  blocked: boolean;
}

async function strapiRequest(endpoint: string, options: RequestInit = {}, useAdminToken = false) {
  const baseURL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
  const url = `${baseURL}/api${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (useAdminToken) {
    const adminToken = process.env.STRAPI_ADMIN_API_TOKEN;
    if (!adminToken) {
      throw new Error('Admin API token not configured');
    }
    headers.Authorization = `Bearer ${adminToken}`;
  }

  console.log(`🔄 API Request: ${options.method || 'GET'} ${url}`);
  
  const response = await fetch(url, {
    ...options,
    headers,
  });

  const responseText = await response.text();
  
  if (!response.ok) {
    let errorData;
    try {
      errorData = JSON.parse(responseText);
    } catch {
      errorData = {
        error: {
          status: response.status,
          name: 'NetworkError',
          message: `HTTP ${response.status}: ${response.statusText}`,
        },
      };
    }
    
    console.error('❌ Strapi API Error:', errorData);
    throw new Error(errorData.error?.message || 'API request failed');
  }

  if (!responseText) {
    return {};
  }

  const data = JSON.parse(responseText);
  console.log('✅ API Response received');
  return data;
}

async function findRoleByName(roleName: string): Promise<StrapiRole | null> {
  try {
    console.log(`🔍 Looking for role: ${roleName}`);
    
    const response = await strapiRequest('/users-permissions/roles', { method: 'GET' }, true);
    
    // Handle different response structures
    let roles = [];
    if (response.data) {
      roles = response.data;
    } else if (response.roles) {
      roles = response.roles;
    } else if (Array.isArray(response)) {
      roles = response;
    }
    
    const role = roles.find((r: StrapiRole) => r.name.toLowerCase() === roleName.toLowerCase());
    
    if (role) {
      console.log(`✅ Found role: ${role.name} (ID: ${role.id})`);
      return role;
    } else {
      console.log(`❌ Role not found: ${roleName}`);
      console.log('Available roles:', roles.map((r: StrapiRole) => r.name));
      return null;
    }
  } catch (error) {
    console.error('❌ Error finding role:', error);
    throw new Error(`Failed to find role: ${roleName}`);
  }
}

async function updateUserRole(userId: number, roleId: number): Promise<StrapiUser> {
  try {
    console.log(`🔄 Updating user ${userId} to role ${roleId}`);
    
    const response = await strapiRequest(
      `/users/${userId}`,
      {
        method: 'PUT',
        body: JSON.stringify({ role: roleId }),
      },
      true
    );

    console.log(`✅ User role updated successfully`);
    return response;
  } catch (error) {
    console.error('❌ Error updating user role:', error);
    throw new Error('Failed to update user role');
  }
}

export async function POST(request: Request) {
  try {
    console.log('📝 Starting role-based registration process');

    // Check if admin token is configured
    if (!process.env.STRAPI_ADMIN_API_TOKEN) {
      console.error('❌ Admin API token not configured');
      return Response.json({
        success: false,
        error: 'Admin API token not configured',
        details: 'Please set STRAPI_ADMIN_API_TOKEN in your environment variables. Get this token from Strapi Admin Panel > Settings > API Tokens.',
        configured: false
      }, { status: 500 });
    }

    // Parse request body
    let body: RegisterWithRoleRequest;
    try {
      body = await request.json();
      console.log('📝 Request body parsed:', { ...body, password: '[HIDDEN]' });
    } catch (error) {
      console.error('❌ Invalid JSON in request body:', error);
      return Response.json({
        success: false,
        error: 'Invalid JSON in request body'
      }, { status: 400 });
    }

    const { username, email, password, role } = body;

    // Validate required fields
    if (!username || !email || !password || !role) {
      console.error('❌ Missing required fields');
      return Response.json({
        success: false,
        error: 'Missing required fields: username, email, password, role'
      }, { status: 400 });
    }

    // Validate role
    if (!['student', 'instructor'].includes(role)) {
      console.error('❌ Invalid role:', role);
      return Response.json({
        success: false,
        error: 'Invalid role. Must be "student" or "instructor"'
      }, { status: 400 });
    }

    console.log(`📝 Registering user: ${email} as ${role}`);

    // Step 1: Register user with Strapi (gets default authenticated role)
    console.log('Step 1: Registering user with default role...');
    let authResponse;
    try {
      authResponse = await strapiRequest('/auth/local/register', {
        method: 'POST',
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });
    } catch (error) {
      console.error('❌ Registration failed:', error);
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed',
        details: 'Failed to register user with Strapi'
      }, { status: 400 });
    }

    const { jwt, user } = authResponse;
    console.log(`✅ User registered with ID: ${user.id}`);

    // Step 2: Find the target role
    console.log(`Step 2: Finding ${role} role...`);
    let targetRole;
    try {
      targetRole = await findRoleByName(role);
    } catch (error) {
      console.error('❌ Error finding role:', error);
      // Return success but with warning if role lookup fails
      return Response.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: 'authenticated', // default role
        },
        jwt,
        warning: `Failed to find role "${role}". User registered with default role.`,
        message: 'User registered successfully but role assignment failed'
      });
    }
    
    if (!targetRole) {
      // If role not found, return success but with warning
      console.warn(`⚠️ Role "${role}" not found, user registered with default role`);
      return Response.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: 'authenticated', // default role
        },
        jwt,
        warning: `Role "${role}" not found in Strapi. User registered with default role. Please create the "${role}" role in Strapi Admin Panel.`,
        message: 'User registered successfully but role assignment failed'
      });
    }

    // Step 3: Update user's role
    console.log(`Step 3: Updating user role to ${targetRole.name}...`);
    try {
      await updateUserRole(user.id, targetRole.id);
    } catch (error) {
      console.error('❌ Error updating user role:', error);
      // Return success but with warning if role update fails
      return Response.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: 'authenticated', // default role
        },
        jwt,
        warning: `Failed to update user role to "${role}". User registered with default role.`,
        message: 'User registered successfully but role assignment failed'
      });
    }

    // Step 4: Fetch updated user with role information
    console.log('Step 4: Fetching updated user data...');
    let finalUser;
    try {
      finalUser = await strapiRequest(`/users/${user.id}?populate=role`, { method: 'GET' }, true);
    } catch (error) {
      console.error('❌ Error fetching updated user:', error);
      // Return success with basic user data
      return Response.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: targetRole.name,
          roleId: targetRole.id,
        },
        jwt,
        message: `User successfully registered as ${targetRole.name}`
      });
    }

    console.log('🎉 Registration completed successfully!');
    console.log('📊 Final user data:', {
      id: finalUser.id,
      username: finalUser.username,
      email: finalUser.email,
      role: finalUser.role?.name,
      roleId: finalUser.role?.id,
    });

    return Response.json({
      success: true,
      user: {
        id: finalUser.id,
        username: finalUser.username,
        email: finalUser.email,
        role: finalUser.role?.name || targetRole.name,
        roleId: finalUser.role?.id || targetRole.id,
      },
      jwt,
      message: `User successfully registered as ${finalUser.role?.name || targetRole.name}`
    });

  } catch (error) {
    console.error('❌ Registration failed:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return Response.json({
      success: false,
      error: errorMessage,
      details: 'Registration with role assignment failed'
    }, { status: 500 });
  }
}

export async function GET() {
  const isConfigured = !!process.env.STRAPI_ADMIN_API_TOKEN;
  
  return Response.json({
    message: 'Role-based registration endpoint',
    usage: 'POST with { username, email, password, role }',
    roles: ['student', 'instructor'],
    configured: isConfigured,
    strapiUrl: process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337',
    status: isConfigured ? 'Ready' : 'Missing admin token'
  });
}