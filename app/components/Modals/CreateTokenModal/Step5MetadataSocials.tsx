import React, { useRef, useState } from 'react';
import { MetaData } from './types';
import HelpTooltip from '../../UI/HelpTooltip';
import styles from './CreateTokenModal.module.css';

interface Step5MetadataSocialsProps {
  meta: MetaData;
  onMetaChange: (field: string, value: string | File | boolean) => void;
  onBack: () => void;
  onContinue: () => void;
}

const Step5MetadataSocials: React.FC<Step5MetadataSocialsProps> = ({
  meta,
  onMetaChange,
  onBack,
  onContinue
}) => {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFileChange = (field: 'logoFile' | 'bannerFile' | 'audioFile', file: File | null) => {
    if (file) {
      onMetaChange(field, file);
      // Clear the URL field when a file is selected
      const urlField = field === 'logoFile' ? 'logo' : 'banner';
      onMetaChange(urlField, '');
    }
  };

  const handleUrlChange = (field: 'logo' | 'banner', value: string) => {
    onMetaChange(field, value);
    // Clear the file when a URL is entered
    const fileField = field === 'logo' ? 'logoFile' : 'bannerFile';
    if (meta[fileField]) {
      onMetaChange(fileField, '');
    }
  };
  return (
    <div className={styles.panel}>
      {/* Optional Notice */}
      <div className={`${styles.card} ${styles.cardAlt}`} style={{marginBottom: '20px'}}>
        <div style={{textAlign: 'center', color: '#e8b35c'}}>
          🎨 <strong>All fields are optional!</strong> You can always add this information later.
        </div>
      </div>

      {/* Description */}
      <div className={styles.card}>
        <div className={styles.label}>
          Project Description 
          <HelpTooltip content="Tell people what your token is about! This helps build trust and community." />
        </div>
        <textarea
          className={styles.textarea}
          value={meta.desc}
          onChange={(e) => onMetaChange('desc', e.target.value)}
          placeholder="e.g., A community-driven meme token bringing fun to DeFi..."
          rows={3}
        />
      </div>

      {/* Social Links */}
      <div className={styles.grid2}>
        <div className={styles.card}>
          <div className={styles.label}>
            Website 
            <HelpTooltip content="Your official website. Helps establish credibility and provides more info to users." />
          </div>
          <input
            className={styles.input}
            value={meta.website}
            onChange={(e) => onMetaChange('website', e.target.value)}
            placeholder="https://yourtoken.com"
          />
          
          <div className={styles.label} style={{marginTop: '16px'}}>
            Telegram 
            <HelpTooltip content="Telegram community link. Great for building an active community around your token." />
          </div>
          <input
            className={styles.input}
            value={meta.tg}
            onChange={(e) => onMetaChange('tg', e.target.value)}
            placeholder="https://t.me/yourtoken"
          />
        </div>
        
        <div className={styles.card}>
          <div className={styles.label}>
            X (Twitter) 
            <HelpTooltip content="Twitter/X account for announcements and community updates." />
          </div>
          <input
            className={styles.input}
            value={meta.tw}
            onChange={(e) => onMetaChange('tw', e.target.value)}
            placeholder="https://x.com/yourtoken"
          />
        </div>
      </div>

      {/* Visual Assets */}
      <div className={styles.grid2} style={{marginTop: '16px'}}>
        <div className={styles.card}>
          <div className={styles.label}>
            Token Logo 
            <HelpTooltip content="Square image (500x500px recommended) that represents your token. Shows up in wallets and exchanges." />
          </div>
          
          {/* File Upload Option */}
          <div style={{ marginBottom: '12px' }}>
            <input
              ref={logoInputRef}
              type="file"
              id="logo-file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                handleFileChange('logoFile', file || null);
              }}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              className={`${styles.btn} ${styles.btnGhost}`}
              onClick={() => logoInputRef.current?.click()}
              style={{ width: '100%', marginBottom: '8px' }}
            >
              {meta.logoFile ? `Selected: ${meta.logoFile.name}` : 'Upload Logo File'}
            </button>
          </div>
          
          <div style={{ textAlign: 'center', margin: '8px 0', color: '#888' }}>OR</div>
          
          {/* URL Input Option */}
          <input 
            className={styles.input}
            value={meta.logo}
            onChange={(e) => handleUrlChange('logo', e.target.value)}
            placeholder="https://yoursite.com/logo.png"
            disabled={!!meta.logoFile}
          />
          <div style={{fontSize: '12px', color: '#888', marginTop: '4px'}}>
            Recommended: 500x500px, PNG/JPG
          </div>
        </div>
        
        <div className={styles.card}>
          <div className={styles.label}>
            Banner Image 
            <HelpTooltip content="Wide banner image (1500x500px recommended) for your token's page header. Makes your token look professional!" />
          </div>
          
          {/* File Upload Option */}
          <div style={{ marginBottom: '12px' }}>
            <input
              ref={bannerInputRef}
              type="file"
              id="banner-file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                handleFileChange('bannerFile', file || null);
              }}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              className={`${styles.btn} ${styles.btnGhost}`}
              onClick={() => bannerInputRef.current?.click()}
              style={{ width: '100%', marginBottom: '8px' }}
            >
              {meta.bannerFile ? `Selected: ${meta.bannerFile.name}` : 'Upload Banner File'}
            </button>
          </div>
          
          <div style={{ textAlign: 'center', margin: '8px 0', color: '#888' }}>OR</div>
          
          {/* URL Input Option */}
          <input 
            className={styles.input}
            value={meta.banner}
            onChange={(e) => handleUrlChange('banner', e.target.value)}
            placeholder="https://yoursite.com/banner.png"
            disabled={!!meta.bannerFile}
          />
          <div style={{fontSize: '12px', color: '#888', marginTop: '4px'}}>
            Recommended: 1500x500px, PNG/JPG
          </div>
        </div>
      </div>

      {/* Advanced Section */}
      <div className={styles.card} style={{ marginTop: '16px' }}>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnGhost}`}
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{ 
            width: '100%', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '12px'
          }}
        >
          <span>Additional Features</span>
          <span style={{ transform: showAdvanced ? 'rotate(180deg)' : 'none' }}>▼</span>
        </button>

        {showAdvanced && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ marginBottom: '16px' }}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={meta.autoBrand || false}
                  onChange={(e) => onMetaChange('autoBrand', e.target.checked)}
                  className={styles.checkbox}
                />
                <span style={{ marginLeft: '8px' }}>Auto brand</span>
                <HelpTooltip content="Enable special branding features for your token" />
              </label>
            </div>

            <div className={styles.card}>
              <div className={styles.label}>
                Audio Branding 
                <HelpTooltip content="Add a unique audio signature to your token (MP3 file, max 2MB)" />
              </div>
              
              {/* Audio File Upload */}
              <div style={{ marginBottom: '12px' }}>
                <input
                  ref={audioInputRef}
                  type="file"
                  id="audio-file"
                  accept="audio/mpeg"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && file.size > 10 * 1024 * 1024) {
                      alert('Audio file must be less than 10MB');
                      return;
                    }
                    handleFileChange('audioFile', file || null);
                  }}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnGhost}`}
                  onClick={() => audioInputRef.current?.click()}
                  style={{ width: '100%', marginBottom: '8px' }}
                >
                  {meta.audioFile ? `Selected: ${meta.audioFile.name}` : 'Upload Audio File'}
                </button>
                
              </div>
              
              <div style={{ textAlign: 'center', margin: '8px 0', color: '#888' }}>OR</div>
              
              {/* URL Input Option */}
              <input 
                className={styles.input}
                value={meta.audio || ''}
                onChange={(e) => {
                  onMetaChange('audio', e.target.value);
                  // Clear the file when a URL is entered
                  if (meta.audioFile) {
                    handleFileChange('audioFile', null);
                  }
                }}
                placeholder="https://yoursite.com/audio.mp3"
                disabled={!!meta.audioFile}
              />

              <div style={{fontSize: '12px', color: '#888', marginTop: '4px'}}>
                Supported: MP3 format, max 10MB
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.footerNav}>
        <button 
          className={`${styles.btn} ${styles.btnGhost} ${styles.navButton}`}
          onClick={onBack}
        >
          Back
        </button>
        <button 
          className={`${styles.btn} ${styles.btnPrimary} ${styles.navButton}`}
          onClick={onContinue}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default Step5MetadataSocials;




