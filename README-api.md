# 🎓 Modern E-Learning Platform

A comprehensive e-learning platform built with Strapi CMS and designed for scalable online education. This platform supports course creation, student enrollment, progress tracking, and certification.

## 🚀 Features

### 📚 Course Management
- **Course Catalog**: Organized library with filtering by categories, difficulty, and ratings
- **Rich Media**: Course thumbnails and avatars for better visual identification
- **Lesson Structure**: Video lectures, reading materials, assignments, and quizzes
- **Dynamic Content**: Easy content management through Strapi CMS
- **Preview Lessons**: Allow free preview of select lessons

### 👥 User Roles & Permissions
- **Students**: Enroll in courses, track progress, receive cert}
```

## 🔧 **TROUBLESHOOTING**

### Common Issues

#### 403 Forbidden on Authentication Endpoints

If you're getting a 403 error when trying to login (`POST /api/auth/local`), you need to enable public permissions for authentication:

**Quick Fix via Admin Panel:**
1. Go to `http://localhost:1337/admin`
2. Navigate to **Settings** → **Users & Permissions Plugin** → **Roles**
3. Click on **Public** role
4. Under **Users-permissions**, enable:
   
   **Auth:**
   - ✅ `callback` - OAuth callbacks
   - ✅ `connect` - Social login connections
   - ✅ `emailConfirmation` - Email verification
   - ✅ `forgotPassword` - Password reset requests
   - ✅ `register` - User registration
   - ✅ `resetPassword` - Password reset completion
   - ✅ `sendEmailConfirmation` - Resend confirmation emails
   
   **User:**
   - ✅ `create` - User registration (alternative)
   
   **Permissions:**
   - ✅ `getPermissions` - Query permissions (optional)

5. **DO NOT enable** (security risk): `changePassword`, `count`, `destroy`, `find`, `findOne`, `me`, or any role endpoints
6. Click **Save**

**Alternative: Seed Script Fix**
The authentication permissions should be automatically set when you run:
```bash
npm run seed:elearning
```

#### Testing Authentication

Test with these sample users created by the seed script:

**Instructor Login:**
```bash
curl -X POST http://localhost:1337/api/auth/local \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "john.doe@elearning.com",
    "password": "Password123!"
  }'
```

**Student Login:**
```bash
curl -X POST http://localhost:1337/api/auth/local \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "alice.johnson@elearning.com", 
    "password": "Password123!"
  }'
```

#### Common HTTP Error Codes

| Status | Error | Solution |
|--------|-------|----------|
| **403** | Forbidden on auth endpoints | Enable public permissions for auth |
| **403** | CORS error from frontend | Configure CORS in `config/middlewares.ts` |
| **400** | Missing identifier/password | Check request body format |
| **400** | Invalid credentials | Verify email/password combination |
| **404** | Endpoint not found | Check URL and HTTP method |
| **500** | Server error | Check Strapi logs for details |

#### CORS Issues (Frontend Integration)

If your frontend (React/Next.js) gets 403 errors but curl works:

**Problem**: CORS blocking cross-origin requests from `http://localhost:3000` to `http://localhost:1337`

**Solution**: Update `config/middlewares.ts`:
```typescript
export default [
  'strapi::logger',
  'strapi::errors', 
  'strapi::security',
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      headers: '*',
      origin: [
        'http://localhost:3000',  // React
        'http://localhost:3001', 
        'http://localhost:3003',  // Your frontend
        'http://127.0.0.1:3000',
      ],
    },
  },
  // ...rest of middlewares
];
```

**After updating**: Restart Strapi with `npm run develop`

#### Database Issues

If you're having database issues:
```bash
# Reset database and reseed
rm -rf .tmp/data.db
npm run develop
# Wait for server to start, then:
npm run seed:elearning
```

#### Permission Debugging

To check current permissions via API:
```bash
# Get public role permissions
curl http://localhost:1337/api/users-permissions/roles

# Check if user endpoints are accessible
curl http://localhost:1337/api/auth/local/register \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"test123"}'
```

## 📚 Documentationates
- **Instructors**: Create and manage courses, monitor student progress
- **Administrators**: Oversee platform, manage users and content

