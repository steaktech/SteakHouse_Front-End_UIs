"use client";

import React, { useEffect, useRef, useCallback, useState } from 'react';
import type { VideoHTMLAttributes } from 'react';

type SmartVideoProps = Omit<VideoHTMLAttributes<HTMLVideoElement>, 'src'> & {
  // Provide a base like "/videos/pan-animation" to auto-derive
  // webm: "${base}.webm" and mp4: "${base}.mp4"
  base?: string;
  // Or explicitly pass sources when filenames differ, e.g.,
  // webmSrc="pan-animation-vp9-chrome.webm" mp4Src="pan-animation-hevc-safari.mp4"
  webmSrc?: string;
  mp4Src?: string;
  // Whether to use intersection observer for lazy loading
  lazyLoad?: boolean;
};

// Global video cache to avoid loading the same video multiple times
const videoCache = new Map<string, HTMLVideoElement>();
const loadingPromises = new Map<string, Promise<HTMLVideoElement>>();

function isSafariBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent.toLowerCase();
  const isSafari = ua.indexOf('safari') !== -1 && ua.indexOf('chrome') === -1 && ua.indexOf('version/') !== -1;
  return isSafari;
}

// Function to create and cache a video element
function createCachedVideo(src: string): Promise<HTMLVideoElement> {
  // If already loading, return the existing promise
  if (loadingPromises.has(src)) {
    return loadingPromises.get(src)!;
  }

  // If already cached, return resolved promise
  if (videoCache.has(src)) {
    return Promise.resolve(videoCache.get(src)!.cloneNode(true) as HTMLVideoElement);
  }

  // Create new loading promise
  const loadingPromise = new Promise<HTMLVideoElement>((resolve, reject) => {
    const video = document.createElement('video');
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'metadata';
    
    const onLoadedData = () => {
      video.removeEventListener('loadeddata', onLoadedData);
      video.removeEventListener('error', onError);
      videoCache.set(src, video);
      loadingPromises.delete(src);
      resolve(video.cloneNode(true) as HTMLVideoElement);
    };

    const onError = () => {
      video.removeEventListener('loadeddata', onLoadedData);
      video.removeEventListener('error', onError);
      loadingPromises.delete(src);
      reject(new Error(`Failed to load video: ${src}`));
    };

    video.addEventListener('loadeddata', onLoadedData);
    video.addEventListener('error', onError);
    video.src = src;
    video.load();
  });

  loadingPromises.set(src, loadingPromise);
  return loadingPromise;
}

export default function SmartVideo({
  base,
  webmSrc,
  mp4Src,
  className,
  autoPlay = true,
  muted = true,
  loop = true,
  playsInline = true,
  preload = 'metadata',
  lazyLoad = true,
  children,
  ...videoProps
}: SmartVideoProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isVisible, setIsVisible] = useState(!lazyLoad);
  const [videoLoaded, setVideoLoaded] = useState(false);

  const derivedWebm = webmSrc ?? (base ? `${base}.webm` : undefined);
  const derivedMp4 = mp4Src ?? (base ? `${base}.mp4` : undefined);

  // Decide which source to use (Safari prefers mp4/HEVC)
  const preferMp4 = isSafariBrowser();
  const chosenSrc = preferMp4 ? (derivedMp4 ?? derivedWebm) : (derivedWebm ?? derivedMp4);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazyLoad || isVisible) return;

    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [lazyLoad, isVisible]);

  // Load and setup video when visible
  useEffect(() => {
    if (!isVisible || !chosenSrc || videoLoaded) return;

    createCachedVideo(chosenSrc)
      .then((cachedVideo) => {
        const currentVideo = videoRef.current;
        if (!currentVideo) return;

        // Copy attributes from cached video
        currentVideo.src = cachedVideo.src;
        currentVideo.muted = muted;
        currentVideo.loop = loop;
        currentVideo.playsInline = playsInline;
        if (typeof preload === 'string') {
          currentVideo.preload = preload as '' | 'metadata' | 'none' | 'auto';
        }

        // Set data attributes
        if (derivedWebm) currentVideo.setAttribute('data-webm', derivedWebm);
        if (derivedMp4) currentVideo.setAttribute('data-mov', derivedMp4);

        setVideoLoaded(true);

        // Auto play if enabled
        if (autoPlay) {
          const playTimer = window.setTimeout(() => {
            currentVideo.play().catch(() => {
              // Ignore autoplay errors (e.g., when muted=false)
            });
          }, 100);

          return () => window.clearTimeout(playTimer);
        }
      })
      .catch((error) => {
        console.warn('Failed to load video:', error);
      });
  }, [isVisible, chosenSrc, muted, loop, playsInline, preload, autoPlay, derivedWebm, derivedMp4, videoLoaded]);

  return (
    <div ref={containerRef} className="inline-block">
      <video
        ref={videoRef}
        className={className}
        muted={muted}
        loop={loop}
        playsInline={playsInline}
        preload={preload}
        {...videoProps}
        style={{ 
          ...videoProps.style,
          visibility: videoLoaded ? 'visible' : 'hidden'
        }}
      >
        {children ?? <p>Your browser does not support the video tag.</p>}
      </video>
    </div>
  );
}