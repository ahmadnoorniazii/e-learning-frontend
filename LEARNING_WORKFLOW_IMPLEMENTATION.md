# Learning Workflow Implementation

## Overview

The learning page has been completely refactored to use custom hooks with clear step-by-step processes for the complete learning journey from enrollment to certificate generation.

## Architecture

### 1. Main Learning Workflow Hook (`useLearningWorkflow`)

This is the core hook that manages the entire learning process:

#### **State Management:**
- `course`: Course information
- `enrollment`: Enrollment data
- `lessons`: Array of lessons
- `lessonProgresses`: Progress for each lesson
- `reviews`: Course reviews
- `certificate`: Generated certificate (if any)
- `hasUserReviewed`: Boolean flag for review status
- `loading`, `error`: UI state
- `completedLessons`, `totalLessons`, `overallProgress`: Calculated progress stats

#### **Step-by-Step Process:**

**STEP 1: Initialize Learning Environment**
```typescript
initializeLearning(courseId: string) -> Promise<boolean>
```
1.1. Fetch course details
1.2. Verify enrollment status
1.3. Extract and process lessons
1.4. Get existing lesson progress
1.5. Create placeholder progress for missing lessons
1.6. Fetch reviews and certificate status
1.7. Calculate initial progress stats

**STEP 2: Track Lesson Progress**
```typescript
trackLessonProgress(lessonId, timeSpent, progressPercentage) -> Promise<LessonProgress>
markLessonCompleted(lessonId) -> Promise<boolean>
```
- Updates lesson progress in real-time
- Handles both creation and updates
- Automatically calculates course completion

**STEP 3: Update Course Progress**
```typescript
updateCourseProgress() -> Promise<Enrollment>
```
- Recalculates overall course progress
- Marks course as completed when all lessons are done
- Updates enrollment status

**STEP 4: Submit Review**
```typescript
submitReview(rating, title, comment) -> Promise<CourseReview>
```
- Allows students to leave course reviews
- Updates review state
- Prevents duplicate reviews

**STEP 5: Generate Certificate**
```typescript
generateCertificate() -> Promise<Certificate>
```
- Generates completion certificate
- Only available for completed courses
- Creates downloadable certificate

### 2. Lesson Navigation Hook (`useLessonNavigation`)

Manages lesson-to-lesson navigation and video progress:

#### **State:**
- `currentLesson`: Currently active lesson
- `currentLessonIndex`: Index in lessons array
- `currentTime`, `totalTime`: Video playback times
- `lastProgressUpdate`: Timestamp for auto-progress updates

#### **Actions:**
- `setCurrentLesson(lesson, index)`: Switch to specific lesson
- `goToNextLesson()`: Navigate to next lesson
- `goToPreviousLesson()`: Navigate to previous lesson
- `setCurrentTime/TotalTime()`: Video progress tracking
- `resetProgress()`: Reset video times

### 3. Review Dialog Hook (`useReviewDialog`)

Manages the review submission dialog:

#### **State:**
- `showReviewDialog`: Dialog visibility
- `reviewData`: { rating, title, comment }

#### **Actions:**
- `openReviewDialog()`, `closeReviewDialog()`: Dialog controls
- `updateReviewData(data)`: Update review form data
- `resetReviewData()`: Clear form
- `isReviewValid()`: Validate form completeness

### 4. Certificate Dialog Hook (`useCertificateDialog`)

Manages the certificate dialog:

#### **State:**
- `showCertificateDialog`: Dialog visibility

#### **Actions:**
- `openCertificateDialog()`, `closeCertificateDialog()`: Dialog controls
- `downloadCertificate()`: Trigger certificate download

## Learning Flow Process

### Enrollment to Certificate Journey:

1. **Course Access** → User navigates to `/courses/[id]/learn`
2. **Authentication Check** → Redirect to login if not authenticated
3. **Initialize Learning** → STEP 1: Load all course data and progress
4. **Lesson Navigation** → Students can navigate between lessons
5. **Progress Tracking** → STEP 2: Auto-track video progress and manual completion
6. **Course Progress** → STEP 3: Calculate and update overall progress
7. **Course Completion** → Automatic detection when all lessons completed
8. **Review Submission** → STEP 4: Optional review after course completion
9. **Certificate Generation** → STEP 5: Generate and download certificate

## Key Features

### ✅ **Comprehensive Progress Tracking**
- Individual lesson progress (time spent, percentage, completion status)
- Overall course progress calculation
- Automatic progress updates during video playback
- Manual lesson completion marking

### ✅ **Robust Error Handling**
- Clear error messages for each step
- Graceful fallbacks for missing data
- Detailed console logging for debugging

### ✅ **Real-time Updates**
- Progress updates immediately reflected in UI
- Automatic course completion detection
- Dynamic lesson completion states

### ✅ **Step-by-Step Process**
- Each action follows a clear workflow
- Comprehensive logging for each step
- Easy to debug and maintain

### ✅ **Responsive Design**
- Clean separation of concerns
- Reusable hooks
- Type-safe implementation

## API Integration

The hooks integrate with the fixed `course-service.ts` which handles:
- Lesson progress CRUD operations
- Course completion workflows
- Review management
- Certificate generation
- Proper ID handling (numeric vs document IDs)

## Usage Example

```typescript
export default function LearningPage({ params }: { params: { id: string } }) {
  // Main learning workflow
  const [learningState, learningActions] = useLearningWorkflow();
  
  // Lesson navigation
  const [navState, navActions] = useLessonNavigation(
    learningState.lessons, 
    learningActions.findCurrentLessonIndex()
  );
  
  // Initialize learning environment
  useEffect(() => {
    const initializeAsync = async () => {
      const success = await learningActions.initializeLearning(params.id);
      // Handle success/error...
    };
    initializeAsync();
  }, [params.id]);

  // ... rest of component
}
```

## Benefits

1. **Clear Separation of Concerns**: Each hook has a specific responsibility
2. **Easy Testing**: Hooks can be tested independently
3. **Reusability**: Hooks can be used in other components
4. **Type Safety**: Full TypeScript support
5. **Debugging**: Comprehensive logging at each step
6. **Maintainability**: Clear structure and documentation
7. **Performance**: Optimized state updates and API calls

## Console Output

The implementation provides detailed console logging:

```
🎯 STEP 1: Initializing learning environment for course: xyz
📚 Step 1.1: Fetching course details
✅ Course fetched: { id: 1, title: "Course Name" }
🎫 Step 1.2: Checking enrollment status
✅ Enrollment verified: { id: 123, progress: 45 }
... and so on for each step
```

This makes debugging much easier and provides clear visibility into the learning workflow process.