### 📈 Learning Analytics
- **Progress Tracking**: Monitor completion rates and time spent
- **Performance Analytics**: Course engagement and completion statistics
- **Personalized Recommendations**: AI-driven course suggestions

### 🏆 Certification System
- **Digital Certificates**: Automated certificate generation upon completion
- **Verification System**: Unique verification codes for certificate authenticity

### 💎 Premium Features
- **Freemium Model**: Free courses with premium upgrade options
- **Subscription Plans**: Monthly/yearly access to premium content
- **Advanced Analytics**: Detailed insights for instructors

## 🛠 Technology Stack

### Backend (Strapi CMS)
- **Content Management**: Course content, lessons, and media management
- **User Management**: Authentication and role-based permissions
- **API**: RESTful and GraphQL APIs for frontend integration
- **Media Hosting**: Integration ready for Cloudinary or similar services

### Database Schema
- **Courses**: Title, description, pricing, difficulty levels
- **Lessons**: Video content, reading materials, assignments
- **Enrollments**: Student course registrations and progress
- **Reviews**: Course ratings and feedback system
- **Certificates**: Digital completion certificates

## 📋 Changelog

### Version 1.2.0 (July 2025)
**New Features:**
- 🎥 **Video Media Support**: Added comprehensive video handling for courses
  - `introVideo`: Course introduction/preview video files (MP4, WebM, AVI, MOV)
  - `promoVideo`: Promotional video files for marketing
  - `courseMedia`: Multiple media files (images, videos, documents)
  - `introVideoUrl` & `promoVideoUrl`: External video URLs (YouTube, Vimeo)
  - Video file upload support up to 100MB
- 🎬 **Lesson Video Enhancement**: 
  - `videoFile`: Upload lesson video files directly
  - `videoUrl`: External lesson video URLs
  - `materials`: Multiple lesson attachments and resources

**API Changes:**
- Extended Course schema with 5 new video-related fields
- Enhanced Lesson schema with video file upload support
- Updated seed script to handle video uploads and URL assignments
- Added video upload examples in API documentation

**Improvements:**
- Enhanced media management documentation
- Updated course creation workflow with video support
- Added video format specifications and upload requirements
- Improved seed script with video-to-course mapping

### Version 1.1.0 (July 2025)
**New Features:**
- ✅ **Course Avatar Field**: Added dedicated `avatar` field for course icons/logos
  - Separate from `thumbnail` for better visual hierarchy
  - Recommended size: 256x256px (square)
  - Supports JPG, PNG, WebP formats
  - Automatically populated by seed script with diverse images

**API Changes:**
- Updated Course schema to include `avatar` media field
- Enhanced course creation examples with media upload workflow
- Added comprehensive media field documentation

**Improvements:**
- Enhanced course seed data with 10 comprehensive courses
- Improved instructor profiles with detailed bios and expertise
- Updated API documentation with sample responses

### Version 1.0.0 (January 2025)
**Initial Release:**
- Complete e-learning platform with course management
- User roles: Student, Instructor, Administrator  
- Course enrollment and progress tracking
- Review and rating system
- Comprehensive API with authentication

## 🏗 Content Types

### Core Entities
- **Course**: Main course entity with metadata and relationships
- **Course Category**: Organize courses by subject areas
- **Lesson**: Individual learning units within courses
- **Enrollment**: Student-course relationship tracking
- **User Profile**: Extended user information for learners and instructors

### Supporting Entities
- **Course Review**: Student feedback and ratings
- **Lesson Progress**: Individual lesson completion tracking
- **Certificate**: Digital completion certificates
- **Tag**: Course tagging system for better discoverability

## 🖼️ Media Management

### Course Media Fields

The course content type includes multiple media fields for comprehensive course representation:

#### **Image Media Fields**
- **`thumbnail`**: Large cover image displayed in course listings and details
  - Recommended size: 1200x630px (landscape)
  - Used for: Course cards, headers, social sharing
  
- **`avatar`**: Small icon/logo representing the course
  - Recommended size: 256x256px (square)
  - Used for: Navigation, compact lists, course badges
  - Added in v1.1.0 for better course identification

#### **Video Media Fields**
- **`introVideo`**: Course introduction/preview video file
  - Supported formats: MP4, WebM, AVI, MOV
  - Max file size: 100MB
  - Used for: Course previews, introduction content
  
