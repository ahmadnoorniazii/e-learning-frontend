# Strapi Backend Setup Guide

This guide will help you set up the Strapi backend for the e-learning platform.

## Quick Setup

1. **Create Strapi Project**
```bash
npx create-strapi-app@latest elearning-backend --quickstart
cd elearning-backend
```

2. **Start Strapi**
```bash
npm run develop
```

3. **Access Admin Panel**
- Open http://localhost:1337/admin
- Create your admin account

## Content Types Setup

### 1. Course Content Type

Create a new content type called "Course" with these fields:

**Basic Information:**
- `title` - Text (required)
- `description` - Rich Text (required)
- `price` - Number (decimal, required)
- `category` - Text (required)
- `level` - Enumeration (beginner, intermediate, advanced)
- `publicationStatus` - Enumeration (draft, published, archived)
- `duration` - Number (integer, in minutes)

**Media & Relations:**
- `thumbnail` - Media (single image)
- `instructor` - Relation (User from users-permissions, many-to-one)
- `tags` - JSON

**Advanced:**
- `studentsCount` - Number (integer, default: 0)
- `rating` - Number (decimal, default: 0)
- `reviewsCount` - Number (integer, default: 0)

### 2. Lesson Component

Create a component called "Lesson" with these fields:
- `title` - Text (required)
- `description` - Text
- `duration` - Number (integer, in minutes)
- `order` - Number (integer)
- `videoUrl` - Text
- `materials` - JSON

Add this component to Course as `lessons` (repeatable component).

### 3. Order Content Type

Create "Order" content type:
- `amount` - Number (decimal, required)
- `orderStatus` - Enumeration (pending, completed, failed, refunded)
- `paymentMethod` - Text (default: "card")
- `user` - Relation (User, many-to-one)
- `course` - Relation (Course, many-to-one)
- `transactionId` - Text

### 4. Review Content Type

Create "Review" content type:
- `rating` - Number (integer, 1-5, required)
- `comment` - Rich Text (required)
- `reviewStatus` - Enumeration (pending, approved, rejected)
- `user` - Relation (User, many-to-one)
- `course` - Relation (Course, many-to-one)

### 5. Certificate Content Type

Create "Certificate" content type:
- `certificateId` - Text (required, unique)
- `issuedAt` - DateTime (required)
- `certificateStatus` - Enumeration (issued, revoked)
- `user` - Relation (User, many-to-one)
- `course` - Relation (Course, many-to-one)
- `certificateUrl` - Text

### 6. Progress Content Type

Create "Progress" content type:
- `completedLessons` - JSON
- `percentage` - Number (integer, 0-100)
- `lastAccessed` - DateTime
- `user` - Relation (User, many-to-one)
- `course` - Relation (Course, many-to-one)

### 7. Enrollment Content Type

Create "Enrollment" content type:
- `enrolledAt` - DateTime (required)
- `enrollmentStatus` - Enumeration (active, completed, cancelled)
- `user` - Relation (User, many-to-one)
- `course` - Relation (Course, many-to-one)

## Important Notes

### Field Naming Convention

**CRITICAL**: Do not use "status" as a field name in any content type as it conflicts with Strapi's internal functionality. Instead use:

- For Courses: `publicationStatus`
- For Orders: `orderStatus`
- For Reviews: `reviewStatus`
- For Certificates: `certificateStatus`
- For Enrollments: `enrollmentStatus`

### Values for Status Fields

**Course Publication Status:**
```
draft
published
archived
```

**Order Status:**
```
pending
completed
failed
refunded
```

**Review Status:**
```
pending
approved
rejected
```

**Certificate Status:**
```
issued
revoked
```

**Enrollment Status:**
```
active
completed
cancelled
```

## User Roles Setup

### 1. Create Custom Roles

Go to Settings > Users & Permissions > Roles and create:

**Student Role:**
- Based on "Authenticated" role
- Permissions: Read courses, create/read own orders, create/read own reviews, read own progress

**Instructor Role:**
- Permissions: CRUD on own courses, read all orders for own courses, read reviews for own courses

**Admin Role:**
- Full permissions on all content types

### 2. User Profile Extension

