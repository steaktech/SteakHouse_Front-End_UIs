import Image from 'next/image';
import ProfileMarquee from './TrendingWidget/ProfileMarquee';

export default function TrendingBar() {
  // Define your profile data here. This could also come from an API.
  const trendingProfiles = [
    { imageUrl: '/images/info_icon.jpg', name: 'Zeus', percentage: 89, showArrow: true },
    { imageUrl: '/images/info_icon.jpg', name: 'Apollo', percentage: 76, showArrow: true },
    { imageUrl: '/images/info_icon.jpg', name: 'Hades', percentage: 92, showArrow: true },
    { imageUrl: '/images/info_icon.jpg', name: 'Hera', percentage: 85, showArrow: false },
    { imageUrl: '/images/info_icon.jpg', name: 'Ares', percentage: 70, showArrow: true },
  ];

  return (
    <div className="h-16 flex relative">
      {/* "TRENDING" title section */}
      <div className="flex-none w-48 bg-[#3d1e01] flex items-center justify-start pl-4">
        <h2 className="text-[#F7F0D4] font-bold text-lg md:text-lg">
          TRENDING
        </h2>
      </div>

      {/* Main bar with bull image and scrolling profiles */}
      <div className="flex-grow bg-[#F7F0D4] rounded-l-full -ml-8 z-10 h-18 -mt-1 flex items-center">
        <Image
          src="/images/bull.png"
          alt="Bull"
          width={120}
          height={110}
          className="-ml-6 -mt-3 h-full w-auto object-contain flex-shrink-0"
        />

        {/* This container will take up the rest of the available space. */}
        <div className="flex-1 relative flex items-center overflow-hidden h-full w-20">
          {/* Left fade overlay (shorter and vertically centered) */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-24 h-14 bg-gradient-to-r from-[#F7F0D4] to-transparent pointer-events-none" />
          
          <ProfileMarquee profiles={trendingProfiles} />
          
          {/* Right fade overlay (shorter and vertically centered) */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-24 h-14 bg-gradient-to-l from-[#F7F0D4] to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
}