- **`promoVideo`**: Marketing/promotional video file
  - Supported formats: MP4, WebM, AVI, MOV
  - Max file size: 50MB
  - Used for: Course promotion, social media sharing

- **`courseMedia`**: Additional course materials (images, videos, documents)
  - Multiple files allowed
  - Supported formats: All image, video, and document types
  - Used for: Supplementary materials, resources, downloadable content

#### **Video URL Fields**
- **`introVideoUrl`**: External video URL (YouTube, Vimeo, etc.)
  - Used when hosting videos externally
  - Alternative to uploading `introVideo` file
  
- **`promoVideoUrl`**: External promotional video URL
  - Used for marketing campaigns and external sharing
  - Alternative to uploading `promoVideo` file

#### **Media Response Format**
All media fields return the following structure:
```json
{
  "data": {
    "id": 1,
    "attributes": {
      "name": "filename.jpg",
      "url": "/uploads/filename_hash.jpg",
      "mime": "image/jpeg",
      "size": 45.67,
      "width": 1200,
      "height": 630,
      "alternativeText": "Description for accessibility",
      "caption": "Optional caption text",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

#### **Upload Requirements**

**Image Files:**
- **Supported formats**: JPG, PNG, WebP, GIF
- **Max file size**: 5MB
- **Recommended optimization**: Use WebP for better performance

**Video Files:**
- **Supported formats**: MP4, WebM, AVI, MOV
- **Max file size**: 100MB (intro videos), 50MB (promo videos)
- **Recommended format**: MP4 with H.264 encoding
- **Recommended resolution**: 1080p or 720p

**General Requirements:**
- **Alt text**: Always include for accessibility
- **Captions**: Include for video content accessibility
- **File naming**: Use descriptive, SEO-friendly names

## 🚀 Getting Started

### Prerequisites
- Node.js (>=18.0.0 <=22.x.x)
- npm (>=6.0.0)
- Database (SQLite for development, PostgreSQL/MySQL for production)

### Installation

1. **Clone and Install Dependencies**
```bash
git clone <repository-url>
cd my-strapi-app
npm install
```

2. **Environment Setup**
```bash
cp .env.example .env
# Configure your environment variables
```

3. **Database Setup**
```bash
npm run develop
```

4. **Seed E-Learning Data**
```bash
npm run seed:elearning
```

### Development Commands

```bash
# Start development server with auto-reload
npm run develop

# Build admin panel
npm run build

# Start production server
npm run start

# Seed example data
npm run seed:example

# Seed e-learning platform data
npm run seed:elearning
```

## 📊 API Endpoints

### Courses
- `GET /api/courses` - List all courses
- `GET /api/courses/featured` - Get featured courses
- `GET /api/courses/:id` - Get course details
- `GET /api/courses/search?query=` - Search courses
- `GET /api/courses/category/:categoryId` - Courses by category

### Lessons
- `GET /api/lessons` - List lessons
- `GET /api/lessons/:id` - Get lesson details

### Enrollments
- `POST /api/enrollments` - Enroll in course
- `GET /api/enrollments` - User's enrollments
- `PUT /api/enrollments/:id` - Update progress

### Reviews
- `POST /api/course-reviews` - Add course review
- `GET /api/course-reviews` - Get reviews

## � Authentication & Permissions

### User Roles
1. **Public**: Browse courses, view previews
2. **Authenticated**: Enroll in courses, track progress
3. **Instructor**: Create and manage courses
4. **Administrator**: Full platform management

### Permission Structure
- Course creation restricted to instructors
- Enrollment tracking per user
- Review system with moderation capabilities

## 🎨 Content Components

### Learning Components
- **Video Lesson**: Video content with transcripts and subtitles
- **Reading Material**: Rich text content with attachments
- **Assignment**: File or text-based assignments
- **Quiz**: Interactive assessments with scoring

### Shared Components
- **Media**: Image, video, and file management
- **Rich Text**: Formatted content blocks
- **SEO**: Meta tags and social sharing

## 📦 Deployment

### Hosting Options
- **Strapi Cloud**: Official hosting solution
- **Railway**: Easy deployment with Git integration
- **Heroku**: Classic PaaS deployment
- **AWS/DigitalOcean**: Custom server deployment

### Production Configuration
```bash
# Build for production
npm run build

