"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import courseService from '@/lib/course-service';

export default function LessonProgressDebug() {
  const { user } = useAuth();
  const [debugData, setDebugData] = useState<any>(null);

  if (!debugData) {
    return <div>Loading debug data...</div>;
  }

  return (
    <div className="p-4 bg-gray-100 rounded">
      <h2 className="text-lg font-bold mb-4">Lesson Progress Debug</h2>
      <pre className="text-xs overflow-auto max-h-96 bg-white p-2 rounded">
        {JSON.stringify(debugData, null, 2)}
      </pre>
    </div>
  );
}
