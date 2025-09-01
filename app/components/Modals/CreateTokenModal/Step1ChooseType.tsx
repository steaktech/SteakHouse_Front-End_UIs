import React from 'react';
import { ProfileType, TaxMode } from './types';
import { fmt } from './utils';
import HelpTooltip from '../../UI/HelpTooltip';
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
    // Since we removed the Trading Style selection, all profiles are available
    return true;
  };

  const getProfileTitle = (profileType: ProfileType) => {
    switch (profileType) {
      case 'ZERO': return 'Zero';
      case 'SUPER': return 'Simple';
      case 'BASIC': return 'Basic';
      case 'ADVANCED': return 'Advanced';
    }
  };

  const getProfileDescription = (profileType: ProfileType) => {
    switch (profileType) {
      case 'ZERO': return 'No tax, no limits, no max wallet';
      case 'SUPER': return 'No tax, limits and max wallet apply';
      case 'BASIC': return 'Static tax and limits for a set duration of time then lifted';
      case 'ADVANCED': return 'Block based incremental tax decrease and limits increase';
    }
  };

  const getProfileTooltip = (profileType: ProfileType) => {
    switch (profileType) {
      case 'ZERO': return '0% curve tax, no limits. Fast and frictionless trading for maximum accessibility.';
      case 'SUPER': return '0% curve tax with static Max Tx/Wallet limits for basic bot protection.';
      case 'BASIC': return 'Static curve tax and static limits for a fixed duration. Good balance of protection and simplicity.';
      case 'ADVANCED': return 'Decaying tax & limits with timed removal. Highly configurable with maximum flexibility.';
    }
  };

  return (
    <div className={styles.panel}>

      {/* Simplified Profile Selection */}
      <div className={styles.card}>
        <div className={styles.label}>
          Complexity Level 
          <HelpTooltip content="Choose your preferred level of control. Beginners should start with 'Zero' or 'Simple'. Advanced users can choose 'Advanced' for maximum customization." />
        </div>
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
              <div className="title">
                {getProfileTitle(profileType)}
                <HelpTooltip content={getProfileTooltip(profileType)} className="ml-2" />
              </div>
              <div className="desc">{getProfileDescription(profileType)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Simplified Fee Information */}
      <div className={styles.inline}>
        <div className={styles.row}>
          <span className={styles.feePill}>
            <span className={styles.feeDot}></span> Creation fee: 
            <strong>{creationFee !== null ? `${fmt.format(creationFee)} ETH` : '—'}</strong>
            <HelpTooltip content="Fee varies by complexity: Zero costs 0.0005 ETH, Simple costs 0.001 ETH, Basic costs 0.003 ETH, Advanced costs 0.01 ETH." className="ml-2" />
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

