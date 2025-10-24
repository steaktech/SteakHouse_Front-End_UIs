"use client";

import { useEffect, useState } from "react";

interface ChartAnimationProps {
  className?: string;
}

export default function ChartAnimation({ className = "" }: ChartAnimationProps) {
  const [videoSrc, setVideoSrc] = useState<string>("");
  const [isSafari, setIsSafari] = useState(false);

  useEffect(() => {
    // Detect Safari browser
    const userAgent = navigator.userAgent.toLowerCase();
    const safariDetected = userAgent.includes('safari') && !userAgent.includes('chrome');
    
    setIsSafari(safariDetected);
    
    // Set appropriate video source based on browser
    if (safariDetected) {
      setVideoSrc('/images/chart-animation-hevc-safari.mp4');
    } else {
      setVideoSrc('/images/chart-animation-vp9-chrome.webm');
    }
  }, []);

  if (!videoSrc) return null;

  return (
    <div className={`w-full flex justify-center ${className}`}>
      <video
        autoPlay
        loop
        muted
        playsInline
        className="max-w-full h-auto rounded-lg shadow-lg"
        style={{ maxHeight: '150px', maxWidth: '300px' }}
        key={videoSrc} // Force re-render when source changes
      >
        <source src={videoSrc} type={isSafari ? "video/mp4" : "video/webm"} />
        {/* Fallback for browsers that don't support the primary format */}
        <source src="/images/chart-animation-hevc-safari.mp4" type="video/mp4" />
        <p className="text-gray-400">Your browser does not support the video tag.</p>
      </video>
    </div>
  );
}