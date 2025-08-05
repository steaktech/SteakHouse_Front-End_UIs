import React from 'react';
import Marquee from 'react-fast-marquee';
import ProfileWidget, { ProfileWidgetProps } from './ProfileWidget';

interface ProfileMarqueeProps {
  profiles: ProfileWidgetProps[];
  speed?: number;
}

const ProfileMarquee: React.FC<ProfileMarqueeProps> = ({
  profiles,
  speed = 40,
}) => {
  // This width controls how wide the fade effect is on each side.
  const fadeWidth = '40px';

  // We use a CSS mask to create a fade effect on both sides.
  const marqueeWrapperStyle: React.CSSProperties = {
    WebkitMaskImage: `linear-gradient(to right, transparent, black ${fadeWidth}, black calc(100% - ${fadeWidth}), transparent)`,
    maskImage: `linear-gradient(to right, transparent, black ${fadeWidth}, black calc(100% - ${fadeWidth}), transparent)`,
  };

  return (
    <div style={marqueeWrapperStyle}>
      <Marquee
        // Disable the default gradient, as we are applying our own.
        gradient={false}
        speed={speed}
      >
        {/*
          CORRECTION: We map over the ORIGINAL profiles array.
          The library will handle duplicating the content for a seamless loop.
        */}
        {profiles.map((profile, index) => (
          <ProfileWidget key={`${profile.name}-${index}`} {...profile} />
        ))}
      </Marquee>
    </div>
  );
};

export default ProfileMarquee;