'use client';

import React, { useState } from 'react';
import { clsx } from 'clsx';
import { useLazyImage } from '@/hooks/usePerformance';

export interface LazyImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  placeholder?: string;
  fallback?: string;
  showPlaceholder?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  placeholder,
  fallback,
  showPlaceholder = true,
  onLoad,
  onError,
  className,
  alt = '',
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const { ref, src: imageSrc, isLoaded, isError } = useLazyImage(src, placeholder);

  const handleLoad = () => {
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Show fallback if there's an error and fallback is provided
  if ((isError || hasError) && fallback) {
    return (
      <img
        src={fallback}
        alt={alt}
        className={className}
        onLoad={handleLoad}
        {...props}
      />
    );
  }

  return (
    <div ref={ref} className={clsx('relative overflow-hidden', className)}>
      {/* Placeholder */}
      {showPlaceholder && !isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 bg-gray-300 rounded" />
        </div>
      )}

      {/* Actual image */}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={clsx(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      )}
    </div>
  );
};

export default LazyImage;