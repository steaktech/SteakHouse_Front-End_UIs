import React from 'react';
import ProfileWidget, { ProfileWidgetProps } from './ProfileWidget'; // Adjust path if needed
import './ProfileMarquee.css'; // Your animation CSS

// Define the props for the ProfileMarquee component
interface ProfileMarqueeProps {
  profiles: ProfileWidgetProps[];
}

const ProfileMarquee: React.FC<ProfileMarqueeProps> = ({ profiles }) => {
  // THE FIX: Create a new array that contains the original profiles twice.
  const duplicatedProfiles = [...profiles, ...profiles];

  return (
    // The animated container. 'flex' arranges the items horizontally,
    // and 'animate-marquee' applies your CSS animation.
    <div className="flex animate-marquee">
      {/* Map over the DUPLICATED list, not the original one */}
      {duplicatedProfiles.map((profile, index) => (
        <ProfileWidget
          // It's crucial to have a unique key for each element.
          // The index is sufficient here since the list is static during render.
          key={index}
          imageUrl={profile.imageUrl}
          name={profile.name}
          percentage={profile.percentage}
          showArrow={profile.showArrow}
          arrowDirection={profile.arrowDirection}
        />
      ))}
    </div>
  );
};

export default ProfileMarquee;