# Configure environment variables
DATABASE_URL=postgresql://...
CLOUDINARY_NAME=...
ADMIN_JWT_SECRET=...

# Deploy
npm run start
```

## 🔧 Customization

### Adding New Course Types
1. Extend the Course content type
2. Add new lesson components
3. Update API permissions
4. Modify frontend accordingly

### Payment Integration
- Ready for Stripe/PayPal integration
- Payment status tracking in enrollments
- Subscription management support

### Analytics Integration
- Google Analytics ready
- Custom event tracking for course interactions
- Learning analytics dashboard support

## � API Endpoints

This section provides a comprehensive guide to all available API endpoints in the e-learning platform.

### 🎓 **COURSES**

#### Core Course Endpoints
| Method | Endpoint | Auth Required | Middleware | Description |
|--------|----------|---------------|------------|-------------|
| `GET` | `/api/courses` | No | - | Get all courses |
| `GET` | `/api/courses/:id` | No | - | Get specific course |
| `POST` | `/api/courses` | Yes | instructor-check | Create new course |
| `PUT` | `/api/courses/:id` | Yes | instructor-check | Update course |
| `DELETE` | `/api/courses/:id` | Yes | instructor-check | Delete course |

**Parameters:**
- **GET /api/courses**: 
  - Query: `populate`, `filters`, `sort`, `pagination`
  - Returns: `{ data: Course[], meta: pagination }`
- **POST /api/courses**: 
  - Body: Course data (instructor auto-set)
  - Returns: `{ data: Course }`

#### Custom Course Endpoints
| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `GET` | `/api/courses/featured` | No | Get featured courses |
| `GET` | `/api/courses/category/:categoryId` | No | Get courses by category |
| `GET` | `/api/courses/:id/stats` | Yes (Instructor) | Get course statistics |
| `GET` | `/api/courses/search` | No | Search courses |

**Parameters:**
- **GET /api/courses/search**: 
  - Query: `query` (required)
  - Returns: `{ data: Course[] }`
- **GET /api/courses/:id/stats**: 
  - Returns: `{ data: { enrollmentCount, reviewCount, lessonCount, rating, completionRate } }`

#### Course Schema
```json
{
  "title": "string (required)",
  "description": "text (required)",
  "slug": "uid",
  "shortDescription": "string (max 160)",
  "thumbnail": "media (large cover image)",
  "avatar": "media (course icon/avatar image)",
  "introVideo": "media (course introduction video file)",
  "promoVideo": "media (promotional video file)",
  "courseMedia": "media[] (additional course materials)",
  "introVideoUrl": "string (external intro video URL)",
  "promoVideoUrl": "string (external promo video URL)",
  "price": "decimal",
  "isFree": "boolean",
  "isPremium": "boolean",
  "difficultyLevel": "enum[beginner,intermediate,advanced]",
  "duration": "integer (minutes)",
  "objectives": "text",
  "prerequisites": "text",
  "rating": "decimal (0-5)",
  "totalRatings": "integer",
  "enrollmentCount": "integer",
  "completionRate": "decimal (0-100)",
  "isActive": "boolean",
  "featured": "boolean", // NEW: mark as featured
  "language": "string", // NEW: course language
  "level": "string", // NEW: custom level field
  "requirements": "text", // NEW: additional requirements
  "instructor": "relation",
  "category": "relation",
  "lessons": "relation[]",
  "enrollments": "relation[]",
  "reviews": "relation[]",
  "tags": "relation[]"
}
```

### 📝 **LESSONS**

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `GET` | `/api/lessons` | No | Get all lessons |
| `GET` | `/api/lessons/:id` | No | Get specific lesson |
| `POST` | `/api/lessons` | Yes | Create new lesson |
| `PUT` | `/api/lessons/:id` | Yes | Update lesson |
| `DELETE` | `/api/lessons/:id` | Yes | Delete lesson |

**Lesson Schema:**
```json
{
  "title": "string (required)",
  "slug": "uid",
  "description": "text",
  "content": "richtext",
  "videoUrl": "string (external video URL)",
  "videoFile": "media (uploaded video file)",
  "materials": "media[] (lesson materials and attachments)",
  "duration": "integer (minutes)",
  "sortOrder": "integer",
  "isPreview": "boolean",
  "lessonType": "enum[video,reading,assignment,quiz]",
  "transcript": "text", // NEW: lesson transcript
  "resources": "media[]", // NEW: extra resources
  "quiz": "relation", // NEW: quiz relation if lessonType=quiz
  "assignment": "relation", // NEW: assignment relation if lessonType=assignment
  "course": "relation",
  "progress": "relation[]"
}
```

### 📊 **ENROLLMENTS**

| Method | Endpoint | Auth Required | Middleware | Description |
|--------|----------|---------------|------------|-------------|
| `GET` | `/api/enrollments` | Yes | - | Get user enrollments |
| `GET` | `/api/enrollments/:id` | Yes | - | Get specific enrollment |
| `POST` | `/api/enrollments` | Yes | enrollment-check | Enroll in course |
| `PUT` | `/api/enrollments/:id` | Yes | - | Update enrollment |

**Enrollment Schema:**
```json
{
  "enrollmentDate": "datetime",
  "completionDate": "datetime",
  "progress": "decimal (0-100)",
  "status": "enum[active,completed,suspended]",
  "lastAccessedAt": "datetime",
  "certificateIssued": "boolean",
  "student": "relation",
  "course": "relation",
  "lessonProgress": "relation[]"
}
```

### 📈 **LESSON PROGRESS**

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `GET` | `/api/lesson-progresses` | Yes | Get progress records |
| `GET` | `/api/lesson-progresses/:id` | Yes | Get specific progress |
| `POST` | `/api/lesson-progresses` | Yes | Create progress record |
| `PUT` | `/api/lesson-progresses/:id` | Yes | Update progress |

**Progress Schema:**
```json
{
  "isCompleted": "boolean",
  "completionDate": "datetime",
  "timeSpent": "integer (minutes)",
  "progressPercentage": "decimal (0-100)",
  "lastAccessedAt": "datetime",
  "notes": "text",
  "student": "relation",
  "lesson": "relation",
  "enrollment": "relation"
}
```

### ⭐ **COURSE REVIEWS**

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `GET` | `/api/course-reviews` | No | Get all reviews |
| `GET` | `/api/course-reviews/:id` | No | Get specific review |
| `POST` | `/api/course-reviews` | Yes | Create review |
| `PUT` | `/api/course-reviews/:id` | Yes | Update review |

**Review Schema:**
```json
{
  "rating": "integer (1-5)",
  "comment": "text",
  "isRecommended": "boolean",
  "reviewDate": "datetime",
  "isVerified": "boolean",
  "course": "relation",
  "student": "relation"
}
```

### 🏆 **CERTIFICATES**

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `GET` | `/api/certificates` | Yes | Get user certificates |
| `GET` | `/api/certificates/:id` | Yes | Get specific certificate |
| `POST` | `/api/certificates` | Yes (Instructor) | Issue certificate |

**Certificate Schema:**
```json
{
  "certificateNumber": "string (unique)",
  "issueDate": "date",
  "completionDate": "date",
  "grade": "string",
  "certificateUrl": "string",
  "isValid": "boolean",
  "verificationCode": "string",
  "course": "relation",
  "student": "relation"
}
```

### 📂 **CATEGORIES & TAGS**

#### Course Categories
| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `GET` | `/api/course-categories` | No | Get all categories |
| `GET` | `/api/course-categories/:id` | No | Get specific category |

**Category Schema:**
```json
{
  "name": "string (required)",
  "slug": "uid",
  "description": "text",
  "color": "string",
  "icon": "media",
  "isActive": "boolean",
  "sortOrder": "integer",
  "courses": "relation[]"
}
```

#### Tags
| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `GET` | `/api/tags` | No | Get all tags |
| `GET` | `/api/tags/:id` | No | Get specific tag |
| `POST` | `/api/tags` | Yes (Instructor) | Create tag |
| `PUT` | `/api/tags/:id` | Yes (Instructor) | Update tag |

**Tag Schema:**
```json
{
  "name": "string (required)",
  "slug": "uid",
  "color": "string",
  "courses": "relation[]"
}
```

### 👤 **USER PROFILES**

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `GET` | `/api/user-profiles` | Yes | Get user profiles |
| `GET` | `/api/user-profiles/:id` | Yes | Get specific profile |
| `PUT` | `/api/user-profiles/:id` | Yes | Update profile |

**Profile Schema:**
```json
{
  "firstName": "string",
  "lastName": "string", 
  "bio": "text",
  "avatar": "media",
  "dateOfBirth": "date",
  "phone": "string",
  "address": "text",
  "isInstructor": "boolean",
  "instructorBio": "richtext",
  "expertise": "json",
  "experienceLevel": "enum[beginner,intermediate,advanced,expert]",
  "learningGoals": "text",
  "interests": "json",
  "socialLinks": "json",
  "user": "relation"
}
```

### 🔐 **AUTHENTICATION (Users-Permissions)**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/local/register` | User registration |
| `POST` | `/api/auth/local` | User login |
| `GET` | `/api/users/me` | Get current user |
| `PUT` | `/api/users/:id` | Update user |

