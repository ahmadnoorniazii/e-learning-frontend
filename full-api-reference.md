# E-Learning API Reference Guide

This document provides a comprehensive reference for all API endpoints in the E-Learning platform, covering the entire student journey from enrollment to certificate.

## Table of Contents
1. [Course Enrollment](#course-enrollment)
2. [Lesson Progress Tracking](#lesson-progress-tracking)
3. [Course Reviews](#course-reviews)
4. [Certificates](#certificates)
5. [Authentication](#authentication)
6. [Common Errors](#common-errors)

---

## Course Enrollment

### Available Fields in Enrollment Schema

| Field Name | Type | Description | Required | Default |
|------------|------|-------------|----------|---------|
| `student` | relation | User ID of the student | Yes | - |
| `course` | relation | Course ID | Yes | - |
| `enrollmentDate` | datetime | When the student enrolled | No | Current date |
| `completionDate` | datetime | When the course was completed | No | null |
| `progress` | decimal | Progress percentage (0-100) | No | 0 |
| `isCompleted` | boolean | Whether the course is completed | No | false |
| `certificateIssued` | boolean | Whether a certificate was issued | No | false |
| `paymentStatus` | enum | One of: "pending", "completed", "failed", "refunded" | No | "pending" |
| `paymentAmount` | decimal | Amount paid for the course | No | 0 |
| `lessonProgress` | relation | Related lesson progress records | No | [] |

### API Endpoints

#### 1. Create a new enrollment

```
POST http://localhost:1337/api/enrollments
```

**Request Body:**
```json
{
  "data": {
    "student": "10",  // User ID of the student
    "course": "20",   // Course ID
    "enrollmentDate": "2025-07-10T13:34:15.607Z",
    "progress": 0,
    "isCompleted": false,
    "paymentStatus": "completed",
    "paymentAmount": 99.99
  }
}
```

**Response (201 Created):**
```json
{
  "data": {
    "id": 1,
    "attributes": {
      "student": { "data": { "id": 10 } },
      "course": { "data": { "id": 20 } },
      "enrollmentDate": "2025-07-10T13:34:15.607Z",
      "progress": 0,
      "isCompleted": false,
      "paymentStatus": "completed",
      "paymentAmount": 99.99,
      "createdAt": "2025-07-10T13:34:15.607Z",
      "updatedAt": "2025-07-10T13:34:15.607Z"
    }
  },
  "meta": {}
}
```

#### 2. Get all enrollments

```
GET http://localhost:1337/api/enrollments
```

Optional query parameters:
- `populate=*` - Include all relations
- `filters[student][id][$eq]=10` - Filter by student ID
- `filters[course][id][$eq]=20` - Filter by course ID
- `filters[isCompleted][$eq]=true` - Filter by completion status
- `sort=enrollmentDate:desc` - Sort by enrollment date (descending)

#### 3. Get a specific enrollment

```
GET http://localhost:1337/api/enrollments/1
```

Optional query parameters:
- `populate=*` - Include all relations
- `populate=student,course` - Include specific relations

#### 4. Update an enrollment

```
PUT http://localhost:1337/api/enrollments/1
```

**Request Body:**
```json
{
  "data": {
    "progress": 75,
    "isCompleted": false
  }
}
```

#### 5. Mark an enrollment as completed

```
PUT http://localhost:1337/api/enrollments/1
```

**Request Body:**
```json
{
  "data": {
    "progress": 100,
    "isCompleted": true,
    "completionDate": "2025-07-15T13:34:15.607Z",
    "certificateIssued": true
  }
}
```

#### 6. Delete an enrollment

```
DELETE http://localhost:1337/api/enrollments/1
```

---

## Lesson Progress Tracking

### Available Fields in Lesson Progress Schema

| Field Name | Type | Description | Required | Default |
|------------|------|-------------|----------|---------|
| `student` | relation | User ID of the student | Yes | - |
| `lesson` | relation | Lesson ID | Yes | - |
| `enrollment` | relation | Enrollment ID | Yes | - |
| `isCompleted` | boolean | Whether the lesson is completed | No | false |
| `completionDate` | datetime | When the lesson was completed | No | null |
| `timeSpent` | integer | Time spent in minutes | No | null |
| `progressPercentage` | decimal | Progress percentage (0-100) | No | 0 |
| `lastAccessedAt` | datetime | When the lesson was last accessed | No | null |
| `notes` | text | Student notes for the lesson | No | null |

### API Endpoints

#### 1. Create new lesson progress

```
POST http://localhost:1337/api/lesson-progresses
```

**Request Body:**
```json
{
  "data": {
    "student": "10",  // User ID of the student
    "lesson": "5",    // Lesson ID
    "enrollment": "1", // Enrollment ID
    "progressPercentage": 25,
    "isCompleted": false,
    "lastAccessedAt": "2025-07-10T13:37:55.559Z",
    "timeSpent": 15
  }
}
```

**Response (201 Created):**
```json
{
  "data": {
    "id": 1,
    "attributes": {
      "student": { "data": { "id": 10 } },
      "lesson": { "data": { "id": 5 } },
      "enrollment": { "data": { "id": 1 } },
      "progressPercentage": 25,
      "isCompleted": false,
      "lastAccessedAt": "2025-07-10T13:37:55.559Z",
      "timeSpent": 15,
      "createdAt": "2025-07-10T13:37:55.559Z",
      "updatedAt": "2025-07-10T13:37:55.559Z"
    }
  },
  "meta": {}
}
```

#### 2. Get all lesson progress records

```
GET http://localhost:1337/api/lesson-progresses
```

Optional query parameters:
- `populate=*` - Include all relations
- `filters[student][id][$eq]=10` - Filter by student ID
- `filters[lesson][id][$eq]=5` - Filter by lesson ID
- `filters[enrollment][id][$eq]=1` - Filter by enrollment ID
- `filters[isCompleted][$eq]=true` - Filter by completion status
- `sort=lastAccessedAt:desc` - Sort by last accessed date (descending)

#### 3. Get a specific lesson progress

```
GET http://localhost:1337/api/lesson-progresses/1
```

Optional query parameters:
- `populate=*` - Include all relations
- `populate=student,lesson,enrollment` - Include specific relations

#### 4. Update lesson progress

```
PUT http://localhost:1337/api/lesson-progresses/1
```

**Request Body:**
```json
{
  "data": {
    "progressPercentage": 75,
    "timeSpent": 45,
    "lastAccessedAt": "2025-07-11T10:25:30.000Z"
  }
}
```

#### 5. Mark a lesson as completed

```
PUT http://localhost:1337/api/lesson-progresses/1
```

**Request Body:**
```json
{
  "data": {
    "progressPercentage": 100,
    "isCompleted": true,
    "completionDate": "2025-07-11T10:25:30.000Z"
  }
}
```

#### 6. Delete lesson progress

```
DELETE http://localhost:1337/api/lesson-progresses/1
```

---

## Course Reviews

### Available Fields in Course Review Schema

| Field Name | Type | Description | Required | Default |
|------------|------|-------------|----------|---------|
| `student` | relation | User ID of the student | Yes | - |
| `course` | relation | Course ID | Yes | - |
| `rating` | integer | Rating (1-5) | Yes | - |
| `title` | string | Review title | Yes | - |
| `comment` | text | Review comment | Yes | - |
| `isPublic` | boolean | Whether the review is public | No | true |
| `helpfulCount` | integer | Number of helpful votes | No | 0 |

### API Endpoints

#### 1. Create a new course review

```
POST http://localhost:1337/api/course-reviews
```

**Request Body:**
```json
{
  "data": {
    "student": "10",  // User ID of the student
    "course": "20",   // Course ID
    "rating": 5,
    "title": "Excellent Course!",
    "comment": "This course exceeded my expectations. The content is well-structured and the instructor explains everything clearly.",
    "isPublic": true
  }
}
```

**Response (201 Created):**
```json
{
  "data": {
    "id": 1,
    "attributes": {
      "student": { "data": { "id": 10 } },
      "course": { "data": { "id": 20 } },
      "rating": 5,
      "title": "Excellent Course!",
      "comment": "This course exceeded my expectations. The content is well-structured and the instructor explains everything clearly.",
      "isPublic": true,
      "helpfulCount": 0,
      "createdAt": "2025-07-10T13:37:55.559Z",
      "updatedAt": "2025-07-10T13:37:55.559Z"
    }
  },
  "meta": {}
}
```

#### 2. Get all course reviews

```
GET http://localhost:1337/api/course-reviews
```

Optional query parameters:
- `populate=*` - Include all relations
- `filters[course][id][$eq]=20` - Filter by course ID
- `filters[student][id][$eq]=10` - Filter by student ID
- `filters[rating][$gte]=4` - Filter by rating (greater than or equal to 4)
- `filters[isPublic][$eq]=true` - Filter by public status
- `sort=createdAt:desc` - Sort by creation date (descending)

#### 3. Get a specific course review

```
GET http://localhost:1337/api/course-reviews/1
```

Optional query parameters:
- `populate=*` - Include all relations
- `populate=student,course` - Include specific relations

#### 4. Update a course review

```
PUT http://localhost:1337/api/course-reviews/1
```

**Request Body:**
```json
{
  "data": {
    "rating": 4,
    "title": "Very Good Course",
    "comment": "I've updated my review after completing more lessons. It's a very good course but could use more practical examples."
  }
}
```

#### 5. Increment helpful count

```
PUT http://localhost:1337/api/course-reviews/1
```

**Request Body:**
```json
{
  "data": {
    "helpfulCount": 13  // Increment from current value
  }
}
```

#### 6. Delete a course review

```
DELETE http://localhost:1337/api/course-reviews/1
```

---

## Certificates

### Available Fields in Certificate Schema

| Field Name | Type | Description | Required | Default |
|------------|------|-------------|----------|---------|
| `student` | relation | User ID of the student | Yes | - |
| `course` | relation | Course ID | Yes | - |
| `enrollment` | relation | Enrollment ID | Yes | - |
| `certificateId` | string | Unique certificate ID | Yes | - |
| `verificationCode` | string | Unique verification code | Yes | - |
| `issuedDate` | datetime | When the certificate was issued | Yes | - |
| `certificateUrl` | string | URL to the certificate PDF | No | null |
| `isValid` | boolean | Whether the certificate is valid | No | true |

### API Endpoints

#### 1. Create a new certificate

```
POST http://localhost:1337/api/certificates
```

**Request Body:**
```json
{
  "data": {
    "student": "10",  // User ID of the student
    "course": "20",   // Course ID
    "enrollment": "1", // Enrollment ID
    "certificateId": "CERT-202507-ABC123",
    "verificationCode": "VER-XYZ789",
    "issuedDate": "2025-07-15T14:30:00.000Z",
    "certificateUrl": "https://certificates.elearning.com/CERT-202507-ABC123.pdf",
    "isValid": true
  }
}
```

**Response (201 Created):**
```json
{
  "data": {
    "id": 1,
    "attributes": {
      "student": { "data": { "id": 10 } },
      "course": { "data": { "id": 20 } },
      "enrollment": { "data": { "id": 1 } },
      "certificateId": "CERT-202507-ABC123",
      "verificationCode": "VER-XYZ789",
      "issuedDate": "2025-07-15T14:30:00.000Z",
      "certificateUrl": "https://certificates.elearning.com/CERT-202507-ABC123.pdf",
      "isValid": true,
      "createdAt": "2025-07-15T14:30:00.000Z",
      "updatedAt": "2025-07-15T14:30:00.000Z"
    }
  },
  "meta": {}
}
```

#### 2. Get all certificates

```
GET http://localhost:1337/api/certificates
```

Optional query parameters:
- `populate=*` - Include all relations
- `filters[student][id][$eq]=10` - Filter by student ID
- `filters[course][id][$eq]=20` - Filter by course ID
- `filters[enrollment][id][$eq]=1` - Filter by enrollment ID
- `filters[isValid][$eq]=true` - Filter by validity status
- `sort=issuedDate:desc` - Sort by issue date (descending)

#### 3. Get a specific certificate

```
GET http://localhost:1337/api/certificates/1
```

Optional query parameters:
- `populate=*` - Include all relations
- `populate=student,course,enrollment` - Include specific relations

#### 4. Get a certificate by certificate ID

```
GET http://localhost:1337/api/certificates?filters[certificateId][$eq]=CERT-202507-ABC123
```

#### 5. Verify a certificate

```
GET http://localhost:1337/api/certificates?filters[certificateId][$eq]=CERT-202507-ABC123&filters[verificationCode][$eq]=VER-XYZ789
```

#### 6. Update a certificate

```
PUT http://localhost:1337/api/certificates/1
```

**Request Body:**
```json
{
  "data": {
    "certificateUrl": "https://certificates.elearning.com/updated/CERT-202507-ABC123.pdf",
    "isValid": true
  }
}
```

#### 7. Invalidate a certificate

```
PUT http://localhost:1337/api/certificates/1
```

**Request Body:**
```json
{
  "data": {
    "isValid": false
  }
}
```

#### 8. Delete a certificate

```
DELETE http://localhost:1337/api/certificates/1
```

---

## Authentication

All API endpoints require either:
- Public permissions for anonymous access
- Authentication token for user-specific operations

### Authentication Headers

Include this header with all authenticated requests:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Example with Authentication

```bash
curl 'http://localhost:1337/api/enrollments' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Content-Type: application/json' \
  --data-raw '{"data":{"student":"10","course":"20","enrollmentDate":"2025-07-10T13:34:15.607Z","paymentStatus":"completed"}}'
```

---

## Common Errors

### Enrollment Errors
1. `Invalid key enrolledAt`: Using incorrect field name. Use `enrollmentDate` instead.
2. `Invalid key status`: No `status` field exists. Use `paymentStatus` with valid enum values.
3. `Student ID is required`: Missing or invalid student ID.
4. `Course ID is required`: Missing or invalid course ID.

### Lesson Progress Errors
1. `Missing required field: student`: Student ID is required.
2. `Missing required field: lesson`: Lesson ID is required.
3. `Missing required field: enrollment`: Enrollment ID is required.
4. `Invalid value for progressPercentage`: Must be between 0 and 100.

### Course Review Errors
1. `Missing required field: rating`: Rating is required.
2. `Invalid value for rating`: Rating must be between 1 and 5.
3. `Missing required field: title`: Title is required.
4. `Missing required field: comment`: Comment is required.

### Certificate Errors
1. `Missing required field: certificateId`: Certificate ID is required.
2. `Missing required field: verificationCode`: Verification code is required.
3. `Missing required field: issuedDate`: Issue date is required.
4. `Certificate ID already exists`: Certificate ID must be unique.
5. `Verification code already exists`: Verification code must be unique.

---

## Complete Learning Workflow

1. **Enroll in a course**
   - Create enrollment record
   - Set payment status

2. **Track lesson progress**
   - Create/update lesson progress for each lesson
   - Update time spent and progress percentage
   - Mark lessons as completed

3. **Update course progress**
   - Update overall progress on enrollment
   - Mark course as completed when all lessons are done

4. **Leave a review**
   - Create course review with rating and comments

5. **Generate certificate**
   - Create certificate record
   - Update enrollment to set certificateIssued to true

---

*Last updated: July 10, 2025*
