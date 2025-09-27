import React from 'react';
import { DeploymentMode } from './types';
import HelpTooltip from '../../UI/HelpTooltip';
import styles from './CreateTokenModal.module.css';

interface Step0ChooseDeploymentModeProps {
  deploymentMode: DeploymentMode | null;
  errors: Record<string, string>;
  onDeploymentModeChange: (mode: DeploymentMode) => void;
  onContinue: () => void;
}

const Step0ChooseDeploymentMode: React.FC<Step0ChooseDeploymentModeProps> = ({
  deploymentMode,
  errors,
  onDeploymentModeChange,
  onContinue
}) => {
  return (
    <div className={styles.panel}>
      <div className={styles.card}>
        <div className={styles.label}>
          Choose Deployment Type
          <HelpTooltip content="Select how you want to deploy your token. Virtual Curve uses our bonding curve system, while V2 Launch deploys directly to Uniswap V2." />
        </div>

        <div className={styles.radioCards}>
          <div
            className={`${styles.radioCard} ${deploymentMode === 'VIRTUAL_CURVE' ? styles.active : ''}`}
            onClick={() => onDeploymentModeChange('VIRTUAL_CURVE')}
          >
            <div className="title">Virtual Curve</div>
            <div className="desc">Bonding curve with graduation to Uniswap</div>
            <div className={styles.features}>
              <div className={styles.feature}>• Lower costs (0.0005 - 0.01 ETH)</div>
              <div className={styles.feature}>• Anti-bot protection</div>
              <div className={styles.feature}>• Organic price discovery</div>
            </div>
          </div>

          <div
            className={`${styles.radioCard} ${deploymentMode === 'V2_LAUNCH' ? styles.active : ''}`}
            onClick={() => onDeploymentModeChange('V2_LAUNCH')}
          >
            <div className="title">Direct V2 Launch</div>
            <div className="desc">Deploy directly to Uniswap V2</div>
            <div className={styles.features}>
              <div className={styles.feature}>• Instant trading</div>
              <div className={styles.feature}>• Custom taxes & limits</div>
              <div className={styles.feature}>• Anti-sniper protection</div>
            </div>
          </div>
        </div>

        {errors.step0 && <div className={styles.error}>{errors.step0}</div>}
      </div>

      <div className={styles.comparisonInfo}>
        <div className={styles.comparisonCard}>
          <div className={styles.comparisonTitle}>Virtual Curve</div>
          <div className={styles.comparisonDesc}>
            Best for projects without funding. This allows projects to launch with a cost of up to $3.
          </div>
        </div>
        <div className={styles.comparisonCard}>
          <div className={styles.comparisonTitle}>V2 Launch</div>
          <div className={styles.comparisonDesc}>
            Best for immediate Uniswap listing with full control.
          </div>
        </div>
      </div>

      <div className={styles.footerNav}>
        <div></div>
        <button
          className={`${styles.btn} ${styles.btnPrimary} ${styles.navButton}`}
          onClick={onContinue}
          disabled={!deploymentMode}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default Step0ChooseDeploymentMode;
