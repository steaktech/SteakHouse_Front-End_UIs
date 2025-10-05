import React from 'react';
import { ProfileType, CurveSettings, FinalTokenType } from './types';
import HelpTooltip from '../../UI/HelpTooltip';
import styles from './CreateTokenModal.module.css';

interface Step3CurveSettingsProps {
  profile: ProfileType | null;
  curves: CurveSettings;
  errors: Record<string, string>;
  onCurveChange: (section: string, field: string, value: string) => void;
  onFinalTypeChange: (profile: ProfileType, type: FinalTokenType) => void;
  onBack: () => void;
  onContinue: () => void;
}

const Step3CurveSettings: React.FC<Step3CurveSettingsProps> = ({
  profile,
  curves,
  errors,
  onCurveChange,
  onFinalTypeChange,
  onBack,
  onContinue
}) => {
  if (!profile) {
    return (
      <div className={styles.panel}>
        <div className={styles.card}>
          <div className={styles.label}>No Profile Selected</div>
          <p>Please go back and select a profile first.</p>
        </div>
        <div className={styles.footerNav}>
          <button className={`${styles.btn} ${styles.btnGhost} ${styles.navButton}`} onClick={onBack}>
            Back
          </button>
        </div>
      </div>
    );
  }

  const renderZeroProfile = () => (
    <div className={`${styles.card} ${styles.profileBlock}`}>
      <div className={styles.label}>
        No Limits Profile
        <HelpTooltip content="Zero launches are always tax-free." />
      </div>

      <div className={styles.card}>
        <div className={styles.label}>Tax Configuration</div>
        <div className={styles.help}>
          Zero launches are designed to be completely tax-free. No tax configuration is needed or allowed.
        </div>
      </div>
    </div>
  );

  const renderSuperProfile = () => (
    <div className={`${styles.card} ${styles.profileBlock}`}>
      <div className={styles.label}>
        Simple Profile
        <HelpTooltip content="Good for beginners who want basic bot protection. Set simple limits to prevent large transactions. Simple launches are always tax-free." />
      </div>

      <div className={styles.grid2}>
        <div className={styles.card}>
          <div className={styles.label}>
            Wallet Limit
            <HelpTooltip content="Maximum tokens one wallet can hold. Example: 2% means one wallet can't hold more than 2% of total supply." />
          </div>
          <input
            className={`${styles.input} ${errors.superMaxWallet ? styles.fieldError : ''}`}
            value={curves.super.maxWallet}
            onChange={(e) => onCurveChange('super', 'maxWallet', e.target.value)}
            placeholder="2% (recommended)"
          />
          {errors.superMaxWallet && <div className={styles.error}>{errors.superMaxWallet}</div>}
        </div>

        <div className={styles.card}>
          <div className={styles.label}>
            Transaction Limit
            <HelpTooltip content="Maximum tokens per transaction. Example: 1% means no single trade can be more than 1% of total supply." />
          </div>
          <input
            className={`${styles.input} ${errors.superMaxTx ? styles.fieldError : ''}`}
            value={curves.super.maxTx}
            onChange={(e) => onCurveChange('super', 'maxTx', e.target.value)}
            placeholder="1% (recommended)"
          />
          {errors.superMaxTx && <div className={styles.error}>{errors.superMaxTx}</div>}
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.label}>Tax Configuration</div>
        <div className={styles.help}>
          Simple launches are designed to be completely tax-free. No tax configuration is needed or allowed.
        </div>
      </div>
    </div>
  );

  const renderBasicProfile = () => (
    <div className={`${styles.card} ${styles.profileBlock}`}>
      <div className={styles.label}>Basic (static)</div>
      <div className={styles.grid3}>
        <div>
          <div className={styles.label}>Starting curve tax (%)</div>
          <input
            className={`${styles.input} ${errors.basicStartTax ? styles.fieldError : ''}`}
            value={curves.basic.startTax}
            onChange={(e) => onCurveChange('basic', 'startTax', e.target.value)}
            placeholder="0 - 100"
          />
          {errors.basicStartTax && <div className={styles.error}>{errors.basicStartTax}</div>}
        </div>
        <div>
          <div className={styles.label}>Tax active for (seconds)</div>
          <input
            className={`${styles.input} ${errors.basicTaxDuration ? styles.fieldError : ''}`}
            value={curves.basic.taxDuration}
            onChange={(e) => onCurveChange('basic', 'taxDuration', e.target.value)}
            placeholder="e.g., 3600"
          />
          {errors.basicTaxDuration && <div className={styles.error}>{errors.basicTaxDuration}</div>}
        </div>
        <div>
          <div className={styles.label}>Final Token Type</div>
          <div className={styles.segmented}>
            <div
              className={`${styles.segment} ${curves.finalType.BASIC === 'NO_TAX' ? styles.active : ''}`}
              onClick={() => onFinalTypeChange('BASIC', 'NO_TAX')}
            >
              NO-TAX
            </div>
            <div
              className={`${styles.segment} ${curves.finalType.BASIC === 'TAX' ? styles.active : ''}`}
              onClick={() => onFinalTypeChange('BASIC', 'TAX')}
            >
              TAX
            </div>
          </div>
          <div className={styles.row} style={{ marginTop: '10px' }}>
            <input
              className={`${styles.input} ${errors.basicFinalTax ? styles.fieldError : ''} ${curves.finalType.BASIC === 'NO_TAX' ? styles.disabled : ''}`}
              value={curves.finalType.BASIC === 'NO_TAX' ? '' : curves.finalTax.BASIC}
              onChange={(e) => onCurveChange('finalTax', 'BASIC', e.target.value)}
              placeholder={curves.finalType.BASIC === 'NO_TAX' ? 'no tax' : 'Final tax rate 0 - 5%'}
              disabled={curves.finalType.BASIC === 'NO_TAX'}
            />
          </div>
          {errors.basicFinalTax && <div className={styles.error}>{errors.basicFinalTax}</div>}
        </div>
      </div>
      <div className={styles.grid3} style={{ marginTop: '8px' }}>
        <div>
          <div className={styles.label}>Max Wallet (tokens)</div>
          <input
            className={`${styles.input} ${errors.basicMaxWallet ? styles.fieldError : ''}`}
            value={curves.basic.maxWallet}
            onChange={(e) => onCurveChange('basic', 'maxWallet', e.target.value)}
            placeholder="tokens"
          />
          <div className={styles.hint}>Active for duration (seconds)</div>
          <input
            className={`${styles.input} ${errors.basicMaxWalletDuration ? styles.fieldError : ''}`}
            value={curves.basic.maxWalletDuration}
            onChange={(e) => onCurveChange('basic', 'maxWalletDuration', e.target.value)}
            placeholder="duration"
            style={{ marginTop: '8px' }}
          />
          {errors.basicMaxWallet && <div className={styles.error}>{errors.basicMaxWallet}</div>}
          {errors.basicMaxWalletDuration && <div className={styles.error}>{errors.basicMaxWalletDuration}</div>}
        </div>
        <div>
          <div className={styles.label}>Max Tx (tokens)</div>
          <input
            className={`${styles.input} ${errors.basicMaxTx ? styles.fieldError : ''}`}
            value={curves.basic.maxTx}
            onChange={(e) => onCurveChange('basic', 'maxTx', e.target.value)}
            placeholder="tokens"
          />
          <div className={styles.hint}>Active for duration (seconds)</div>
          <input
            className={`${styles.input} ${errors.basicMaxTxDuration ? styles.fieldError : ''}`}
            value={curves.basic.maxTxDuration}
            onChange={(e) => onCurveChange('basic', 'maxTxDuration', e.target.value)}
            placeholder="duration"
            style={{ marginTop: '8px' }}
          />
          {errors.basicMaxTx && <div className={styles.error}>{errors.basicMaxTx}</div>}
          {errors.basicMaxTxDuration && <div className={styles.error}>{errors.basicMaxTxDuration}</div>}
        </div>
        <div className={styles.card}>
          <div className={styles.label}>Validation</div>
          <div className={styles.help}>
            Final tax rate ∈ [0,5]. Numbers are uint256-safe; parsed as integers (use wei).
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdvancedProfile = () => (
    <div className={`${styles.card} ${styles.profileBlock}`}>
      <div className={styles.label}>Advanced (dynamic)</div>
      <div className={styles.grid3}>
        <div>
          <div className={styles.label}>Starting curve tax (%)</div>
          <input
            className={`${styles.input} ${errors.advStartTax ? styles.fieldError : ''}`}
            value={curves.advanced.startTax}
            onChange={(e) => onCurveChange('advanced', 'startTax', e.target.value)}
            placeholder="0 - 100"
          />
          {errors.advStartTax && <div className={styles.error}>{errors.advStartTax}</div>}
        </div>
        <div>
          <div className={styles.label}>Tax drop step (%)</div>
          <input
            className={`${styles.input} ${errors.advTaxStep ? styles.fieldError : ''}`}
            value={curves.advanced.taxStep}
            onChange={(e) => onCurveChange('advanced', 'taxStep', e.target.value)}
            placeholder="e.g., 5"
          />
          {errors.advTaxStep && <div className={styles.error}>{errors.advTaxStep}</div>}
        </div>
        <div>
          <div className={styles.label}>Tax drop interval (seconds)</div>
          <input
            className={`${styles.input} ${errors.advTaxInterval ? styles.fieldError : ''}`}
            value={curves.advanced.taxInterval}
            onChange={(e) => onCurveChange('advanced', 'taxInterval', e.target.value)}
            placeholder="e.g., 300"
          />
          {errors.advTaxInterval && <div className={styles.error}>{errors.advTaxInterval}</div>}
        </div>
      </div>

      <div className={styles.grid3} style={{ marginTop: '8px' }}>
        <div>
          <div className={styles.label}>Max Wallet start (tokens)</div>
          <input
            className={`${styles.input} ${errors.advMaxWStart ? styles.fieldError : ''}`}
            value={curves.advanced.maxWStart}
            onChange={(e) => onCurveChange('advanced', 'maxWStart', e.target.value)}
            placeholder="tokens"
          />
          <div className={styles.hint}>Increase step (tokens)</div>
          <input
            className={`${styles.input} ${errors.advMaxWStep ? styles.fieldError : ''}`}
            value={curves.advanced.maxWStep}
            onChange={(e) => onCurveChange('advanced', 'maxWStep', e.target.value)}
            placeholder="tokens/step"
            style={{ marginTop: '8px' }}
          />
          <div className={styles.hint}>Step interval (seconds)</div>
          <input
            className={`${styles.input} ${errors.advMaxWInterval ? styles.fieldError : ''}`}
            value={curves.advanced.maxWInterval}
            onChange={(e) => onCurveChange('advanced', 'maxWInterval', e.target.value)}
            placeholder="e.g., 300"
            style={{ marginTop: '8px' }}
          />
          {errors.advMaxW && <div className={styles.error}>{errors.advMaxW}</div>}
        </div>
        <div>
          <div className={styles.label}>Max Tx start (tokens)</div>
          <input
            className={`${styles.input} ${errors.advMaxTStart ? styles.fieldError : ''}`}
            value={curves.advanced.maxTStart}
            onChange={(e) => onCurveChange('advanced', 'maxTStart', e.target.value)}
            placeholder="tokens"
          />
          <div className={styles.hint}>Increase step (tokens)</div>
          <input
            className={`${styles.input} ${errors.advMaxTStep ? styles.fieldError : ''}`}
            value={curves.advanced.maxTStep}
            onChange={(e) => onCurveChange('advanced', 'maxTStep', e.target.value)}
            placeholder="tokens/step"
            style={{ marginTop: '8px' }}
          />
          <div className={styles.hint}>Step interval (seconds)</div>
          <input
            className={`${styles.input} ${errors.advMaxTInterval ? styles.fieldError : ''}`}
            value={curves.advanced.maxTInterval}
            onChange={(e) => onCurveChange('advanced', 'maxTInterval', e.target.value)}
            placeholder="e.g., 300"
            style={{ marginTop: '8px' }}
          />
          {errors.advMaxT && <div className={styles.error}>{errors.advMaxT}</div>}
        </div>
        <div>
          <div className={styles.label}>Remove all limits after (seconds)</div>
          <input
            className={`${styles.input} ${errors.advRemoveAfter ? styles.fieldError : ''}`}
            value={curves.advanced.removeAfter}
            onChange={(e) => onCurveChange('advanced', 'removeAfter', e.target.value)}
            placeholder="e.g., 3600"
          />
          <div className={styles.label} style={{ marginTop: '10px' }}>Tax receiver (address)</div>
          <input
            className={`${styles.input} ${errors.advTaxReceiver ? styles.fieldError : ''}`}
            value={curves.advanced.taxReceiver}
            onChange={(e) => onCurveChange('advanced', 'taxReceiver', e.target.value)}
            placeholder="0x..."
          />
          {errors.advRemoveAfter && <div className={styles.error}>{errors.advRemoveAfter}</div>}
          {errors.advTaxReceiver && <div className={styles.error}>{errors.advTaxReceiver}</div>}
        </div>
      </div>

      <div className={styles.grid3} style={{ marginTop: '8px' }}>
        <div>
          <div className={styles.label}>Final Token Type</div>
          <div className={styles.segmented}>
            <div
              className={`${styles.segment} ${curves.finalType.ADVANCED === 'NO_TAX' ? styles.active : ''}`}
              onClick={() => onFinalTypeChange('ADVANCED', 'NO_TAX')}
            >
              NO-TAX
            </div>
            <div
              className={`${styles.segment} ${curves.finalType.ADVANCED === 'TAX' ? styles.active : ''}`}
              onClick={() => onFinalTypeChange('ADVANCED', 'TAX')}
            >
              TAX
            </div>
          </div>
        </div>
        <div>
          <div className={styles.label}>Final tax rate (%)</div>
          <input
            className={`${styles.input} ${errors.advFinalTax ? styles.fieldError : ''} ${curves.finalType.ADVANCED === 'NO_TAX' ? styles.disabled : ''}`}
            value={curves.finalType.ADVANCED === 'NO_TAX' ? '' : curves.finalTax.ADVANCED}
            onChange={(e) => onCurveChange('finalTax', 'ADVANCED', e.target.value)}
            placeholder={curves.finalType.ADVANCED === 'NO_TAX' ? 'no tax' : '0 - 5'}
            disabled={curves.finalType.ADVANCED === 'NO_TAX'}
          />
          {errors.advFinalTax && <div className={styles.error}>{errors.advFinalTax}</div>}
        </div>
        <div className={styles.card}>
          <div className={styles.label}>Shared validations</div>
          <div className={styles.help}>
            • Final tax rate ∈ [0,5]<br />
            • If any step &gt; 0, corresponding interval &gt; 0<br />
            • Use integer math (parseUnits) for tokens; no floats.
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfileContent = () => {
    switch (profile) {
      case 'ZERO': return renderZeroProfile();
      case 'SUPER': return renderSuperProfile();
      case 'BASIC': return renderBasicProfile();
      case 'ADVANCED': return renderAdvancedProfile();
      default: return null;
    }
  };

  return (
    <div className={styles.panel}>
      {errors.curveErrors && (
        <div className={`${styles.error} ${styles.errorInlineMsg}`}>
          {errors.curveErrors}
        </div>
      )}

      {renderProfileContent()}

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

export default Step3CurveSettings;
