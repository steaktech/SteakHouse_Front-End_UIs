import React from 'react';
import { Fees } from './types';
import { fmt } from './utils';
import HelpTooltip from '../../UI/HelpTooltip';
import styles from './CreateTokenModal.module.css';

interface Step4FeesNetworkProps {
  fees: Fees;
  removeHeader: boolean;
  stealth: boolean;
  lpMode: 'LOCK' | 'BURN';
  onBack: () => void;
  onContinue: () => void;
}

const Step4FeesNetwork: React.FC<Step4FeesNetworkProps> = ({
  fees,
  removeHeader,
  stealth,
  lpMode,
  onBack,
  onContinue
}) => {
  return (
    <div className={styles.panel}>
      {/* Main Creation Cost */}
      <div className={styles.card}>
        <div className={styles.label}>
          Creation Cost
          <HelpTooltip content="One-time fee to deploy your token to the blockchain." />
        </div>
        <div className={styles.row} style={{ alignItems: 'flex-end' }}>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#e8b35c' }}>
            {fees.creation !== null ? fmt.format(fees.creation) : '0'}
          </div>
          <span className={styles.pill}>ETH</span>
        </div>
        {fees.creation === 0 && (
          <div style={{ color: '#22c55e', fontSize: '14px', marginTop: '4px' }}>
            ✨ Free for your selected profile!
          </div>
        )}
      </div>

      {/* Additional Options */}
      <div className={styles.grid2}>
        <div className={styles.card}>
          <div className={styles.label}>
            Optional Add-ons
            <HelpTooltip content="Extra features you can add to your token. These are completely optional." />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span className={`${styles.pill} ${removeHeader ? styles.active : ''}`}>
              Remove Header: {removeHeader ? `+${fmt.format(fees.headerless)} ETH` : 'Not selected'}
              <HelpTooltip content="Removes the Steakhouse header for a cleaner contract address." className="ml-2" />
            </span>
            <span className={`${styles.pill} ${stealth ? styles.active : ''}`}>
              Stealth Mode: {stealth ? `+${fmt.format(fees.stealth)} ETH` : 'Not selected'}
              <HelpTooltip content="Your token won't appear in public listings until you're ready to reveal it." className="ml-2" />
            </span>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.label}>
            Network Info
            <HelpTooltip content="Your token will be deployed on the Ethereum blockchain." />
          </div>
          <div className={styles.row}>
            <span className={styles.pill}>⟠ Ethereum Mainnet</span>
            <span className={styles.pill}>Gas: ~0.002 ETH</span>
          </div>
        </div>
      </div>

      {/* Future Fees (Simplified) */}
      <div className={`${styles.card} ${styles.cardAlt}`}>
        <div className={styles.label}>
          Future Fees
          <HelpTooltip content="These fees only apply later when your token graduates to exchanges. Nothing to pay now!" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '14px', color: '#e8b35c' }}>
            💡 No payment required now - these are just for your information:
          </div>
          <div className={styles.row}>
            <span className={styles.pill}>Graduation: {fmt.format(fees.graduation)} ETH</span>
            {lpMode === 'LOCK' && (
              <span className={styles.pill}>Liquidity Lock: {fmt.format(fees.locker)} ETH</span>
            )}
            <span className={styles.pill}>Platform: {fmt.format(fees.platformPct)}%</span>
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

export default Step4FeesNetwork;




