'use client';

import { useState, useEffect, useRef } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  onError?: () => void;
}

/** Local /public images load immediately; remote URLs lazy-load on scroll */
function isLocalImage(src: string): boolean {
  return src.startsWith('/');
}

export function LazyImage({ src, alt, className = '', onError }: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(
    isLocalImage(src) ? src : null
  );
  const [isInView, setIsInView] = useState(isLocalImage(src));
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHasError(false);
    if (isLocalImage(src)) {
      setIsInView(true);
      setImageSrc(src);
      return;
    }
    setIsInView(false);
    setImageSrc(null);
  }, [src]);

  useEffect(() => {
    if (isLocalImage(src) || !imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '100px', threshold: 0.01 }
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [src]);

  useEffect(() => {
    if (isInView && src && !hasError) {
      setImageSrc(src);
    }
  }, [isInView, src, hasError]);

  const handleError = () => {
    setHasError(true);
    setImageSrc(null);
    onError?.();
  };

  const showImage = imageSrc && !hasError;

  return (
    <div ref={imgRef} className='w-full h-full'>
      {showImage ? (
        <img
          src={imageSrc}
          alt={alt}
          className={className}
          onError={handleError}
          loading={isLocalImage(src) ? 'eager' : 'lazy'}
        />
      ) : (
        <div className='w-full h-full flex items-center justify-center bg-neutral-100 animate-pulse'>
          <span className='text-2xl font-serif text-neutral-300 opacity-40'>
            {alt.charAt(0)}
          </span>
        </div>
      )}
    </div>
  );
}
