"use client";

import React from 'react';
import styles from './SharePopup.module.css';

interface SharePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (platform: string) => void;
  shareData: {
    title?: string;
    text?: string;
    url: string;
  };
}

export const SharePopup: React.FC<SharePopupProps> = ({
  isOpen,
  onClose,
  onShare,
  shareData
}) => {
  const [copied, setCopied] = React.useState(false);
  
  // Reset copied state when popup closes
  React.useEffect(() => {
    if (!isOpen) {
      setCopied(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleShare = async (platform: string) => {
    onShare(platform);

    switch (platform) {
      case 'copy':
        try {
          await navigator.clipboard.writeText(shareData.url);
          setCopied(true);
          // Wait 1 second before closing the popup
          await new Promise(resolve => setTimeout(resolve, 1000));
          // Reset the copied state
          setCopied(false);
          onClose();
          return; // Return here to prevent immediate closing
        } catch (err) {
          console.error('Failed to copy:', err);
        }
        break;

      case 'discord':
        // Copy to clipboard first
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.url}`);
        // Then open Discord
        window.open('https://discord.com/app', '_blank');
        // Show a toast or alert to inform user
        alert('Link copied! You can now paste it in Discord.');
        break;

      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(shareData.url)}&text=${encodeURIComponent(shareData.title || '')}`, '_blank');
        break;

      case 'facebook':
        // Copy to clipboard first
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.url}`);
        // Then open Facebook
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`, '_blank');
        // Show a toast or alert to inform user
        alert('Link copied! You can now paste it on Facebook.');
        break;

      case 'whatsapp':
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareData.title}\n${shareData.url}`)}`, '_blank');
        break;

      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareData.url)}&text=${encodeURIComponent(shareData.title || '')}`, '_blank');
        break;

      case 'more':
        try {
          await navigator.share(shareData);
        } catch (err) {
          console.error('Share failed:', err);
        }
        break;
    }
    
    // Close the popup for all actions except copy (which handles its own closing)
    if (platform !== 'copy') {
      onClose();
    }
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.popup} role="dialog" aria-label="Share options">
        <div className={styles.content}>
          <button 
            onClick={() => handleShare('copy')} 
            className={`${styles.shareButton} ${copied ? styles.copied : ''}`}
            data-platform="copy"
            disabled={copied}
          >
            <svg className={styles.icon} viewBox="0 0 24 24">
              {copied ? (
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
              ) : (
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
              )}
            </svg>
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
          <button onClick={() => handleShare('discord')} className={styles.shareButton}>
            <svg className={styles.icon} viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            Discord
          </button>
          <button onClick={() => handleShare('telegram')} className={styles.shareButton}>
            <svg className={styles.icon} viewBox="0 0 24 24">
              <path d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42l10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001l-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15l4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"/>
            </svg>
            Telegram
          </button>
          <button onClick={() => handleShare('facebook')} className={styles.shareButton}>
            <svg className={styles.icon} viewBox="0 0 24 24">
              <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/>
            </svg>
            Facebook
          </button>
          <button onClick={() => handleShare('whatsapp')} className={styles.shareButton}>
            <svg className={styles.icon} viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp
          </button>
          <button onClick={() => handleShare('twitter')} className={styles.shareButton}>
            <svg className={styles.icon} viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            X (Twitter)
          </button>
          <button onClick={() => handleShare('more')} className={styles.shareButton}>
            <svg className={styles.icon} viewBox="0 0 24 24">
              <path d="M18 8A2 2 0 1 1 18 12A2 2 0 1 1 18 8M12 8A2 2 0 1 1 12 12A2 2 0 1 1 12 8M6 8A2 2 0 1 1 6 12A2 2 0 1 1 6 8"/>
            </svg>
            More
          </button>
        </div>
      </div>
    </>
  );
};