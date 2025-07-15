"use client";

import { useParams } from 'next/navigation';

export default function TestLessonProgressPage() {
  const { id } = useParams();
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Test Lesson Progress</h1>
      <p>Testing lesson progress for ID: {id}</p>
    </div>
  );
} 