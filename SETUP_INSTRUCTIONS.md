# E-Learning Platform - Getting Started

## Issue Fixed: Featured Courses Not Showing

The issue was that the Strapi backend didn't have the required content-types configured. Here's what was done:

### ✅ Backend Content-Types Created

1. **Course** - Main course content
2. **Lesson** - Individual course lessons  
3. **Enrollment** - Student enrollments
4. **Review** - Course reviews and ratings
5. **User Profile** - Extended user information

### ✅ Frontend Error Handling Improved

- Better error messages when backend is unavailable
- Automatic fallback to mock data
- Clear instructions for users

## Quick Start

### 1. Start the Backend (Required)

```bash
# Navigate to backend directory
cd e-learning-backend

# Install dependencies (first time only)
npm install

# Start the development server
npm run dev
```

- Backend will be available at: http://localhost:1337
- Admin panel: http://localhost:1337/admin
- **Important**: Create your first admin user when prompted!

### 2. Start the Frontend

```bash
# In a new terminal, navigate to the main project directory
cd mahnoor-frontend

# Install dependencies (first time only)
npm install

# Start the development server
npm run dev
```

- Frontend will be available at: http://localhost:3000

### 3. Add Sample Courses

1. Go to http://localhost:1337/admin
2. Login with your admin credentials
3. Navigate to "Content Manager"
4. Click on "Course" in the left sidebar
5. Click "Create new entry"
6. Fill in the course details and save

## Testing the API

You can test the API connection by visiting:
- http://localhost:3000/test-api (in the frontend)

## Current Status

✅ Backend content-types configured  
✅ Frontend error handling improved  
✅ Local development setup ready  
⚠️ Sample data needs to be added manually through admin panel  

## Next Steps

1. Start both backend and frontend servers
2. Create admin user in Strapi
3. Add sample course data through admin panel
4. Test the homepage - featured courses should now appear!

## Troubleshooting

If courses still don't appear:

1. **Check backend is running**: Visit http://localhost:1337/admin
2. **Verify API endpoint**: Visit http://localhost:1337/api/courses
3. **Check frontend console**: Look for API call logs
4. **Add sample data**: Create courses through admin panel

The frontend will automatically fall back to mock data if the backend is not available.
