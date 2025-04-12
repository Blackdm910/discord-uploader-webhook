'use client';

import Image from 'next/image';
import useOrientation from '@/hooks/useOrientation';

export default function OrientationImage() {
  const isLandscape = useOrientation();

  const imageSrc = isLandscape
    ? '/images/bg-landscape.jpg'
    : '/images/bg-portrait.jpg';

  return (
    <Image
      src={imageSrc}
      alt="Responsive Background"
      fill
      priority
      style={{
        objectFit: 'cover',
        zIndex: -1,
      }}
    />
  );
}