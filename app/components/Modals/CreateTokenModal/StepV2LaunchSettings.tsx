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

  const handleAdvancedTaxConfigChange = (field: string, value: any) => {
    onV2SettingsChange('advancedTaxConfig', {
      ...v2Settings.advancedTaxConfig,
      [field]: value
    });
  };

  const handleAdvancedLimitsConfigChange = (field: string, value: any) => {
    onV2SettingsChange('advancedLimitsConfig', {
      ...v2Settings.advancedLimitsConfig,
      [field]: value
    });
  };

  const handleStealthConfigChange = (field: string, value: any) => {
    onV2SettingsChange('stealthConfig', {
      ...v2Settings.stealthConfig,
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
        
        {/* Advanced Tax Configuration Toggle */}
        <label className={styles.switch} style={{ marginTop: '16px' }}>
          <input
            type="checkbox"
            className={styles.switchInput}
            checked={v2Settings.advancedTaxConfig.enabled}
            onChange={(e) => handleAdvancedTaxConfigChange('enabled', e.target.checked)}
          />
          <span className={styles.switchLabel}>Enable Advanced Tax Configuration (Dynamic Tax Reduction)</span>
        </label>
        
        {/* Advanced Tax Configuration Fields */}
        {v2Settings.advancedTaxConfig.enabled && (
          <div className={styles.grid2} style={{ marginTop: '12px' }}>
            <div>
              <label className={styles.label}>Start Tax (%)</label>
              <input
                className={`${styles.input} ${errors.advStartTax ? styles.fieldError : ''}`}
                value={v2Settings.advancedTaxConfig.startTax}
                onChange={(e) => handleAdvancedTaxConfigChange('startTax', e.target.value)}
                placeholder="20"
              />
              {errors.advStartTax && <div className={styles.error}>{errors.advStartTax}</div>}
            </div>
            <div>
              <label className={styles.label}>Final Tax (%)</label>
              <input
                className={`${styles.input} ${errors.advFinalTax ? styles.fieldError : ''}`}
                value={v2Settings.advancedTaxConfig.finalTax}
                onChange={(e) => handleAdvancedTaxConfigChange('finalTax', e.target.value)}
                placeholder="3"
              />
              {errors.advFinalTax && <div className={styles.error}>{errors.advFinalTax}</div>}
            </div>
            <div>
              <label className={styles.label}>Tax Drop Interval (seconds)</label>
              <input
                className={`${styles.input} ${errors.advTaxDropInterval ? styles.fieldError : ''}`}
                value={v2Settings.advancedTaxConfig.taxDropInterval}
                onChange={(e) => handleAdvancedTaxConfigChange('taxDropInterval', e.target.value)}
                placeholder="3600"
              />
              {errors.advTaxDropInterval && <div className={styles.error}>{errors.advTaxDropInterval}</div>}
            </div>
            <div>
              <label className={styles.label}>Tax Drop Step (%)</label>
              <input
                className={`${styles.input} ${errors.advTaxDropStep ? styles.fieldError : ''}`}
                value={v2Settings.advancedTaxConfig.taxDropStep}
                onChange={(e) => handleAdvancedTaxConfigChange('taxDropStep', e.target.value)}
                placeholder="1"
              />
              {errors.advTaxDropStep && <div className={styles.error}>{errors.advTaxDropStep}</div>}
            </div>
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
        
        {/* Advanced Limits Configuration Toggle */}
        <label className={styles.switch} style={{ marginTop: '12px' }}>
          <input
            type="checkbox"
            className={styles.switchInput}
            checked={v2Settings.advancedLimitsConfig.enabled}
            onChange={(e) => handleAdvancedLimitsConfigChange('enabled', e.target.checked)}
          />
          <span className={styles.switchLabel}>Enable Dynamic Limits (Progressive Limit Increases)</span>
        </label>
        
        {/* Advanced Limits Configuration Fields */}
        {v2Settings.advancedLimitsConfig.enabled && (
          <div style={{ marginTop: '12px' }}>
            <div className={styles.grid2}>
              <div>
                <label className={styles.label}>Start Max Transaction (% of supply)</label>
                <input
                  className={`${styles.input} ${errors.advStartMaxTx ? styles.fieldError : ''}`}
                  value={v2Settings.advancedLimitsConfig.startMaxTx}
                  onChange={(e) => handleAdvancedLimitsConfigChange('startMaxTx', e.target.value)}
                  placeholder="1"
                />
                {errors.advStartMaxTx && <div className={styles.error}>{errors.advStartMaxTx}</div>}
              </div>
              <div>
                <label className={styles.label}>Max Transaction Step (% increase)</label>
                <input
                  className={`${styles.input} ${errors.advMaxTxStep ? styles.fieldError : ''}`}
                  value={v2Settings.advancedLimitsConfig.maxTxStep}
                  onChange={(e) => handleAdvancedLimitsConfigChange('maxTxStep', e.target.value)}
                  placeholder="0.5"
                />
                {errors.advMaxTxStep && <div className={styles.error}>{errors.advMaxTxStep}</div>}
              </div>
              <div>
                <label className={styles.label}>Start Max Wallet (% of supply)</label>
                <input
                  className={`${styles.input} ${errors.advStartMaxWallet ? styles.fieldError : ''}`}
                  value={v2Settings.advancedLimitsConfig.startMaxWallet}
                  onChange={(e) => handleAdvancedLimitsConfigChange('startMaxWallet', e.target.value)}
                  placeholder="2"
                />
                {errors.advStartMaxWallet && <div className={styles.error}>{errors.advStartMaxWallet}</div>}
              </div>
              <div>
                <label className={styles.label}>Max Wallet Step (% increase)</label>
                <input
                  className={`${styles.input} ${errors.advMaxWalletStep ? styles.fieldError : ''}`}
                  value={v2Settings.advancedLimitsConfig.maxWalletStep}
                  onChange={(e) => handleAdvancedLimitsConfigChange('maxWalletStep', e.target.value)}
                  placeholder="0.1"
                />
                {errors.advMaxWalletStep && <div className={styles.error}>{errors.advMaxWalletStep}</div>}
              </div>
            </div>
            <div style={{ marginTop: '8px' }}>
              <label className={styles.label}>Limits Increase Interval (seconds)</label>
              <input
                className={`${styles.input} ${errors.advLimitsInterval ? styles.fieldError : ''}`}
                value={v2Settings.advancedLimitsConfig.limitsInterval}
                onChange={(e) => handleAdvancedLimitsConfigChange('limitsInterval', e.target.value)}
                placeholder="3600"
              />
              {errors.advLimitsInterval && <div className={styles.error}>{errors.advLimitsInterval}</div>}
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
