'use client';

import { useState } from 'react';
import courseService from '@/lib/course-service';

export default function DebugApiPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [courseId, setCourseId] = useState('b6xk06dnvf3q5gv1hxa07zmo');

  const testCourseAPI = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testing course API...');
      const course = await courseService.getCourseById(courseId);
      console.log('✅ Course data received:', course);
      setResult(course);
    } catch (error) {
      console.error('❌ Course API failed:', error);
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Course API Debug</h1>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Course ID:
        </label>
        <input
          type="text"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 w-full max-w-md"
          placeholder="Enter course ID"
        />
      </div>

      <button
        onClick={testCourseAPI}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Course API'}
      </button>

      {result && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Result</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
