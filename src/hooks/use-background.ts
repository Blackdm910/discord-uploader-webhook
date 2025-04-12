'use client';

import { useEffect, useState } from 'react';

export const useBackground = () => {
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(null);

  const isFullUrl = (str: string) => /^https?:\/\//i.test(str);

  const detectOrientation = () => {
    const orientation = window.screen.orientation?.type || '';
    if (orientation) {
      return orientation.startsWith('landscape') ? 'landscape' : 'portrait';
    }
    return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
  };

  useEffect(() => {
    const updateBackground = () => {
      const orientation = detectOrientation();

      const localPortrait = process.env.NEXT_PUBLIC_BG_PORTRAIT_LOCAL || '';
      const urlPortrait = process.env.NEXT_PUBLIC_BG_PORTRAIT_URL || '';

      const localLandscape = process.env.NEXT_PUBLIC_BG_LANDSCAPE_LOCAL || '';
      const urlLandscape = process.env.NEXT_PUBLIC_BG_LANDSCAPE_URL || '';

      const image =
        orientation === 'landscape'
          ? localLandscape || urlLandscape
          : localPortrait || urlPortrait;

      const finalUrl = image ? `url(${image})` : null;

      setBackgroundImageUrl(finalUrl);

      if (finalUrl) {
        document.documentElement.style.setProperty('--bg-image-url', finalUrl);
      } else {
        document.documentElement.style.removeProperty('--bg-image-url');
      }
    };

    updateBackground();
    window.addEventListener('resize', updateBackground);
    window.screen.orientation?.addEventListener?.('change', updateBackground);

    return () => {
      window.removeEventListener('resize', updateBackground);
      window.screen.orientation?.removeEventListener?.('change', updateBackground);
    };
  }, []);

  const setBackground = (url: string | null) => {
    const formattedUrl = url ? `url(${url})` : null;
    setBackgroundImageUrl(formattedUrl);

    if (url) {
      document.documentElement.style.setProperty('--bg-image-url', formattedUrl);
    } else {
      document.documentElement.style.removeProperty('--bg-image-url');
    }
  };

  return {
    backgroundImageUrl,
    setBackground,
  };
};