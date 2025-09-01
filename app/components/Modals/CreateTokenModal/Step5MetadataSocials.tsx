import React from 'react';
import { MetaData, FileUploads } from './types';
import styles from './CreateTokenModal.module.css';

interface Step5MetadataSocialsProps {
  meta: MetaData;
  files: FileUploads;
  onMetaChange: (field: string, value: string) => void;
  onFileChange: (field: 'logo' | 'banner', file: File | undefined) => void;
  onBack: () => void;
  onContinue: () => void;
}

const Step5MetadataSocials: React.FC<Step5MetadataSocialsProps> = ({
  meta,
  files,
  onMetaChange,
  onFileChange,
  onBack,
  onContinue
}) => {
  const handleFileChange = (field: 'logo' | 'banner') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    onFileChange(field, file);
  };
  return (
    <div className={styles.panel}>
      <div className={styles.grid2}>
        <div className={styles.card}>
          <div className={styles.label}>Description</div>
          <textarea
            className={styles.textarea}
            value={meta.desc}
            onChange={(e) => onMetaChange('desc', e.target.value)}
            placeholder="What is your project about?"
          />
        </div>
        <div className={styles.card}>
          <div className={styles.label}>Website</div>
          <input
            className={styles.input}
            value={meta.website}
            onChange={(e) => onMetaChange('website', e.target.value)}
            placeholder="https://yoursite.xyz"
          />
          <div className={styles.label} style={{marginTop: '10px'}}>Telegram</div>
          <input
            className={styles.input}
            value={meta.tg}
            onChange={(e) => onMetaChange('tg', e.target.value)}
            placeholder="https://t.me/yourchannel"
          />
          <div className={styles.label} style={{marginTop: '10px'}}>X / Twitter</div>
          <input
            className={styles.input}
            value={meta.tw}
            onChange={(e) => onMetaChange('tw', e.target.value)}
            placeholder="https://x.com/yourhandle"
          />
        </div>
      </div>

      <div className={styles.grid2} style={{marginTop: '8px'}}>
        <div className={styles.card}>
          <div className={styles.label}>Logo (500×500)</div>
          <div style={{ marginBottom: '8px' }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange('logo')}
              className={styles.fileInput}
              id="logo-upload"
            />
            <label htmlFor="logo-upload" className={styles.fileLabel}>
              {files.logo ? files.logo.name : 'Choose Logo File'}
            </label>
          </div>
          <div className={styles.hint} style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
            Or provide URL:
          </div>
          <input 
            className={styles.input}
            value={meta.logo}
            onChange={(e) => onMetaChange('logo', e.target.value)}
            placeholder="Image URL" 
          />
        </div>
        <div className={styles.card}>
          <div className={styles.label}>Banner (1500×500)</div>
          <div style={{ marginBottom: '8px' }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange('banner')}
              className={styles.fileInput}
              id="banner-upload"
            />
            <label htmlFor="banner-upload" className={styles.fileLabel}>
              {files.banner ? files.banner.name : 'Choose Banner File'}
            </label>
          </div>
          <div className={styles.hint} style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
            Or provide URL:
          </div>
          <input 
            className={styles.input}
            value={meta.banner}
            onChange={(e) => onMetaChange('banner', e.target.value)}
            placeholder="Image URL" 
          />
        </div>
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




