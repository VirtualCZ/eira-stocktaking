import { useState, useEffect } from 'react';

export function usePageState(pageKey, initialState = {}) {
  const [state, setState] = useState(() => {
    // Try to load from localStorage on initial render
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`pageState_${pageKey}`);
      if (saved) {
        try {
          return { ...initialState, ...JSON.parse(saved) };
        } catch (e) {
          console.warn('Failed to parse saved state:', e);
        }
      }
    }
    return initialState;
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`pageState_${pageKey}`, JSON.stringify(state));
    }
  }, [pageKey, state]);

  const updateState = (updates) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const resetState = () => {
    setState(initialState);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`pageState_${pageKey}`);
    }
  };

  return [state, updateState, resetState];
}
