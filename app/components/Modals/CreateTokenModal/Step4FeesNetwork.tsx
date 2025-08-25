import React from 'react';
import { Fees } from './types';
import { fmt } from './utils';
import styles from './CreateTokenModal.module.css';

interface Step4FeesNetworkProps {
  fees: Fees;
  removeHeader: boolean;
  lpMode: 'LOCK' | 'BURN';
  onBack: () => void;
  onContinue: () => void;
}

const Step4FeesNetwork: React.FC<Step4FeesNetworkProps> = ({
  fees,
  removeHeader,
  lpMode,
  onBack,
  onContinue
}) => {
  return (
    <div className={styles.panel}>
      <div className={styles.grid2}>
        <div className={styles.card}>
          <div className={styles.label}>Upfront creation fee</div>
          <div className={styles.row} style={{alignItems: 'flex-end'}}>
            <div style={{fontSize: '24px', fontWeight: '800'}}>
              {fees.creation !== null ? fmt.format(fees.creation) : '—'}
            </div>
            <span className={styles.pill}>ETH</span>
          </div>
          <div className={styles.hint}>
            Varies by profile. Advanced is higher; Basic depends on variant (0,001 / 0,003).
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.label}>Add-ons</div>
          <div className={styles.row}>
            <span className={styles.pill}>
              Headerless: {removeHeader ? `${fmt.format(fees.headerless)} ETH` : 'Not selected'}
            </span>
            <span className={styles.pill}>Gas est.: ≈ 0,0015 ETH</span>
            <span className={styles.pill}>Network: Ethereum</span>
          </div>
        </div>
      </div>

      <div className={`${styles.card} ${styles.cardAlt}`}>
        <div className={styles.label}>At trade/graduation (awareness)</div>
        <div className={styles.row}>
          <span className={styles.pill}>Graduation fee: {fmt.format(fees.graduation)} ETH</span>
          <span className={styles.pill}>
            Locker fee (if Lock): {lpMode === 'LOCK' ? `${fmt.format(fees.locker)} ETH` : '—'}
          </span>
          <span className={styles.pill}>
            Platform fee: {fmt.format(fees.platformPct)}%
          </span>
        </div>
        <div className={styles.hint}>
          These are not charged now. You'll see them when graduating from pool or during trades.
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

export default Step4FeesNetwork;





