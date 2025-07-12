"use client";

import { useState } from 'react';
import Image from 'next/image';
import { BookOpen } from 'lucide-react';

interface CourseImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  width?: number;
  height?: number;
}

export function CourseImage({ 
  src, 
  alt, 
  className = "w-full h-48 object-cover", 
  fallbackClassName = "w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center",
  width = 400,
  height = 192 
}: CourseImageProps) {
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);

  // If no src provided or error occurred, show fallback
  if (!src || imageError) {
    return (
      <div className={fallbackClassName}>
        <BookOpen className="h-16 w-16 text-white opacity-80" />
      </div>
    );
  }

  const handleError = () => {
    console.log('❌ Course image failed to load:', src);
    setImageError(true);
    setLoading(false);
  };

  const handleLoad = () => {
    console.log('✅ Course image loaded successfully:', src);
    setLoading(false);
  };

  // Check if it's a .bin file from Strapi (which has MIME type issues)
  const isBinFile = src.includes('.bin');

  return (
    <div className="relative w-full h-48">
      {loading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      )}
      
      {isBinFile ? (
        // Use regular img tag for .bin files due to MIME type issues
        <img
          src={src}
          alt={alt}
          className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onError={handleError}
          onLoad={handleLoad}
        />
      ) : (
        // Use Next.js Image for proper image files
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onError={handleError}
          onLoad={handleLoad}
          unoptimized
        />
      )}
    </div>
  );
}