#### Authentication Examples

**User Registration:**
```bash
POST /api/auth/local/register
Content-Type: application/json

{
  "username": "student1",
  "email": "student1@example.com",
  "password": "Password123!"
}
```

**User Login:**
```bash
POST /api/auth/local
Content-Type: application/json

{
  "identifier": "student1@example.com",
  "password": "Password123!"
}
```

**Response Format:**
```json
{
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "student1",
    "email": "student1@example.com",
    "confirmed": true,
    "blocked": false,
    "role": {
      "id": 1,
      "name": "Student",
      "type": "student"
    }
  }
}
```

### 📋 **STANDARD QUERY PARAMETERS**

All `GET` endpoints support these Strapi query parameters:

#### Population
```
?populate=field1,field2
?populate[field][populate]=nestedField
?populate=*
```

#### Filtering
```
?filters[field][$eq]=value
?filters[field][$containsi]=text
?filters[field][$in][0]=value1&filters[field][$in][1]=value2
?filters[field][$null]=true
?filters[field][$notNull]=true
```

#### Sorting
```
?sort[0]=field:asc
?sort[0]=field:desc
?sort=field1:asc,field2:desc
```

#### Pagination
```
?pagination[page]=1
?pagination[pageSize]=25
?pagination[start]=0
?pagination[limit]=10
```

