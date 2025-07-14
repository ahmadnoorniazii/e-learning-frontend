import { useState, useCallback, useEffect } from 'react';
import { Lesson } from '@/lib/api-client';

export interface LessonNavigationState {
  currentLesson: Lesson | null;
  currentLessonIndex: number;
  currentTime: number;
  totalTime: number;
  lastProgressUpdate: number;
}

export interface LessonNavigationActions {
  setCurrentLesson: (lesson: Lesson, index: number) => void;
  goToNextLesson: () => void;
  goToPreviousLesson: () => void;
  setCurrentTime: (time: number) => void;
  setTotalTime: (time: number) => void;
  setLastProgressUpdate: (time: number) => void;
  resetProgress: () => void;
}

export function useLessonNavigation(lessons: Lesson[], initialIndex: number = 0): [LessonNavigationState, LessonNavigationActions] {
  const [state, setState] = useState<LessonNavigationState>({
    currentLesson: lessons[initialIndex] || null,
    currentLessonIndex: initialIndex,
    currentTime: 0,
    totalTime: 0,
    lastProgressUpdate: 0,
  });

  // Update state when lessons array changes
  useEffect(() => {
    console.log('📚 Lessons array updated, length:', lessons.length);
    if (lessons.length > 0 && !state.currentLesson) {
      console.log('🎯 Setting initial lesson since none is selected');
      const safeIndex = Math.min(initialIndex, lessons.length - 1);
      setState(prev => ({
        ...prev,
        currentLesson: lessons[safeIndex],
        currentLessonIndex: safeIndex,
      }));
    }
  }, [lessons, initialIndex, state.currentLesson]);

  const setCurrentLesson = useCallback((lesson: Lesson, index: number) => {
    console.log('🎯 setCurrentLesson called:', { lesson: lesson.title, index, lessonId: lesson.id });
    setState(prev => {
      console.log('📊 Navigation state update:', {
        oldLesson: prev.currentLesson?.title,
        oldIndex: prev.currentLessonIndex,
        newLesson: lesson.title,
        newIndex: index
      });
      return {
        ...prev,
        currentLesson: lesson,
        currentLessonIndex: index,
        currentTime: 0,
        totalTime: 0,
        lastProgressUpdate: 0,
      };
    });
  }, []);

  const goToNextLesson = useCallback(() => {
    console.log('➡️ goToNextLesson called, current index:', state.currentLessonIndex, 'max:', lessons.length - 1);
    if (state.currentLessonIndex < lessons.length - 1) {
      const nextIndex = state.currentLessonIndex + 1;
      console.log('➡️ Moving to next lesson at index:', nextIndex, 'lesson:', lessons[nextIndex]?.title);
      setCurrentLesson(lessons[nextIndex], nextIndex);
    } else {
      console.log('➡️ Already at last lesson');
    }
  }, [state.currentLessonIndex, lessons, setCurrentLesson]);

  const goToPreviousLesson = useCallback(() => {
    console.log('⬅️ goToPreviousLesson called, current index:', state.currentLessonIndex);
    if (state.currentLessonIndex > 0) {
      const prevIndex = state.currentLessonIndex - 1;
      console.log('⬅️ Moving to previous lesson at index:', prevIndex, 'lesson:', lessons[prevIndex]?.title);
      setCurrentLesson(lessons[prevIndex], prevIndex);
    } else {
      console.log('⬅️ Already at first lesson');
    }
  }, [state.currentLessonIndex, lessons, setCurrentLesson]);

  const setCurrentTime = useCallback((time: number) => {
    setState(prev => ({ ...prev, currentTime: time }));
  }, []);

  const setTotalTime = useCallback((time: number) => {
    setState(prev => ({ ...prev, totalTime: time }));
  }, []);

  const setLastProgressUpdate = useCallback((time: number) => {
    setState(prev => ({ ...prev, lastProgressUpdate: time }));
  }, []);

  const resetProgress = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentTime: 0,
      totalTime: 0,
      lastProgressUpdate: 0,
    }));
  }, []);

  const actions: LessonNavigationActions = {
    setCurrentLesson,
    goToNextLesson,
    goToPreviousLesson,
    setCurrentTime,
    setTotalTime,
    setLastProgressUpdate,
    resetProgress,
  };

  return [state, actions];
}
