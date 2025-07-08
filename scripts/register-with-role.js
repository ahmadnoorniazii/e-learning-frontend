/**
 * Standalone Node.js script for registering users with specific roles in Strapi
 * 
 * Usage:
 * node scripts/register-with-role.js
 * 
 * Or with environment variables:
 * STRAPI_URL=http://localhost:1337 STRAPI_ADMIN_API_TOKEN=your-token node scripts/register-with-role.js
 */

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const ADMIN_API_TOKEN = process.env.STRAPI_ADMIN_API_TOKEN;

if (!ADMIN_API_TOKEN) {
  console.error('❌ STRAPI_ADMIN_API_TOKEN environment variable is required');
  console.log('💡 Get your admin API token from Strapi Admin Panel > Settings > API Tokens');
  process.exit(1);
}

async function strapiRequest(endpoint, options = {}, useAdminToken = false) {
  const url = `${STRAPI_URL}/api${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (useAdminToken && ADMIN_API_TOKEN) {
    headers.Authorization = `Bearer ${ADMIN_API_TOKEN}`;
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

async function findRoleByName(roleName) {
  try {
    console.log(`🔍 Looking for role: ${roleName}`);
    
    const response = await strapiRequest('/users-permissions/roles', { method: 'GET' }, true);
    const role = response.data?.find(r => r.name.toLowerCase() === roleName.toLowerCase());
    
    if (role) {
      console.log(`✅ Found role: ${role.name} (ID: ${role.id})`);
      return role;
    } else {
      console.log(`❌ Role not found: ${roleName}`);
      console.log('Available roles:', response.data?.map(r => r.name));
      return null;
    }
  } catch (error) {
    console.error('❌ Error finding role:', error);
    throw new Error(`Failed to find role: ${roleName}`);
  }
}

async function updateUserRole(userId, roleId) {
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

async function registerUserWithRole(userData) {
  try {
    const { username, email, password, role } = userData;
    
    console.log('📝 Starting role-based registration process');
    console.log(`📝 Registering user: ${email} as ${role}`);

    // Step 1: Register user with Strapi (gets default authenticated role)
    console.log('Step 1: Registering user with default role...');
    const authResponse = await strapiRequest('/auth/local/register', {
      method: 'POST',
      body: JSON.stringify({
        username,
        email,
        password,
      }),
    });

    const { jwt, user } = authResponse;
    console.log(`✅ User registered with ID: ${user.id}`);

    // Step 2: Find the target role
    console.log(`Step 2: Finding ${role} role...`);
    const targetRole = await findRoleByName(role);
    
    if (!targetRole) {
      throw new Error(`Role "${role}" not found in Strapi`);
    }

    // Step 3: Update user's role
    console.log(`Step 3: Updating user role to ${targetRole.name}...`);
    await updateUserRole(user.id, targetRole.id);

    // Step 4: Fetch updated user with role information
    console.log('Step 4: Fetching updated user data...');
    const finalUser = await strapiRequest(`/users/${user.id}?populate=role`, { method: 'GET' }, true);

    console.log('🎉 Registration completed successfully!');
    console.log('📊 Final user data:', {
      id: finalUser.id,
      username: finalUser.username,
      email: finalUser.email,
      role: finalUser.role?.name,
      roleId: finalUser.role?.id,
      confirmed: finalUser.confirmed,
      blocked: finalUser.blocked,
    });

    return {
      success: true,
      user: finalUser,
      jwt,
    };

  } catch (error) {
    console.error('❌ Registration failed:', error);
    throw error;
  }
}

// Test data - modify as needed
const testUsers = [
  {
    username: 'student_test',
    email: 'student@test.com',
    password: 'password123',
    role: 'student'
  },
  {
    username: 'instructor_test',
    email: 'instructor@test.com',
    password: 'password123',
    role: 'instructor'
  }
];

async function main() {
  console.log('🚀 Starting role-based registration script');
  console.log(`🔗 Strapi URL: ${STRAPI_URL}`);
  
  try {
    // Test connection first
    console.log('🔍 Testing Strapi connection...');
    await strapiRequest('/users-permissions/roles', { method: 'GET' }, true);
    console.log('✅ Strapi connection successful');

    // Register test users
    for (const userData of testUsers) {
      console.log(`\n${'='.repeat(50)}`);
      try {
        await registerUserWithRole(userData);
      } catch (error) {
        console.error(`❌ Failed to register ${userData.email}:`, error.message);
      }
    }

    console.log(`\n${'='.repeat(50)}`);
    console.log('🎉 Script completed!');

  } catch (error) {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  }
}

// Run the script if called directly
if (require.main === module) {
  main();
}

module.exports = {
  registerUserWithRole,
  findRoleByName,
  updateUserRole,
};