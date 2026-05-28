import { useState, useEffect } from 'react';

/**
 * A custom hook to enforce a minimum loading time.
 * This prevents loading spinners from flashing on the screen 
 * if the network request resolves extremely fast.
 * 
 * @param {boolean} isLoading - The actual loading state from your data fetcher
 * @param {number} minDelay - Minimum time in milliseconds to show the loader
 * @returns {boolean} - The effective loading state to use in your component
 */
export const useMinLoadingTime = (isLoading, minDelay = 500) => {
  const [showLoader, setShowLoader] = useState(isLoading);

  useEffect(() => {
    let timeoutId;

    if (isLoading) {
      setShowLoader(true);
    } else {
      timeoutId = setTimeout(() => {
        setShowLoader(false);
      }, minDelay);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isLoading, minDelay]);

  return isLoading || showLoader;
};
