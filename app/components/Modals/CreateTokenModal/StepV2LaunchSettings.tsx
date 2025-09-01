import React from 'react';
import { V2LaunchSettings, V2EnableTradingMode } from './types';
import HelpTooltip from '../../UI/HelpTooltip';
import styles from './CreateTokenModal.module.css';

interface StepV2LaunchSettingsProps {
  v2Settings: V2LaunchSettings;
  errors: Record<string, string>;
  onV2SettingsChange: (field: string, value: any) => void;
  onBack: () => void;
  onContinue: () => void;
}

const StepV2LaunchSettings: React.FC<StepV2LaunchSettingsProps> = ({
  v2Settings,
  errors,
  onV2SettingsChange,
  onBack,
  onContinue
}) => {
  const handleEnableTradingChange = (mode: V2EnableTradingMode) => {
    onV2SettingsChange('enableTradingMode', mode);
  };

  const handleTaxSettingsChange = (field: string, value: string) => {
    onV2SettingsChange('taxSettings', {
      ...v2Settings.taxSettings,
      [field]: value
    });
  };

  const handleLimitsChange = (field: string, value: any) => {
    onV2SettingsChange('limits', {
      ...v2Settings.limits,
      [field]: value
    });
  };

  return (
    <div className={styles.panel}>
      {/* Trading Mode Selection */}
      <div className={styles.card}>
        <div className={styles.label}>
          Trading Mode
          <HelpTooltip content="Deploy Only: Just creates the token contract. Full Launch: Creates token + adds liquidity + enables trading in one transaction (anti-sniper protection)." />
        </div>
        <div className={styles.radioCards}>
          <div 
            className={`${styles.radioCard} ${v2Settings.enableTradingMode === 'DEPLOY_ONLY' ? styles.active : ''}`}
            onClick={() => handleEnableTradingChange('DEPLOY_ONLY')}
          >
            <div className="title">Deploy Only</div>
            <div className="desc">Create token contract, add LP & enable trading manually later</div>
          </div>
          <div 
            className={`${styles.radioCard} ${v2Settings.enableTradingMode === 'FULL_LAUNCH' ? styles.active : ''}`}
            onClick={() => handleEnableTradingChange('FULL_LAUNCH')}
          >
            <div className="title">Full Launch</div>
            <div className="desc">Deploy + Add LP + Enable trading in one atomic transaction</div>
          </div>
        </div>
      </div>

      {/* Initial Liquidity (only for full launch) */}
      {v2Settings.enableTradingMode === 'FULL_LAUNCH' && (
        <div className={styles.card}>
          <div className={styles.label}>
            Initial Liquidity (ETH)
            <HelpTooltip content="Amount of ETH to pair with your tokens in the initial liquidity pool. Higher amounts create better price stability." />
          </div>
          <input
            className={`${styles.input} ${errors.initialLiquidityETH ? styles.fieldError : ''}`}
            value={v2Settings.initialLiquidityETH}
            onChange={(e) => onV2SettingsChange('initialLiquidityETH', e.target.value)}
            placeholder="1.0"
          />
          {errors.initialLiquidityETH && <div className={styles.error}>{errors.initialLiquidityETH}</div>}
        </div>
      )}

      {/* Tax Settings */}
      <div className={styles.card}>
        <div className={styles.label}>
          Tax Configuration
          <HelpTooltip content="Set buy and sell taxes for your token. Leave at 0% for no taxes. Max 100% each." />
        </div>
        <div className={styles.grid2}>
          <div>
            <label className={styles.label}>Buy Tax (%)</label>
            <input
              className={`${styles.input} ${errors.buyTax ? styles.fieldError : ''}`}
              value={v2Settings.taxSettings.buyTax}
              onChange={(e) => handleTaxSettingsChange('buyTax', e.target.value)}
              placeholder="0"
            />
            {errors.buyTax && <div className={styles.error}>{errors.buyTax}</div>}
          </div>
          <div>
            <label className={styles.label}>Sell Tax (%)</label>
            <input
              className={`${styles.input} ${errors.sellTax ? styles.fieldError : ''}`}
              value={v2Settings.taxSettings.sellTax}
              onChange={(e) => handleTaxSettingsChange('sellTax', e.target.value)}
              placeholder="0"
            />
            {errors.sellTax && <div className={styles.error}>{errors.sellTax}</div>}
          </div>
        </div>
        
        {(Number(v2Settings.taxSettings.buyTax) > 0 || Number(v2Settings.taxSettings.sellTax) > 0) && (
          <div>
            <label className={styles.label}>Tax Receiver Address</label>
            <input
              className={`${styles.input} ${errors.taxReceiver ? styles.fieldError : ''}`}
              value={v2Settings.taxSettings.taxReceiver}
              onChange={(e) => handleTaxSettingsChange('taxReceiver', e.target.value)}
              placeholder="0x..."
            />
            {errors.taxReceiver && <div className={styles.error}>{errors.taxReceiver}</div>}
          </div>
        )}
      </div>

      {/* Trading Limits */}
      <div className={styles.card}>
        <div className={styles.label}>
          Trading Limits
          <HelpTooltip content="Set maximum wallet size and transaction size as percentage of total supply. Useful for anti-whale protection." />
        </div>
        
        <label className={styles.switch}>
          <input
            type="checkbox"
            className={styles.switchInput}
            checked={v2Settings.limits.enableLimits}
            onChange={(e) => handleLimitsChange('enableLimits', e.target.checked)}
          />
          <span className={styles.switchLabel}>Enable Trading Limits</span>
        </label>

        {v2Settings.limits.enableLimits && (
          <div className={styles.grid2} style={{ marginTop: '12px' }}>
            <div>
              <label className={styles.label}>Max Wallet (% of supply)</label>
              <input
                className={`${styles.input} ${errors.maxWallet ? styles.fieldError : ''}`}
                value={v2Settings.limits.maxWallet}
                onChange={(e) => handleLimitsChange('maxWallet', e.target.value)}
                placeholder="2"
              />
              {errors.maxWallet && <div className={styles.error}>{errors.maxWallet}</div>}
            </div>
            <div>
              <label className={styles.label}>Max Transaction (% of supply)</label>
              <input
                className={`${styles.input} ${errors.maxTx ? styles.fieldError : ''}`}
                value={v2Settings.limits.maxTx}
                onChange={(e) => handleLimitsChange('maxTx', e.target.value)}
                placeholder="2"
              />
              {errors.maxTx && <div className={styles.error}>{errors.maxTx}</div>}
            </div>
          </div>
        )}
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

export default StepV2LaunchSettings;
