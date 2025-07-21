import React from 'react';
import Image from 'next/image';

// Define the type for our SVG icon props
type IconProps = {
  className?: string;
};

// --- SVG Icon Components ---
const DiscordIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

const TelegramIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 11.9c-.88-.28-.88-1.39.2-1.65l15.96-5.99c.73-.27 1.36.17 1.15.99l-2.78 13.1c-.27 1.25-1.04 1.55-2.04 1.01l-4.99-3.68-2.4 2.3c-.27.27-.5.53-.98.53z"/>
  </svg>
);

const XIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.479l8.6-9.83L0 1.154h7.594l5.243 7.184L18.901 1.153zm-1.61 19.7h2.54l-14.49-16.885H3.207l14.084 16.885z"/>
  </svg>
);

const InfoIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
  </svg>
);

// --- Footer Component ---
const Footer: React.FC = () => {
  const socialIcons = [
    { href: "#", Icon: DiscordIcon, ariaLabel: "Discord" },
    { href: "#", Icon: TelegramIcon, ariaLabel: "Telegram" },
    { href: "#", Icon: XIcon, ariaLabel: "X social network" },
    { href: "#", Icon: InfoIcon, ariaLabel: "More information" },
  ];

  const footerLinks = [
    { href: "#", text: "Documentation" },
    { href: "#", text: "Create Token" },
    { href: "#", text: "Contact" },
  ];

  return (
    <footer style={{ backgroundColor: '#3d1e01' }} className="text-white py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-row justify-between items-center">
          
          {/* Footer Logo */}
          <div className="flex items-center">
            <Image 
              src="/images/footer_logo.png" 
              alt="Footer Logo" 
              width={400} 
              height={400} 
              className="object-contain"
            />
          </div>

          {/* Right Side Content */}
          <div className="flex flex-col items-end space-y-8">
            {/* Social Icons */}
            <div className="flex items-center space-x-3">
              {socialIcons.map((social, index) => (
                <a 
                  key={index} 
                  href={social.href} 
                  aria-label={social.ariaLabel}
                  className="bg-yellow-500 hover:bg-yellow-400 text-[#3d1e01] rounded-full p-2 transition-colors duration-300"
                >
                  <social.Icon className="w-5 h-5" />
                </a>
              ))}
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