### 🛡️ **ROLE-BASED ACCESS**

#### **Student Role** Can:
- ✅ View courses, lessons, categories, tags
- ✅ Enroll in courses
- ✅ Track lesson progress
- ✅ Leave reviews
- ✅ View own certificates
- ✅ Update own profile

#### **Instructor Role** Can:
- ✅ All student permissions +
- ✅ Create/update/delete own courses
- ✅ Create/update lessons for own courses
- ✅ View course statistics for own courses
- ✅ Create certificates for students
- ✅ Manage tags
- ✅ View student progress in own courses

#### **Public** Can:
- ✅ View published courses
- ✅ View categories and tags
- ✅ Search courses
- ✅ View course reviews

### 📝 **EXAMPLE REQUESTS**

#### Create Course (Instructor)
```bash
POST /api/courses
Authorization: Bearer <token>
Content-Type: application/json

{
  "data": {
    "title": "React Fundamentals",
    "description": "Learn React from scratch with hands-on projects",
    "shortDescription": "Master React basics in 8 weeks",
    "price": 99.99,
    "difficultyLevel": "beginner",
    "duration": 480,
    "category": 1,
    "tags": [1, 2, 3],
    "objectives": "Build modern web applications with React",
    "prerequisites": "Basic JavaScript knowledge",
    "thumbnail": 15,
    "avatar": 16
  }
}
```

**Note**: Media files (`thumbnail` and `avatar`) must be uploaded first using the upload endpoint, then reference the returned file ID.

**Upload Media Example:**
```bash
# First, upload the avatar image
POST /api/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

files: [course-avatar.jpg]
fileInfo: {
  "alternativeText": "React Fundamentals Course Avatar",
  "caption": "Course avatar for React Fundamentals"
}

# Response will contain the file ID to use in course creation
{
  "id": 16,
  "url": "/uploads/course_avatar_hash.jpg"
}
```

