"use client";

import React, { useEffect, useRef } from 'react';
import type { VideoHTMLAttributes } from 'react';

type SmartVideoProps = Omit<VideoHTMLAttributes<HTMLVideoElement>, 'src'> & {
  // Provide a base like "/videos/pan-animation" to auto-derive
  // webm: "${base}.webm" and mp4: "${base}.mp4"
  base?: string;
  // Or explicitly pass sources when filenames differ, e.g.,
  // webmSrc="pan-animation-vp9-chrome.webm" mp4Src="pan-animation-hevc-safari.mp4"
  webmSrc?: string;
  mp4Src?: string;
};

function isSafariBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent.toLowerCase();
  const isSafari = ua.indexOf('safari') !== -1 && ua.indexOf('chrome') === -1 && ua.indexOf('version/') !== -1;
  return isSafari;
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
  children,
  ...videoProps
}: SmartVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const derivedWebm = webmSrc ?? (base ? `${base}.webm` : undefined);
  const derivedMp4 = mp4Src ?? (base ? `${base}.mp4` : undefined);

  useEffect(() => {
    const element = videoRef.current;
    if (!element) return;

    // Set data attributes similar to the provided snippet
    if (derivedWebm) element.setAttribute('data-webm', derivedWebm);
    if (derivedMp4) element.setAttribute('data-mov', derivedMp4);

    // Decide which source to use (Safari prefers mp4/HEVC)
    const preferMp4 = isSafariBrowser();
    const chosenSrc = preferMp4 ? (derivedMp4 ?? derivedWebm) : (derivedWebm ?? derivedMp4);

    if (chosenSrc) {
      // Update src, then try to play
      if (element.src !== chosenSrc) {
        element.src = chosenSrc;
        try {
          // Ensure the new source is loaded
          element.load();
        } catch {}
      }

      // Delay play slightly to mirror snippet behavior and improve reliability
      const playTimer = window.setTimeout(() => {
        element
          .play()
          .catch(() => {
            // Ignore autoplay errors (e.g., when muted=false)
          });
      }, 100);

      return () => window.clearTimeout(playTimer);
    }
  }, [derivedWebm, derivedMp4]);

  return (
    <video
      ref={videoRef}
      className={className}
      autoPlay={autoPlay}
      muted={muted}
      loop={loop}
      playsInline={playsInline}
      preload={preload}
      {...videoProps}
    >
      {children ?? <p>Your browser does not support the video tag.</p>}
    </video>
  );
}