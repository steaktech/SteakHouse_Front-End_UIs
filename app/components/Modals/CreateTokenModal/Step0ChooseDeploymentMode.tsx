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
          <HelpTooltip content="Select how you want to deploy your token. Virtual Curve uses our bonding curve system, while Direct Deploy deploys directly to Uniswap V2." />
        </div>

        <div className={styles.radioCards}>
          <div
            className={`${styles.radioCard} ${deploymentMode === 'VIRTUAL_CURVE' ? styles.active : ''}`}
            onClick={() => onDeploymentModeChange('VIRTUAL_CURVE')}
            style={{ display: 'flex', flexDirection: 'column', gap: '8px', height: 'auto' }}
          >
            <div className="title">Virtual Curve</div>
            <div className="desc">Bonding curve with graduation to Uniswap V2</div>

            <div style={{ fontSize: '0.9em', opacity: 0.8, marginBottom: '8px' }}>
              Best for projects without funding. This allows creators to launch with a upfront cost starting at $3.
            </div>

            <div style={{ fontWeight: 'bold', fontSize: '0.8em', letterSpacing: '1px', marginTop: '4px' }}>BENEFITS</div>
            <div className={styles.features}>
              <div className={styles.feature}>• 20x Lower deployment costs (0.0005 - 0.01 ETH)</div>
              <div className={styles.feature}>• Anti-bot/snipe protection</div>
              <div className={styles.feature}>• Trading limits for fair distribution</div>
              <div className={styles.feature}>• $0 upfront Liquidity costs</div>
              <div className={styles.feature}>• Highest Creator rewards</div>
            </div>

            <details style={{ marginTop: '8px', fontSize: '0.9em' }}>
              <summary style={{ cursor: 'pointer', color: '#888' }}>More Info</summary>
              <div style={{ marginTop: '8px', fontStyle: 'italic', opacity: 0.7, lineHeight: '1.4' }}>
                "No liquidity needed, negligible gas fees for deployment due to Virtual Storage, and up to 20% trading taxes at early stages to raise project funds and fill the Treasury while enabling fair trading instantly."
              </div>
            </details>
          </div>

          <div
            className={`${styles.radioCard} ${deploymentMode === 'V2_LAUNCH' ? styles.active : ''}`}
            onClick={() => onDeploymentModeChange('V2_LAUNCH')}
            style={{ display: 'flex', flexDirection: 'column', gap: '8px', height: 'auto' }}
          >
            <div className="title">Direct Deploy</div>
            <div className="desc">Deploy directly on chain and seed your own LP to Uniswap V2</div>

            <div style={{ fontSize: '0.9em', opacity: 0.8, marginBottom: '8px' }}>
              Best for teams that have funding and want to deploy their own contracts with full control.
            </div>

            <div style={{ fontWeight: 'bold', fontSize: '0.8em', letterSpacing: '1px', marginTop: '4px' }}>BENEFITS</div>
            <div className={styles.features}>
              <div className={styles.feature}>• Instant contract deployment</div>
              <div className={styles.feature}>• Interface for Pool creation</div>
              <div className={styles.feature}>• Custom taxes & limits</div>
              <div className={styles.feature}>• Anti-sniper protected launches</div>
              <div className={styles.feature}>• Full Token control</div>
            </div>

            <details style={{ marginTop: '8px', fontSize: '0.9em' }}>
              <summary style={{ cursor: 'pointer', color: '#888' }}>More Info</summary>
              <div style={{ marginTop: '8px', fontStyle: 'italic', opacity: 0.7, lineHeight: '1.4' }}>
                "For teams who want to deploy their own contract directly on chain and manually, while using our safe and Audited minimal ERC-20's and full tax and limits customization by filling in checkbox values and not having to craft a complex solidity written ca on their own for speed and simplicity purposes.
                <br /><br />
                Launch options allow for deployment followed by adding liquidity at a later date, or the use our 1 tx deploy, add lp and launch via private bloxroute routed transaction to keep launch out of public mempool to evade snipers and bots."
              </div>
            </details>
          </div>
        </div>

        {errors.step0 && <div className={styles.error}>{errors.step0}</div>}
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