**Upload Video Media Example:**
```bash
# Upload course introduction video
POST /api/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

files: [course-intro-video.mp4]
fileInfo: {
  "alternativeText": "Introduction video for React Fundamentals Course",
  "caption": "Course introduction video"
}

# Response
{
  "id": 17,
  "url": "/uploads/course_intro_video_hash.mp4",
  "mime": "video/mp4",
  "size": 25.7
}

# Upload promotional video
POST /api/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

files: [course-promo-video.mp4]
fileInfo: {
  "alternativeText": "Promotional video for React Fundamentals Course",
  "caption": "Course promotional video"
}

# Response
{
  "id": 18,
  "url": "/uploads/course_promo_video_hash.mp4"
}
```

**Create Course with Full Media Support:**
```bash
POST /api/courses
Authorization: Bearer <token>
Content-Type: application/json

{
  "data": {
    "title": "Advanced React Development",
    "description": "Master React with hooks, context, and testing",
    "shortDescription": "Advanced React course with modern practices",
    "price": 149.99,
    "difficultyLevel": "advanced",
    "duration": 1200,
    "category": 1,
    "instructor": 2,
    "thumbnail": 15,
    "avatar": 16,
    "introVideo": 17,
    "promoVideo": 18,
    "introVideoUrl": "https://www.youtube.com/watch?v=dpw9EHDh2bM",
    "promoVideoUrl": "https://vimeo.com/123456789",
    "courseMedia": [19, 20, 21]
  }
}
```

#### Enroll in Course (Student)
```bash
POST /api/enrollments
Authorization: Bearer <token>
Content-Type: application/json

{
  "data": {
    "course": 1
  }
}
```

#### Update Lesson Progress (Student)
```bash
PUT /api/lesson-progresses/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "data": {
    "isCompleted": true,
    "progressPercentage": 100,
    "timeSpent": 45,
    "notes": "Completed the React hooks lesson"
  }
}
```

#### Search Courses
```bash
GET /api/courses/search?query=react&populate=instructor,category,tags
```

#### Get Course with Relations
```bash
GET /api/courses/1?populate[instructor][populate]=profile&populate[lessons][sort]=sortOrder:asc&populate[category]=*&populate[tags]=*
```

#### Filter Courses by Category and Difficulty
```bash
GET /api/courses?filters[category][id][$eq]=1&filters[difficultyLevel][$eq]=beginner&populate=instructor,thumbnail
```

### 🚦 **HTTP Status Codes**

- **200** - Success
- **201** - Created
- **400** - Bad Request (validation errors)
- **401** - Unauthorized (not logged in)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found
- **500** - Internal Server Error

### 📊 **Response Format**

#### Successful Response
```json
{
  "data": {
    "id": 1,
    "documentId": "abc123",
    "attributes": {
      "title": "Course Title",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  },
  "meta": {}
}
```

#### Error Response
```json
{
  "error": {
    "status": 400,
    "name": "ValidationError",
    "message": "Missing required field",
    "details": {}
  }
}
```

## �📚 Documentation

### Admin Panel
Access the Strapi admin panel at `http://localhost:1337/admin` to:
- Manage courses and content
- Configure user permissions
- Monitor platform analytics
- Moderate reviews and discussions

### API Documentation
API documentation is auto-generated and available at `/documentation` when the documentation plugin is enabled.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- 📧 **Supervisor**: Amjad Iqbal Khan (Amjad.iqbal@vu.edu.pk)
- 💬 **Skype**: amjadiqbalkhanniazi
- 📖 **Documentation**: [Strapi Documentation](https://docs.strapi.io)
- 🌐 **Community**: [Strapi Forum](https://forum.strapi.io)

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Core course management
- ✅ User authentication and roles
- ✅ Basic progress tracking
- ✅ Review system

### Phase 2 (Next)
- 🔄 Real-time discussions
- 🔄 Advanced analytics dashboard
- 🔄 Mobile app API
- 🔄 Payment integration

### Phase 3 (Future)
- 📅 Live streaming classes
- 📅 AI-powered recommendations
- 📅 Gamification features
- 📅 Multi-language support

---

<sub>🎓 Built with passion for education and powered by Strapi CMS</sub>
