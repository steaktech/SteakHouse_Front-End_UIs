import React from 'react';
import { TrendingProfileWidget } from './ProfileWidget';
import type { TrendingToken } from '@/app/types/token';
import './ProfileMarquee.css'; // Your animation CSS

// Define the props for the TrendingProfileMarquee component
interface TrendingProfileMarqueeProps {
  tokens: TrendingToken[];
  showArrow?: boolean;
}

const TrendingProfileMarquee: React.FC<TrendingProfileMarqueeProps> = ({ 
  tokens, 
  showArrow = true 
}) => {
  // To maintain consistent animation speed, limit to the same number of items as the fallback
  // The original fallback has 5 profiles, so we'll use the top 5 trending tokens
  // This ensures the same content width and thus the same 40s animation speed
  const maxTokensForConsistentSpeed = 5;
  const tokensToUse = tokens.slice(0, maxTokensForConsistentSpeed);
  
  // If we have fewer than 5 tokens, repeat them to reach 5 (like the original)
  const finalTokens = [...tokensToUse];
  while (finalTokens.length < maxTokensForConsistentSpeed && tokensToUse.length > 0) {
    const needed = maxTokensForConsistentSpeed - finalTokens.length;
    const toAdd = tokensToUse.slice(0, Math.min(needed, tokensToUse.length));
    finalTokens.push(...toAdd);
  }
  
  // Create a new array that contains the tokens twice for seamless scrolling (just like the original)
  const duplicatedTokens = [...finalTokens, ...finalTokens];

  return (
    // The animated container. 'flex' arranges the items horizontally,
    // and 'animate-marquee' applies your CSS animation.
    <div className="flex animate-marquee">
      {/* Map over the DUPLICATED list, not the original one */}
      {duplicatedTokens.map((token, index) => (
        <TrendingProfileWidget
          // It's crucial to have a unique key for each element.
          // Use token_address + index to ensure uniqueness for duplicated tokens
          key={`${token.token_address}-${index}`}
          token={token}
          showArrow={showArrow}
        />
      ))}
    </div>
  );
};

export default TrendingProfileMarquee;
