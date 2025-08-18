import React from 'react';
import { MetaData } from './types';
import styles from './CreateTokenModal.module.css';

interface Step5MetadataSocialsProps {
  meta: MetaData;
  onMetaChange: (field: string, value: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

const Step5MetadataSocials: React.FC<Step5MetadataSocialsProps> = ({
  meta,
  onMetaChange,
  onBack,
  onContinue
}) => {
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
          <input 
            className={styles.input}
            value={meta.logo}
            onChange={(e) => onMetaChange('logo', e.target.value)}
            placeholder="Image URL" 
          />
        </div>
        <div className={styles.card}>
          <div className={styles.label}>Banner (1500×500)</div>
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

