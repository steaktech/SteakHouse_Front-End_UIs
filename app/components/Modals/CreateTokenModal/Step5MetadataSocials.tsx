import React from 'react';
import { MetaData } from './types';
import HelpTooltip from '../../UI/HelpTooltip';
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
          <input 
            className={styles.input}
            value={meta.logo}
            onChange={(e) => onMetaChange('logo', e.target.value)}
            placeholder="https://yoursite.com/logo.png" 
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
          <input 
            className={styles.input}
            value={meta.banner}
            onChange={(e) => onMetaChange('banner', e.target.value)}
            placeholder="https://yoursite.com/banner.png" 
          />
          <div style={{fontSize: '12px', color: '#888', marginTop: '4px'}}>
            Recommended: 1500x500px, PNG/JPG
          </div>
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




