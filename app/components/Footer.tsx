import React, { useState } from 'react';
import Image from 'next/image';

// --- Footer Component ---
const Footer: React.FC = () => {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  
  const footerLinks = [
    { href: "#", text: "Documentation" },
    { href: "#", text: "Create Token" },
    { href: "#", text: "Contact" },
  ];

  return (
    <footer style={{ backgroundColor: '#3d1e01' }} className="text-white py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile Layout: Stack vertically - Logo, Links, Social Icons */}
        <div className="flex flex-col items-center space-y-6 sm:hidden">
          {/* Footer Logo */}
          <div className="flex items-center">
            <Image 
              src="/images/footer_logo.png" 
              alt="Footer Logo" 
              width={300} 
              height={300} 
              className="object-contain"
            />
          </div>

          {/* Footer Links - Mobile: Vertical List */}
          <nav>
            <ul className="flex flex-col items-center space-y-2 text-sm text-gray-300">
              {footerLinks.map((link) => (
                <li key={link.text}>
                  <a href={link.href} className="hover:text-white transition-colors duration-300">
                    {link.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Social Icons */}
          <div className="flex items-center space-x-2">
            {/* Discord Icon */}
            <a href="#" className="w-8 h-8 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
              <Image
                src="/images/discord.png"
                alt="Discord"
                width={28}
                height={28}
                className="object-contain"
              />
            </a>
            
            {/* Telegram Icon */}
            <a href="#" className="w-8 h-8 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
              <Image
                src="/images/telegram.png"
                alt="Telegram"
                width={28}
                height={28}
                className="object-contain"
              />
            </a>

            {/* Twitter/X Icon */}
            <a href="#" className="w-8 h-8 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
              <Image
                src="/images/twitter.png"
                alt="Twitter"
                width={28}
                height={28}
                className="object-contain"
              />
            </a>
            
            {/* Info Icon */}
            <div onClick={() => setIsInfoModalOpen(true)} className="w-8 h-8 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
              <Image
                src="/images/info.png"
                alt="Info"
                width={28}
                height={28}
                className="object-contain"
              />
            </div>
          </div>
        </div>

        {/* Desktop Layout: Logo left, content pushed right */}
        <div className="hidden sm:flex flex-row justify-between items-center">
          {/* Footer Logo - Positioned more to the left */}
          <div className="flex items-center -ml-8">
            <Image 
              src="/images/footer_logo.png" 
              alt="Footer Logo" 
              width={400} 
              height={400} 
              className="object-contain"
            />
          </div>

          {/* Right Side Content - Positioned more to the right */}
          <div className="flex flex-col items-end space-y-8 mr-8">
            {/* Social Icons */}
            <div className="flex items-center space-x-2 ml-4">
              {/* Discord Icon */}
              <a href="#" className="w-8 h-8 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                <Image
                  src="/images/discord.png"
                  alt="Discord"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </a>
              
              {/* Telegram Icon */}
              <a href="#" className="w-8 h-8 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                <Image
                  src="/images/telegram.png"
                  alt="Telegram"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </a>

              {/* Twitter/X Icon */}
              <a href="#" className="w-8 h-8 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                <Image
                  src="/images/twitter.png"
                  alt="Twitter"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </a>
              
              {/* Info Icon */}
              <div onClick={() => setIsInfoModalOpen(true)} className="w-8 h-8 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                <Image
                  src="/images/info.png"
                  alt="Info"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </div>
            </div>

            {/* Footer Links */}
            <nav>
              <ul className="flex items-center space-x-3 text-sm sm:text-base text-gray-300">
                {footerLinks.map((link, index) => (
                  <React.Fragment key={link.text}>
                    <li>
                      <a href={link.href} className="hover:text-white transition-colors duration-300">
                        {link.text}
                      </a>
                    </li>
                    {index < footerLinks.length - 1 && (
                      <li aria-hidden="true">|</li>
                    )}
                  </React.Fragment>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
