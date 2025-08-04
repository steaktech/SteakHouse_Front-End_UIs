import Image from "next/image";
import ProfileWidget from "./TrendingWidget/ProfileWidget";

export default function TrendingBar() {
  return (
    <div className="h-20 flex relative">
      {/* This div is now a flex item that does NOT grow or shrink.
        Its width is set as a base, but it won't distort the layout.
        We use a standard Tailwind width like w-48 (192px) which is close to your original 170px.
      */}
      <div className="flex-none w-48 bg-[#3d1e01] flex items-center justify-start pl-4">
        <h2 className="text-[#F7F0D4] font-bold text-xl md:text-2xl">
          TRENDING
        </h2>
      </div>

      {/* This div will now automatically grow to fill the remaining space,
        creating a perfectly fluid and reliable layout on all screen sizes.
        The large, breakpoint-specific negative margin was likely causing issues and has been removed.
      */}
      <div className="flex-grow bg-[#F7F0D4] rounded-l-full -ml-8 z-10 h-23 -mt-2 -mb-2 flex items-center">
        <Image
          src="/images/bull.png"
          alt="Bull"
          width={120}
          height={110}
          className="-ml-6 -mt-3 h-full w-auto object-contain"
        />

        <div className="flex space-x-2 overflow-hidden">
          <ProfileWidget
            imageUrl="/images/card_img.jpg"
            name="Zeus"
            percentage={89}
            showArrow={true}
          />
          <ProfileWidget
            imageUrl="/images/card_img.jpg"
            name="Apollo"
            percentage={76}
            showArrow={true}
          />
          <ProfileWidget
            imageUrl="/images/card_img.jpg"
            name="Hades"
            percentage={92}
            showArrow={true}
          />
        </div>
      </div>
    </div>
  );
}
