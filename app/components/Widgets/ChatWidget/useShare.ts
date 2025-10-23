"use client";

interface ShareData {
  title?: string;
  text?: string;
  url: string;
}

export const useShare = () => {
  const isShareSupported = typeof navigator !== 'undefined' && 'share' in navigator;
  const isClipboardSupported = typeof navigator !== 'undefined' && 'clipboard' in navigator;

  const shareContent = async (data: ShareData) => {
    if (!data.url) {
      throw new Error('URL is required for sharing');
    }

    // Try using the Web Share API first
    if (isShareSupported) {
      try {
        await navigator.share(data);
        return { success: true, method: 'webshare' };
      } catch (error) {
        // User cancelled or share failed - fall back to clipboard
        if ((error as Error)?.name !== 'AbortError') {
          console.warn('Web Share API failed:', error);
        }
      }
    }

    // Try using the Clipboard API
    if (isClipboardSupported) {
      try {
        const textToShare = [
          data.title,
          data.text,
          data.url
        ].filter(Boolean).join('\n');
        
        await navigator.clipboard.writeText(textToShare);
        return { success: true, method: 'clipboard' };
      } catch (error) {
        console.warn('Clipboard API failed:', error);
      }
    }

    // Fallback to legacy clipboard method
    try {
      const textArea = document.createElement('textarea');
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      textArea.value = data.url;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (success) {
        return { success: true, method: 'legacy' };
      }
    } catch (error) {
      console.error('Legacy clipboard method failed:', error);
    }

    throw new Error('Unable to share or copy content');
  };

  return { shareContent, isShareSupported };
};