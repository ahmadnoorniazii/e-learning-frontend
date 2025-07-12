"use client";

import { useState } from 'react';
import Image from 'next/image';

interface ImageTestProps {
  src: string;
  alt: string;
  className?: string;
}

export function ImageTest({ src, alt, className }: ImageTestProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleLoad = () => {
    console.log('✅ Image loaded successfully:', src);
    setLoading(false);
  };

  const handleError = () => {
    console.error('❌ Image failed to load:', src);
    setError(true);
    setLoading(false);
  };

  if (error) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-500 text-sm">Failed to load image</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {loading && (
        <div className={`bg-gray-100 animate-pulse ${className}`}>
          <div className="flex items-center justify-center h-full">
            <span className="text-gray-400 text-sm">Loading...</span>
          </div>
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        width={400}
        height={300}
        className={className}
        onLoad={handleLoad}
        onError={handleError}
        unoptimized
        style={{ display: loading ? 'none' : 'block' }}
      />
    </div>
  );
}
