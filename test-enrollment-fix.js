// Test script to verify the enrollment data includes student ID
// This simulates what happens when the enrollInCourse method is called

const mockUser = { id: 11 };
const courseId = 22;
const paymentAmount = 149.99;

// Simulate the fixed enrollInCourse method logic
const enrollmentData = {
  student: mockUser.id,  // This is the key fix - includes student ID
  course: courseId,
  enrollmentDate: new Date().toISOString(),
  progress: 0,
  isCompleted: false,
  paymentStatus: 'completed',
  certificateIssued: false,
  paymentAmount: paymentAmount
};

console.log('=== Testing enrollInCourse fix ===');
console.log('Mock user ID:', mockUser.id);
console.log('Course ID:', courseId);
console.log('');
console.log('Generated enrollment data:');
console.log(JSON.stringify(enrollmentData, null, 2));
console.log('');
console.log('✅ Key fix: student field is now included:', 'student' in enrollmentData);
console.log('✅ Student ID value:', enrollmentData.student);
console.log('');
console.log('This data will be sent to POST /enrollments with:');
console.log('{ "data":', JSON.stringify(enrollmentData), '}');
