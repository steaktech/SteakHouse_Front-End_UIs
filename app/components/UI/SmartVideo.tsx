import type { VideoHTMLAttributes } from 'react';

type VideoSource = { src: string; type: string };

type SmartVideoProps =
  Omit<VideoHTMLAttributes<HTMLVideoElement>, 'src'> &
  (
    | { base: string; sources?: never }   // e.g., base="/videos/pan-animation" -> adds .webm and .mp4
    | { base?: never; sources: VideoSource[] }
  );

export default function SmartVideo({
  base,
  sources,
  className,
  autoPlay = true,
  muted = true,
  loop = true,
  playsInline = true,
  preload = 'metadata',
  children,
  ...videoProps
}: SmartVideoProps) {
  const resolvedSources: VideoSource[] =
    sources ??
    [
      { src: `${base}.webm`, type: 'video/webm' },
      { src: `${base}.mp4`, type: 'video/mp4' },
    ];

  return (
    <video
      className={className}
      autoPlay={autoPlay}
      muted={muted}
      loop={loop}
      playsInline={playsInline}
      preload={preload}
      {...videoProps}
    >
      {resolvedSources.map(s => (
        <source key={s.type} src={s.src} type={s.type} />
      ))}
      {children ?? (
        <p>Your browser does not support the video tag.</p>
      )}
    </video>
  );
}