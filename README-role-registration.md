# Role-Based Registration System

This system allows users to register with specific roles (student/instructor) and automatically assigns the correct Strapi role.

## 🚀 Quick Setup

### 1. Environment Variables

Add to your `.env.local`:

```env
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
STRAPI_ADMIN_API_TOKEN=your-admin-api-token-here
```

### 2. Get Admin API Token

1. Go to Strapi Admin Panel
2. Navigate to **Settings > API Tokens**
3. Click **Create new API Token**
4. Set:
   - **Name**: `Role Assignment Token`
   - **Token type**: `Full Access`
   - **Token duration**: `Unlimited`
5. Copy the generated token to your `.env.local`

### 3. Verify Roles Exist

Make sure these roles exist in Strapi:
- **Student** (name: "student")
- **Instructor** (name: "instructor")

Go to **Settings > Users & Permissions > Roles** to verify.

## 📋 Usage

### Frontend Registration

The updated registration form now includes role selection:

```typescript
// User selects role during registration
const registrationData = {
  username: "johndoe",
  email: "john@example.com", 
  password: "password123",
  role: "student" // or "instructor"
};
```

### API Endpoint

**POST** `/api/auth/register-with-role`

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123", 
  "role": "student"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 123,
    "username": "johndoe",
    "email": "john@example.com",
    "role": "student",
    "roleId": 2
  },
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "User successfully registered as student"
}
```

### Node.js Script

For bulk registration or testing:

```bash
# Set environment variables
export STRAPI_URL=http://localhost:1337
export STRAPI_ADMIN_API_TOKEN=your-token

# Run the script
node scripts/register-with-role.js
```

## 🔧 How It Works

### Registration Flow

1. **User Registration**: POST to `/auth/local/register` with basic info
2. **Role Lookup**: Find the target role ID by name
3. **Role Assignment**: PUT to `/users/{id}` with the role ID
4. **Verification**: Fetch updated user data with role info

### Error Handling

- ✅ **Missing Admin Token**: Returns configuration error
- ✅ **Invalid Role**: Returns validation error  
- ✅ **Role Not Found**: Returns warning but completes registration
- ✅ **Network Errors**: Proper error messages and logging

### Security

- 🔒 **Admin Token**: Only used server-side for role assignment
- 🔒 **Input Validation**: All inputs validated before processing
- 🔒 **Error Sanitization**: No sensitive data in error responses

## 🧪 Testing

### Test the API Endpoint

```bash
curl -X POST http://localhost:3000/api/auth/register-with-role \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "role": "student"
  }'
```

### Test with the Script

```bash
node scripts/register-with-role.js
```

### Frontend Testing

Visit `/test-api` (development only) to test all endpoints including role-based registration.

## 🔍 Troubleshooting

### Common Issues

**1. "Admin API token not configured"**
- Add `STRAPI_ADMIN_API_TOKEN` to `.env.local`
- Restart your Next.js server

**2. "Role not found"**
- Check role names in Strapi admin panel
- Ensure roles are named exactly "student" and "instructor"

**3. "Failed to update user role"**
- Verify admin token has full access permissions
- Check Strapi server logs for detailed errors

**4. "Registration failed"**
- Check if email/username already exists
- Verify password meets requirements (6+ characters)

### Debug Mode

Enable detailed logging by checking the browser console and server logs. All API calls are logged with 🔄, ✅, and ❌ indicators.

## 📚 API Reference

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register-with-role` | Register user with specific role |
| GET | `/api/auth/register-with-role` | Get endpoint documentation |

### Role Mapping

| Frontend Role | Strapi Role Name | Description |
|---------------|------------------|-------------|
| `student` | `student` | Can enroll in courses |
| `instructor` | `instructor` | Can create and manage courses |

### Response Codes

| Code | Description |
|------|-------------|
| 200 | Registration successful |
| 400 | Invalid input data |
| 500 | Server error or configuration issue |

## 🎯 Next Steps

1. **Test the registration flow** with both student and instructor roles
2. **Verify role-based redirects** work correctly
3. **Check permissions** in Strapi for each role
4. **Test the complete user journey** from registration to dashboard

The system is now ready for production use with proper role-based access control! 🚀