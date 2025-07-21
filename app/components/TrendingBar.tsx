import Image from 'next/image';

export default function TrendingBar() {
  return (
    <div className="h-25 flex relative">
      <div className="w-[170px] sm:w-[400px] bg-[#3d1e01] flex items-center justify-start pl-2 sm:pl-3 md:pl-4">
        <h2 className="text-[#F7F0D4] font-bold text-xl md:text-2xl">TRENDING</h2>
      </div>
      <div className="flex-grow bg-[#F7F0D4] rounded-l-full -ml-8 sm:-ml-8 md:-ml-50 z-10 h-30 -mt-2 -mb-2 flex items-center">
        <Image 
          src="/images/bull.png" 
          alt="Bull" 
          width={120} 
          height={110} 
          className="-ml-6 -mt-3 h-full w-auto object-contain"
        />
      </div>
    </div>
  );
}
