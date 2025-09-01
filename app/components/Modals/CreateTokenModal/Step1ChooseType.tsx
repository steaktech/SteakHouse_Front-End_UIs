import React from 'react';
import { ProfileType, TaxMode } from './types';
import { fmt } from './utils';
import styles from './CreateTokenModal.module.css';

interface Step1ChooseTypeProps {
  taxMode: TaxMode | null;
  profile: ProfileType | null;
  creationFee: number | null;
  errors: Record<string, string>;
  onTaxModeChange: (taxMode: TaxMode) => void;
  onProfileChange: (profile: ProfileType) => void;
  onContinue: () => void;
}

const Step1ChooseType: React.FC<Step1ChooseTypeProps> = ({
  taxMode,
  profile,
  creationFee,
  errors,
  onTaxModeChange,
  onProfileChange,
  onContinue
}) => {
  const isProfileAllowed = (profileType: ProfileType) => {
    if (taxMode === 'NO_TAX') {
      return profileType === 'ZERO' || profileType === 'SUPER';
    } else if (taxMode === 'BASIC') {
      return profileType === 'BASIC' || profileType === 'ADVANCED';
    }
    return true;
  };

  const getProfileTitle = (profileType: ProfileType) => {
    switch (profileType) {
      case 'ZERO': return 'Zero Simple';
      case 'SUPER': return 'Super Simple';
      case 'BASIC': return 'Basic';
      case 'ADVANCED': return 'Advanced';
    }
  };

  const getProfileDescription = (profileType: ProfileType) => {
    switch (profileType) {
      case 'ZERO': return '0% curve tax, no limits. Fast and frictionless.';
      case 'SUPER': return '0% curve tax with static Max Tx/Wallet.';
      case 'BASIC': return 'Static curve tax and static limits for a fixed duration.';
      case 'ADVANCED': return 'Decaying tax & limits, timed removal; highly configurable.';
    }
  };

  return (
    <div className={styles.panel}>
      <div className={`${styles.card} ${styles.cardAlt}`}>
        <div className={styles.label}>Goal</div>
        <div className={styles.row}>
          Branch early; we'll only show the inputs you need later.
          <span className={styles.pill}>Profiles: Zero / Super / Basic / Advanced</span>
        </div>
      </div>

      <div className={styles.grid2}>
        <div className={styles.card}>
          <div className={styles.label}>Token tax</div>
          <div className={styles.radioCards}>
            <div 
              className={`${styles.radioCard} ${taxMode === 'BASIC' ? styles.active : ''}`}
              onClick={() => onTaxModeChange('BASIC')}
            >
              <div className="title">TAX</div>
              <div className="desc">
                Pick Basic or Advanced. Final token can end TAX/NO-TAX via Final Token Type + Final tax rate.
              </div>
            </div>
            <div 
              className={`${styles.radioCard} ${taxMode === 'NO_TAX' ? styles.active : ''}`}
              onClick={() => onTaxModeChange('NO_TAX')}
            >
              <div className="title">NO-TAX</div>
              <div className="desc">
                Pick Zero Simple (no limits) or Super Simple (static limits).
              </div>
            </div>
          </div>
          {errors.step1 && <div className={styles.error}>{errors.step1}</div>}
        </div>

        <div className={styles.card}>
          <div className={styles.label}>Profile</div>
          <div className={styles.radioCards}>
            {(['ZERO', 'SUPER', 'BASIC', 'ADVANCED'] as ProfileType[]).map(profileType => (
              <div 
                key={profileType}
                className={`${styles.radioCard} ${profile === profileType ? styles.active : ''}`}
                style={{ 
                  opacity: isProfileAllowed(profileType) ? 1 : 0.35,
                  pointerEvents: isProfileAllowed(profileType) ? 'auto' : 'none'
                }}
                onClick={() => isProfileAllowed(profileType) && onProfileChange(profileType)}
              >
                <div className="title">{getProfileTitle(profileType)}</div>
                <div className="desc">{getProfileDescription(profileType)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.label}>Tiny compare</div>
        <div className={styles.compare}>
          <div className={styles.compareMini}>
            <div className={styles.row}>
              <strong>Zero</strong><span className={styles.pill}>0% curve tax</span>
            </div>
            <div className={styles.hint}>No limits.</div>
          </div>
          <div className={styles.compareMini}>
            <div className={styles.row}>
              <strong>Super</strong><span className={styles.pill}>0% curve tax</span>
            </div>
            <div className={styles.hint}>Static limits.</div>
          </div>
          <div className={styles.compareMini}>
            <div className={styles.row}>
              <strong>Basic</strong><span className={styles.pill}>Static curve tax</span>
            </div>
            <div className={styles.hint}>Static limits.</div>
          </div>
          <div className={styles.compareMini}>
            <div className={styles.row}>
              <strong>Advanced</strong><span className={styles.pill}>Decaying tax</span>
            </div>
            <div className={styles.hint}>Limits with timed removal.</div>
          </div>
        </div>
      </div>

      <div className={styles.inline}>
        <div className={styles.row}>
          <span className={styles.feePill}>
            <span className={styles.feeDot}></span> Creation fee: 
            <strong>{creationFee !== null ? `${fmt.format(creationFee)} ETH` : '—'}</strong>
          </span>
          <span className={styles.kicker}>
            Auto-updates by profile: Basic 0,001/0,003, Advanced 0,01 etc.
          </span>
        </div>
      </div>

      <div className={styles.footerNav}>
        <div></div>
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

export default Step1ChooseType;

