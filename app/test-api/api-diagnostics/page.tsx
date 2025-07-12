'use client';

import { useState } from 'react';
import { testCoursePopulateStrategies, testDirectAPICall } from '@/lib/api-diagnostics';

export default function ApiTestPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [courseId, setCourseId] = useState('k1og1nzsxax7omrcxm9vrcxz');

  const runTests = async () => {
    setLoading(true);
    try {
      console.log('🚀 Starting API tests...');
      
      // Test populate strategies
      const populateResults = await testCoursePopulateStrategies(courseId);
      
      // Test direct API calls
      await testDirectAPICall(courseId);
      
      setResults(populateResults);
    } catch (error) {
      console.error('❌ Test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">API Diagnostics</h1>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Course ID to test:
        </label>
        <input
          type="text"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 w-full max-w-md"
          placeholder="Enter course ID or documentId"
        />
      </div>

      <button
        onClick={runTests}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Running Tests...' : 'Run API Tests'}
      </button>

      {results && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <div className="space-y-4">
            {results.map((result: any, index: number) => (
              <div
                key={index}
                className={`p-4 border rounded ${
                  result.success ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
                }`}
              >
                <h3 className="font-medium">{result.strategy}</h3>
                {result.success ? (
                  <div className="mt-2 text-sm">
                    <p>✅ Success</p>
                    <p>Instructor: {result.hasInstructor ? '✅' : '❌'}</p>
                    <p>Category: {result.hasCategory ? '✅' : '❌'}</p>
                    <p>Lessons: {result.hasLessons ? '✅' : '❌'}</p>
                    <p>Tags: {result.hasTags ? '✅' : '❌'}</p>
                    <p>Thumbnail: {result.hasThumbnail ? '✅' : '❌'}</p>
                    <details className="mt-2">
                      <summary className="cursor-pointer">Available keys</summary>
                      <p className="text-xs mt-1">{result.dataKeys.join(', ')}</p>
                    </details>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-red-600">❌ Error: {result.error}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-50 rounded">
        <h3 className="font-medium mb-2">Instructions:</h3>
        <ol className="text-sm space-y-1">
          <li>1. Enter a course ID in the input above</li>
          <li>2. Click "Run API Tests" to test different populate strategies</li>
          <li>3. Check the browser console for detailed logs</li>
          <li>4. The results will show which populate strategy works best</li>
        </ol>
      </div>
    </div>
  );
}
