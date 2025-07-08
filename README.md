# Modern E-Learning Platform

A comprehensive e-learning platform built with Next.js and Strapi, featuring course management, user authentication, analytics, and more.

## Features

### Frontend (Next.js)
- **User Authentication**: Login/Register with role-based access (Student, Instructor, Admin)
- **Course Catalog**: Browse and search courses with filtering
- **Student Dashboard**: Track progress, view enrolled courses, certificates
- **Admin Panel**: Complete admin interface for managing the platform
- **Responsive Design**: Mobile-friendly interface with modern UI

### Backend (Strapi)
- **Content Management**: Manage courses, lessons, users, and media
- **API Integration**: RESTful APIs for all platform features
- **Role-Based Permissions**: Secure access control
- **File Upload**: Support for course materials and media

### Admin Features
- **Dashboard**: Overview of platform statistics and recent activity
- **User Management**: Add, edit, delete users with role assignment
- **Course Management**: Create, update, and manage courses
- **Order Management**: Track course purchases and payments
- **Analytics**: Detailed insights with charts and metrics
- **Reviews Management**: Moderate and manage course reviews
- **Certificates**: Issue and manage course completion certificates
- **Reports**: Generate and export platform reports
- **Settings**: Configure platform settings and preferences

## Technology Stack

- **Frontend**: Next.js 13, React, TypeScript, Tailwind CSS
- **Backend**: Strapi CMS
- **UI Components**: shadcn/ui, Radix UI
- **Charts**: Recharts
- **Icons**: Lucide React
- **Authentication**: JWT with Strapi Auth

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Strapi backend (see setup instructions below)

### Strapi Backend Setup

1. Create a new Strapi project:
```bash
npx create-strapi-app@latest backend --quickstart
cd backend
```

2. Install required plugins:
```bash
npm install @strapi/plugin-users-permissions
```

3. Create the following content types in Strapi Admin:

#### Course Content Type
- title (Text)
- description (Rich Text)
- price (Number)
- category (Text)
- level (Enumeration: beginner, intermediate, advanced)
- status (Enumeration: draft, published, archived)
- duration (Number)
- thumbnail (Media)
- instructor (Relation to User)
- lessons (Component - repeatable)
- tags (JSON)

#### Lesson Component
- title (Text)
- description (Text)
- duration (Number)
- order (Number)
- videoUrl (Text)

#### Order Content Type
- amount (Number)
- status (Enumeration: pending, completed, failed, refunded)
- paymentMethod (Text)
- user (Relation to User)
- course (Relation to Course)

#### Review Content Type
- rating (Number)
- comment (Rich Text)
- status (Enumeration: pending, approved, rejected)
- user (Relation to User)
- course (Relation to Course)

#### Certificate Content Type
- certificateId (Text)
- issuedAt (DateTime)
- status (Enumeration: issued, revoked)
- user (Relation to User)
- course (Relation to Course)

#### Progress Content Type
- completedLessons (JSON)
- percentage (Number)
- lastAccessed (DateTime)
- user (Relation to User)
- course (Relation to Course)

#### Enrollment Content Type
- enrolledAt (DateTime)
- status (Enumeration: active, completed, cancelled)
- user (Relation to User)
- course (Relation to Course)

4. Configure permissions in Users & Permissions plugin:
- Set up roles: Student, Instructor, Admin
- Configure API permissions for each role

5. Start Strapi:
```bash
npm run develop
```

### Frontend Setup

1. Clone and install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.local.example .env.local
```

Update `.env.local` with your Strapi URL:
```
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
```

3. Start the development server:
```bash
npm run dev
```

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── admin/             # Admin panel pages
│   ├── auth/              # Authentication pages
│   ├── courses/           # Course-related pages
│   ├── dashboard/         # Student dashboard
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── admin/            # Admin-specific components
│   ├── layout/           # Layout components
│   └── ui/               # UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and API
│   ├── auth.ts           # Authentication service
│   ├── strapi.ts         # Strapi API client
│   └── types.ts          # TypeScript types
└── public/               # Static assets
```

## API Integration

The platform integrates with Strapi through a comprehensive API client (`lib/strapi.ts`) that handles:

- Authentication (login, register, logout)
- User management (CRUD operations)
- Course management (CRUD operations)
- Order processing
- Review management
- Certificate generation
- Progress tracking
- Analytics data
- File uploads

## Authentication & Authorization

The platform implements role-based access control with three main roles:

1. **Student**: Can browse courses, enroll, track progress, leave reviews
2. **Instructor**: Can create and manage courses, view analytics
3. **Admin**: Full platform access including user management, analytics, settings

## Deployment

### Frontend Deployment
The frontend can be deployed to platforms like Vercel, Netlify, or any hosting service that supports Next.js.

### Backend Deployment
Strapi can be deployed to platforms like Railway, Heroku, DigitalOcean, or any VPS with Node.js support.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.