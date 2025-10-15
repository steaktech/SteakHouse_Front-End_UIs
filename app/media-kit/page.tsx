'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import styles from './MediaKit.module.css';

const MediaKitPage = () => {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const colors = [
    { name: 'Ember500', hex: '#f37732', label: 'Ember500' },
    { name: 'Ember400', hex: '#f7a553', label: 'Ember400' },
    { name: 'Gold300', hex: '#fac883', label: 'Gold300' },
    { name: 'Brown400', hex: '#7a3c1b', label: 'Brown400' },
    { name: 'Brown600', hex: '#402315', label: 'Brown600' },
    { name: 'Background900', hex: '#0e0402', label: 'Background900' },
  ];

  const handleCopyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDownloadLogo = (imageSrc: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Image downloaded!');
  };

  const handleCopyLogo = async (imageSrc: string) => {
    try {
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      showToast('Image copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy image:', error);
      showToast('Failed to copy image');
    }
  };

  return (
    <div className={styles.mediaKitPage}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/" className={styles.headerLogo}>
            <img src="/images/steakhouse-logo-v2.png" alt="SteakHouse" />
            <h1>SteakHouse</h1>
          </Link>
          <nav className={styles.headerNav}>
            <a href="#overview">Overview</a>
            <a href="#logos">Logos</a>
            <a href="#colors">Colors</a>
            <a href="#typography">Typography</a>
          </nav>
        </div>
        <button className={styles.downloadAllBtn}>Download All</button>
      </header>

      {/* Hero Section */}
      <div className={styles.container}>
        <section className={styles.heroSection}>
          <div className={styles.mediaKitBadge}>MEDIA KIT</div>
          <h1 className={styles.heroTitle}>
            The Dev&apos;s Kitchen - Official Assets
          </h1>
          <p className={styles.heroDescription}>
            Everything you need to present SteakHouse consistently across websites, decks, and listings. Download vector logos and color tokens.
          </p>
          <button className={styles.downloadAssetsBtn}>Download All Assets</button>
        </section>

        {/* Logos & Icons Section */}
        <section className={styles.section} id="logos">
          <h2 className={styles.sectionTitle}>Logos & Icons</h2>
          <p className={styles.sectionDescription}>
            Primary assets with transparent backgrounds. Use SVG whenever possible.
          </p>

          <div className={styles.logoGrid}>
            {/* Primary Logo - Horizontal */}
            <div className={styles.logoCard}>
              <div className={styles.logoPreview}>
                <img src="/images/steakhouse-logo-horizontal.png" alt="SteakHouse Primary Logo" />
              </div>
              <h3 className={styles.logoCardTitle}>Primary Logo - Horizontal</h3>
              <p className={styles.logoCardDescription}>
                Use for headers, sites and partner pages.
              </p>
              <div className={styles.logoCardActions}>
                <button
                  className={styles.downloadBtn}
                  onClick={() => handleDownloadLogo('/images/steakhouse-logo-horizontal.png', 'steakhouse-logo-horizontal.png')}
                >
                  Download PNG
                </button>
                <button
                  className={styles.copyBtn}
                  onClick={() => handleCopyLogo('/images/steakhouse-logo-horizontal.png')}
                >
                  Copy as PNG
                </button>
              </div>
            </div>

            {/* Logo - Stacked */}
            <div className={styles.logoCard}>
              <div className={styles.logoPreview}>
                <img src="/images/steakhouse-logo-v2.png" alt="SteakHouse Stacked Logo" style={{ maxHeight: '60%' }} />
              </div>
              <h3 className={styles.logoCardTitle}>Logo - Stacked</h3>
              <p className={styles.logoCardDescription}>
                Square-friendly asset for avatars and app tiles.
              </p>
              <div className={styles.logoCardActions}>
                <button
                  className={styles.downloadBtn}
                  onClick={() => handleDownloadLogo('/images/steakhouse-logo-v2.png', 'steakhouse-logo-stacked.png')}
                >
                  Download PNG
                </button>
                <button
                  className={styles.copyBtn}
                  onClick={() => handleCopyLogo('/images/steakhouse-logo-v2.png')}
                >
                  Copy as PNG
                </button>
              </div>
            </div>

            {/* Monochrome Logo */}
            <div className={styles.logoCard}>
              <div className={styles.logoPreview}>
                <img src="/images/steakhouse-logo-v2.png" alt="SteakHouse Monochrome Logo" style={{ filter: 'grayscale(100%) brightness(1.5)' }} />
              </div>
              <h3 className={styles.logoCardTitle}>Monochrome Logo</h3>
              <p className={styles.logoCardDescription}>
                For emboss, single-color print, embossing or dark UIs.
              </p>
              <div className={styles.logoCardActions}>
                <button
                  className={styles.downloadBtn}
                  onClick={() => handleDownloadLogo('/images/steakhouse-logo-v2.png', 'steakhouse-logo-monochrome.png')}
                >
                  Download PNG
                </button>
                <button
                  className={styles.copyBtn}
                  onClick={() => handleCopyLogo('/images/steakhouse-logo-v2.png')}
                >
                  Copy as PNG
                </button>
              </div>
            </div>

            {/* Logo Variant 1 */}
            <div className={styles.logoCard}>
              <div className={styles.logoPreview}>
                <img src="/images/logo-variant-1.png" alt="SteakHouse Logo Variant 1" />
              </div>
              <h3 className={styles.logoCardTitle}>Logo Variant 1</h3>
              <p className={styles.logoCardDescription}>
                Alternative logo design for special occasions or contexts.
              </p>
              <div className={styles.logoCardActions}>
                <button
                  className={styles.downloadBtn}
                  onClick={() => handleDownloadLogo('/images/logo-variant-1.png', 'logo-variant-1.png')}
                >
                  Download PNG
                </button>
                <button
                  className={styles.copyBtn}
                  onClick={() => handleCopyLogo('/images/logo-variant-1.png')}
                >
                  Copy as PNG
                </button>
              </div>
            </div>

            {/* Logo Variant 2 */}
            <div className={styles.logoCard}>
              <div className={styles.logoPreview}>
                <img src="/images/logo-variant-2.png" alt="SteakHouse Logo Variant 2" />
              </div>
              <h3 className={styles.logoCardTitle}>Logo Variant 2</h3>
              <p className={styles.logoCardDescription}>
                Second alternative logo design with a different background.
              </p>
              <div className={styles.logoCardActions}>
                <button
                  className={styles.downloadBtn}
                  onClick={() => handleDownloadLogo('/images/logo-variant-2.png', 'logo-variant-2.png')}
                >
                  Download PNG
                </button>
                <button
                  className={styles.copyBtn}
                  onClick={() => handleCopyLogo('/images/logo-variant-2.png')}
                >
                  Copy as PNG
                </button>
              </div>
            </div>
          </div>

          {/* Favicon Section */}
          <div className={styles.faviconSection}>
            <div className={styles.faviconPreview}>
              <img src="/images/app-logo.png" alt="SteakHouse Favicon" />
            </div>
            <div className={styles.faviconContent}>
              <h3 className={styles.faviconTitle}>Favicon</h3>
              <p className={styles.faviconDescription}>
                Use 32×32 or 48×48. Provided as ICO.
              </p>
              <div className={styles.faviconActions}>
                <button
                  className={styles.downloadBtn}
                  onClick={() => handleDownloadLogo('/images/favicon.ico', 'favicon.ico')}
                >
                  Download ICO
                </button>
                <button
                  className={styles.copyBtn}
                  onClick={() => handleCopyLogo('/images/app-logo.png')}
                >
                  Copy as PNG (preview)
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Color System Section */}
        <section className={styles.colorSystem} id="colors">
          <h2 className={styles.sectionTitle}>Color System</h2>
          <p className={styles.sectionDescription}>
            Orange-brown gradient core with supporting neutrals. Click any token to copy.
          </p>

          <div className={styles.paletteSection}>
            <h3 className={styles.paletteTitle}>Palette</h3>
            <p className={styles.paletteDescription}>
              Primary accent is a warm ember gradient. Backgrounds rely on deep browns with subtle amber glow.
            </p>

            <div className={styles.colorGrid}>
              {colors.map((color) => (
                <div key={color.hex} className={styles.colorToken}>
                  <div
                    className={styles.colorSwatch}
                    style={{ backgroundColor: color.hex }}
                  ></div>
                  <div className={styles.colorInfo}>
                    <div className={styles.colorLabel}>{color.label}</div>
                    <div className={styles.colorHex}>
                      <div className={styles.hexPill}>{color.hex}</div>
                      <button
                        onClick={() => handleCopyColor(color.hex)}
                        className={styles.copyButton}
                      >
                        {copiedColor === color.hex ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Typography Section */}
        <section className={styles.typographySection} id="typography">
          <h2 className={styles.sectionTitle}>Typography</h2>
          <p className={styles.sectionDescription}>
            Outfit for headlines and inter for body. Clear, modern and legible on dark backgrounds.
          </p>

          <div className={styles.typographyGrid}>
            {/* Headlines - Outfit */}
            <div className={styles.typographyCard}>
              <div className={styles.typographyCardHeader}>
                <h3 className={styles.typographyCardTitle}>Headlines - Outfit</h3>
              </div>
              <div className={styles.typographyPreview}>
                <h2 className={styles.outfitExample}>SteakHouse</h2>
                <p className={styles.outfitSubtitle}>The Dev&apos;s Kitchen</p>
              </div>
              <div className={styles.typographySpecs}>
                {`font-family: "Outfit", system-ui; font-weight: 700-900; letter-spacing: .2px;`}
              </div>
            </div>

            {/* Body - Inter */}
            <div className={styles.typographyCard}>
              <div className={styles.typographyCardHeader}>
                <h3 className={styles.typographyCardTitle}>Body - Inter</h3>
              </div>
              <div className={styles.typographyPreview}>
                <p className={styles.interExample}>
                  Use Inter 14–16px for paragraphs and UI. Increase contrast on
                  light backdrops, and prefer 1.5 line-height for readability.
                </p>
              </div>
              <div className={styles.typographySpecs}>
                {`font-family: "Inter", system-ui; font-size: 14-16px; line-height: 1.5-1.6;`}
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <p className={styles.footerCopyright}>© 2025 SteakHouse Media Kit</p>
          <p className={styles.footerDisclaimer}>
            All assets are provided under the SteakHouse Brand Guidelines. Do not alter the assets.
          </p>
        </footer>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className={styles.toast}>
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default MediaKitPage;
