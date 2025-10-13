import Image from 'next/image';
import ProfileMarquee from './Widgets/TrendingWidget/ProfileMarquee';
import type { ProfileWidgetProps } from './Widgets/TrendingWidget/ProfileWidget';

export default function TrendingBar() {
  // Featured tokens: NUTTERBUTTER, BURN, and GROYPER
  // Arrows automatically correlate: positive % = up arrow (green), negative % would = down arrow (red)
  const trendingProfiles: ProfileWidgetProps[] = [
    { imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSmq6wLPreTp0RPdc75gSA85CvopA9sZtWhkA&s', name: 'NUTTERBUTTER', percentage: 156, showArrow: true, arrowDirection: 'up' },
    { imageUrl: 'https://pbs.twimg.com/media/G3Fi03YXsAA66pj?format=jpg&name=medium', name: 'BURN', percentage: 243, showArrow: true, arrowDirection: 'up' },
    { imageUrl: 'https://pbs.twimg.com/profile_images/1851836711245930496/Rd9y0Kmj_400x400.png', name: 'GROYPER', percentage: 189, showArrow: true, arrowDirection: 'up' },
  ];

  return (
    <div>
      {/* --- Desktop Layout (Hidden on Mobile) --- */}
      <div className="hidden md:flex h-16 lg:h-12 relative">
        {/* "TRENDING" title section */}
        <div className="flex-none w-50 lg:w-40 h-17 lg:h-13 -mt-1 lg:-mt-0.5 flex items-center z-15 justify-start pl-4 lg:pl-3 relative" style={{backgroundImage: 'url(/images/bull-bar.png)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
          <h2 className="text-[#F7F0D4] font-bold text-lg lg:text-base">
            TRENDING
          </h2>
        </div>

        {/* Main bar with bull image and scrolling profiles */}
        <div className="flex-grow bg-black/20 backdrop-blur-lg rounded-l-full -ml-15 lg:-ml-12 z-10 h-18 lg:h-14 -mt-1 lg:-mt-0.5 flex items-center">
          {/* <Image
            src="/images/bull.png"
            alt="Bull"
            width={120}
            height={110}
            className="-ml-6 -mt-3 h-full w-auto object-contain flex-shrink-0"
          /> */}

          {/* This container will take up the rest of the available space. */}
          <div className="flex-1 relative flex items-center overflow-hidden w-2 h-full">
            {/* Left fade overlay */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-24 lg:w-19 h-14 lg:h-11 bg-gradient-to-r from-[#1c0a00] to-transparent pointer-events-none" />
            
            <ProfileMarquee profiles={trendingProfiles} />
            
            {/* Right fade overlay */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-24 lg:w-19 h-14 lg:h-11 bg-gradient-to-l from-[#120a01] to-transparent pointer-events-none" />
          </div>
        </div>
      </div>

      {/* --- Mobile Layout (Visible ONLY on Mobile) --- */}
      <div className="md:hidden">
        {/* "TRENDING" title section (full width) */}
        <div className="h-16 bg-[#3d1e01] flex items-center justify-center">
          <h2 className="text-[#F7F0D4] font-bold text-lg">
            TRENDING
          </h2>
        </div>

        {/* Marquee section (full width, below title) */}
        <div className="h-16 bg-black/20 backdrop-blur-lg relative flex items-center overflow-hidden">
          {/* Left fade overlay (full height) */}
          <div className="absolute left-0 top-0 z-10 w-24 h-full bg-gradient-to-r from-[#1c0a00] to-transparent pointer-events-none" />

          <ProfileMarquee profiles={trendingProfiles} />

          {/* Right fade overlay (full height) */}
          <div className="absolute right-0 top-0 z-10 w-24 h-full bg-gradient-to-l from-[#120a01] to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
}