Add these fields to User (in Users & Permissions):
- `firstName` - Text
- `lastName` - Text
- `avatar` - Media (single image)
- `bio` - Rich Text
- `website` - Text
- `socialLinks` - JSON

## API Permissions Configuration

### Public Permissions (No authentication required)
- Course: find, findOne
- Review: find (for public course reviews)

### Authenticated Permissions
- Course: find, findOne
- Order: create, find (own), findOne (own)
- Review: create, find, findOne, update (own), delete (own)
- Certificate: find (own), findOne (own)
- Progress: create, find (own), findOne (own), update (own)
- Enrollment: create, find (own), findOne (own)

### Instructor Permissions
- Course: create, find, findOne, update (own), delete (own)
- Order: find (for own courses)
- Review: find (for own courses)

### Admin Permissions
- All content types: Full CRUD access

## Sample Data

### Sample Courses
```json
{
  "title": "Complete React Development",
  "description": "Master React from basics to advanced",
  "price": 99.99,
  "category": "Web Development",
  "level": "intermediate",
  "publicationStatus": "published",
  "duration": 1200,
  "tags": ["React", "JavaScript", "Frontend"],
  "lessons": [
    {
      "title": "Introduction to React",
      "description": "Learn React basics",
      "duration": 45,
      "order": 1
    }
  ]
}
```

## Environment Variables

Create `.env` file in your Strapi project:

```env
HOST=0.0.0.0
PORT=1337
APP_KEYS=your-app-keys
API_TOKEN_SALT=your-api-token-salt
ADMIN_JWT_SECRET=your-admin-jwt-secret
JWT_SECRET=your-jwt-secret

# Database
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db

# For production, use PostgreSQL:
# DATABASE_CLIENT=postgres
# DATABASE_HOST=localhost
# DATABASE_PORT=5432
# DATABASE_NAME=elearning
# DATABASE_USERNAME=your-username
# DATABASE_PASSWORD=your-password
```

## Custom API Endpoints

Create custom controllers for analytics:

### 1. Analytics Controller

Create `src/api/analytics/controllers/analytics.js`:

```javascript
'use strict';

module.exports = {
  async dashboard(ctx) {
    try {
      const [users, courses, orders, enrollments] = await Promise.all([
        strapi.entityService.count('plugin::users-permissions.user'),
        strapi.entityService.count('api::course.course'),
        strapi.entityService.findMany('api::order.order'),
        strapi.entityService.count('api::enrollment.enrollment')
      ]);

      const totalRevenue = orders.reduce((sum, order) => {
        return order.orderStatus === 'completed' ? sum + order.amount : sum;
      }, 0);

      ctx.body = {
        totalUsers: users,
        activeCourses: courses,
        totalRevenue,
        totalEnrollments: enrollments
      };
    } catch (err) {
      ctx.badRequest('Analytics request failed');
    }
  }
};
```

### 2. Analytics Routes

Create `src/api/analytics/routes/analytics.js`:

```javascript
module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/analytics/dashboard',
      handler: 'analytics.dashboard',
      config: {
        policies: [],
        middlewares: [],
      },
    }
  ],
};
```

## Testing the Setup

1. **Create test data** through the admin panel
2. **Test API endpoints** using tools like Postman
3. **Verify permissions** by testing with different user roles
4. **Check file uploads** work correctly

## Production Considerations

1. **Database**: Switch to PostgreSQL for production
2. **File Storage**: Configure cloud storage (AWS S3, Cloudinary)
3. **Security**: Set up proper CORS, rate limiting
4. **Performance**: Enable caching, optimize queries
5. **Monitoring**: Set up logging and error tracking

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Configure CORS in `config/middlewares.js`
2. **Permission Denied**: Check role permissions in admin panel
3. **File Upload Issues**: Verify upload provider configuration
4. **Database Connection**: Check database credentials and connection
5. **Status Field Conflicts**: Ensure you're using the correct field names (not "status")

### Useful Commands:

```bash
# Reset admin password
npm run strapi admin:reset-user-password --email=admin@example.com

# Generate API documentation
npm run strapi generate:api

# Build for production
npm run build
```

This setup provides a robust backend for your e-learning platform with all necessary content types, permissions, and API endpoints while avoiding Strapi's reserved field name conflicts.