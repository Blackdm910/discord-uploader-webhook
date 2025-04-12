'use client';

import { useState, useEffect } from 'react';

export default function useOrientation(): boolean {
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    const updateOrientation = () => {
      const orientation = window.screen.orientation?.type;
      
      if (orientation) {
        setIsLandscape(orientation.startsWith('landscape'));
      } else {
        // fallback buat browser yang belum support screen.orientation
        setIsLandscape(window.innerWidth > window.innerHeight);
      }
    };

    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    window.screen.orientation?.addEventListener?.('change', updateOrientation);

    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.screen.orientation?.removeEventListener?.('change', updateOrientation);
    };
  }, []);

  return isLandscape;
}