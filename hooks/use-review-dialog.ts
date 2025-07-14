import { useState, useCallback } from 'react';

export interface ReviewDialogState {
  showReviewDialog: boolean;
  reviewData: {
    rating: number;
    title: string;
    comment: string;
  };
}

export interface ReviewDialogActions {
  openReviewDialog: () => void;
  closeReviewDialog: () => void;
  updateReviewData: (data: Partial<ReviewDialogState['reviewData']>) => void;
  resetReviewData: () => void;
  isReviewValid: () => boolean;
}

export function useReviewDialog(): [ReviewDialogState, ReviewDialogActions] {
  const [state, setState] = useState<ReviewDialogState>({
    showReviewDialog: false,
    reviewData: {
      rating: 5,
      title: '',
      comment: ''
    }
  });

  const openReviewDialog = useCallback(() => {
    setState(prev => ({ ...prev, showReviewDialog: true }));
  }, []);

  const closeReviewDialog = useCallback(() => {
    setState(prev => ({ ...prev, showReviewDialog: false }));
  }, []);

  const updateReviewData = useCallback((data: Partial<ReviewDialogState['reviewData']>) => {
    setState(prev => ({
      ...prev,
      reviewData: { ...prev.reviewData, ...data }
    }));
  }, []);

  const resetReviewData = useCallback(() => {
    setState(prev => ({
      ...prev,
      reviewData: { rating: 5, title: '', comment: '' }
    }));
  }, []);

  const isReviewValid = useCallback(() => {
    return state.reviewData.title.trim().length > 0 && state.reviewData.comment.trim().length > 0;
  }, [state.reviewData]);

  const actions: ReviewDialogActions = {
    openReviewDialog,
    closeReviewDialog,
    updateReviewData,
    resetReviewData,
    isReviewValid,
  };

  return [state, actions];
}
