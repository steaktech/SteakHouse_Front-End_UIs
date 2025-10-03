import React from 'react';
import { TokenBasics, DeploymentMode } from './types';
import HelpTooltip from '../../UI/HelpTooltip';
import styles from './CreateTokenModal.module.css';

interface Step2TokenBasicsProps {
  basics: TokenBasics;
  deploymentMode: DeploymentMode | null;
  errors: Record<string, string>;
  onBasicsChange: (field: string, value: any) => void;
  onBack: () => void;
  onContinue: () => void;
}

const Step2TokenBasics: React.FC<Step2TokenBasicsProps> = ({
  basics,
  deploymentMode,
  errors,
  onBasicsChange,
  onBack,
  onContinue
}) => {
  return (
    <div className={styles.panel}>
      {/* For V2 Launch, use a more compact layout */}
      {deploymentMode === 'V2_LAUNCH' ? (
        <>
          <div className={styles.card}>
            <div className={styles.grid2}>
              <div>
                <label className={styles.label}>Token Name</label>
                <input
                  className={`${styles.input} ${errors.name ? styles.fieldError : ''}`}
                  value={basics.name}
                  onChange={(e) => onBasicsChange('name', e.target.value)}
                  placeholder="e.g., MoonCoin"
                />
                {errors.name && <div className={styles.error}>{errors.name}</div>}
              </div>
              <div>
                <label className={styles.label}>
                  Symbol
                  <HelpTooltip content="Short identifier for your token, typically 3-5 characters. This will appear on exchanges and wallets." />
                </label>
                <input
                  className={`${styles.input} ${errors.symbol ? styles.fieldError : ''}`}
                  value={basics.symbol}
                  onChange={(e) => onBasicsChange('symbol', e.target.value)}
                  placeholder="e.g., MOON"
                  maxLength={12}
                />
                {errors.symbol && <div className={styles.error}>{errors.symbol}</div>}
              </div>
            </div>
          </div>
          
          <div className={styles.card}>
            <div className={styles.grid2}>
              <div>
                <label className={styles.label}>
                  Total Supply
                  <HelpTooltip content="The total number of tokens that will exist. Default is 1 billion tokens. Use whole numbers only." />
                </label>
                <input
                  className={`${styles.input} ${errors.totalSupply ? styles.fieldError : ''}`}
                  value={basics.totalSupply}
                  onChange={(e) => onBasicsChange('totalSupply', e.target.value)}
                  placeholder="1000000000"
                />
                {errors.totalSupply && <div className={styles.error}>{errors.totalSupply}</div>}
              </div>
              <div>
                <div className={styles.label}>
                  Liquidity
                  <HelpTooltip content="Choose what happens to liquidity tokens after deployment. Lock = secure but recoverable, Burn = permanent and trustless." />
                </div>
                <div className={styles.segmented}>
                  <div
                    className={`${styles.segment} ${basics.lpMode === 'LOCK' ? styles.active : ''}`}
                    onClick={() => onBasicsChange('lpMode', 'LOCK')}
                  >
                    Lock (Recommended)
                  </div>
                  <div
                    className={`${styles.segment} ${basics.lpMode === 'BURN' ? styles.active : ''}`}
                    onClick={() => onBasicsChange('lpMode', 'BURN')}
                  >
                    Burn
                  </div>
                </div>
                {basics.lpMode === 'LOCK' && (
                  <div style={{ marginTop: '8px' }}>
                    <div className={styles.inline}>
                      <input
                        className={`${styles.input} ${errors.lockDays ? styles.fieldError : ''}`}
                        value={basics.lockDays}
                        onChange={(e) => onBasicsChange('lockDays', Number(e.target.value))}
                        placeholder="30"
                      />
                      <span className={styles.unit}>days</span>
                    </div>
                    {errors.lockDays && <div className={styles.error}>{errors.lockDays}</div>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Original layout for Virtual Curve */
        <div className={styles.grid2}>
          <div className={styles.card}>
            <label className={styles.label}>Token Name</label>
            <input
              className={`${styles.input} ${errors.name ? styles.fieldError : ''}`}
              value={basics.name}
              onChange={(e) => onBasicsChange('name', e.target.value)}
              placeholder="e.g., MoonCoin"
            />
            {errors.name && <div className={styles.error}>{errors.name}</div>}
          </div>
          <div className={styles.card}>
            <label className={styles.label}>
              Symbol
              <HelpTooltip content="Short identifier for your token, typically 3-5 characters. This will appear on exchanges and wallets." />
            </label>
            <input
              className={`${styles.input} ${errors.symbol ? styles.fieldError : ''}`}
              value={basics.symbol}
              onChange={(e) => onBasicsChange('symbol', e.target.value)}
              placeholder="e.g., MOON"
              maxLength={12}
            />
            {errors.symbol && <div className={styles.error}>{errors.symbol}</div>}
          </div>

          {/* Only show Category for Virtual Curve deployment */}
          {(deploymentMode === 'VIRTUAL_CURVE') && (
            <div className={styles.card}>
              <label className={styles.label}>
                Category
                <HelpTooltip content="Choose the type that best describes your token's purpose. This helps users understand what your token is for." />
              </label>
              <div className={styles.radioCards}>
                {(['Meme', 'Utility', 'AI', 'X-post'] as const).map(category => (
                  <div
                    key={category}
                    className={`${styles.radioCard} ${basics.tokenCategory === category ? styles.active : ''}`}
                    onClick={() => onBasicsChange('tokenCategory', category)}
                  >
                    <div className="title">{category}</div>
                    <div className="desc">
                      {category === 'Meme' && 'Fun & community'}
                      {category === 'Utility' && 'Practical use'}
                      {category === 'AI' && 'AI-powered'}
                      {category === 'X-post' && 'Social platform'}
                    </div>
                  </div>
                ))}
              </div>
              {errors.tokenCategory && <div className={styles.error}>{errors.tokenCategory}</div>}
            </div>
          )}

          <div className={styles.card}>
            <label className={styles.label}>
              Total Supply
              <HelpTooltip content="The total number of tokens that will exist. Default is 1 billion tokens. Use whole numbers only." />
            </label>
            <input
              className={`${styles.input} ${errors.totalSupply ? styles.fieldError : ''}`}
              value={basics.totalSupply}
              onChange={(e) => onBasicsChange('totalSupply', e.target.value)}
              placeholder="1000000000"
            />
            {errors.totalSupply && <div className={styles.error}>{errors.totalSupply}</div>}
          </div>
          {/* Only show Graduation Cap for Virtual Curve deployment */}
          {(deploymentMode === 'VIRTUAL_CURVE') && (
            <div className={styles.card}>
              <label className={styles.label}>
                Graduation Cap ($)
                <HelpTooltip content="The dollar value target your token must reach before it graduates to a full exchange. This represents the market cap goal, not token quantity." />
              </label>
              <input
                className={`${styles.input} ${errors.gradCap ? styles.fieldError : ''}`}
                value={basics.gradCap}
                onChange={(e) => onBasicsChange('gradCap', e.target.value)}
                placeholder="e.g., 100000 (for $100K market cap)"
              />
              {errors.gradCap && <div className={styles.error}>{errors.gradCap}</div>}
            </div>
          )}
        </div>
      )}

      {/* Only show additional sections for Virtual Curve deployment */}
      {(deploymentMode === 'VIRTUAL_CURVE') && (
        <div className={styles.grid3}>
          <div className={styles.card}>
            <div className={styles.label}>
              Launch Time
              <HelpTooltip content="Choose when your token will become available for trading. Most tokens start immediately." />
            </div>
            <div className={styles.segmented}>
              <div
                className={`${styles.segment} ${basics.startMode === 'NOW' ? styles.active : ''}`}
                onClick={() => onBasicsChange('startMode', 'NOW')}
              >
                Launch Now
              </div>
              <div
                className={`${styles.segment} ${basics.startMode === 'SCHEDULE' ? styles.active : ''}`}
                onClick={() => onBasicsChange('startMode', 'SCHEDULE')}
              >
                Schedule Launch
              </div>
            </div>
            {basics.startMode === 'SCHEDULE' && (
              <div className={styles.row} style={{ marginTop: '10px' }}>
                <input
                  className={`${styles.input} ${errors.startTime ? styles.fieldError : ''}`}
                  type="datetime-local"
                  onChange={(e) => onBasicsChange('launchDateTime', e.target.value)}
                />
              </div>
            )}
            {errors.startTime && <div className={styles.error}>{errors.startTime}</div>}
          </div>

          <div className={styles.card}>
            <div className={styles.label}>
              Liquidity
              <HelpTooltip content="Choose what happens to liquidity tokens after graduation. Lock = secure but recoverable by the creator of the token, Burn = permanent and trustless." />
            </div>
            <div className={styles.segmented}>
              <div
                className={`${styles.segment} ${basics.lpMode === 'LOCK' ? styles.active : ''}`}
                onClick={() => onBasicsChange('lpMode', 'LOCK')}
              >
                Lock (Recommended)
              </div>
              <div
                className={`${styles.segment} ${basics.lpMode === 'BURN' ? styles.active : ''}`}
                onClick={() => onBasicsChange('lpMode', 'BURN')}
              >
                Burn
              </div>
            </div>
            {basics.lpMode === 'LOCK' && (
              <div style={{ marginTop: '10px' }}>
                <div className={styles.inline}>
                  <input
                    className={`${styles.input} ${errors.lockDays ? styles.fieldError : ''}`}
                    value={basics.lockDays}
                    onChange={(e) => onBasicsChange('lockDays', Number(e.target.value))}
                    placeholder="30"
                  />
                  <span className={styles.unit}>days</span>
                </div>
                {errors.lockDays && <div className={styles.error}>{errors.lockDays}</div>}
              </div>
            )}
          </div>

          <div className={styles.card}>
            <div className={styles.label}>
              Options
              <HelpTooltip content="Additional features for your token launch. Most users can leave these unchecked." />
            </div>
            <div className={styles.row} style={{ gap: '16px' }}>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  className={styles.switchInput}
                  checked={basics.removeHeader}
                  onChange={(e) => onBasicsChange('removeHeader', e.target.checked)}
                />
                <span className={styles.switchLabel}>
                  Remove Header
                  <HelpTooltip content="Removes the Steakhouse header from your token contract address for a cleaner look. Additional fee applies." className="ml-2" />
                </span>
              </label>
            </div>
            <div className={styles.row} style={{ gap: '16px', marginTop: '8px' }}>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  className={styles.switchInput}
                  checked={basics.stealth}
                  onChange={(e) => onBasicsChange('stealth', e.target.checked)}
                />
                <span className={styles.switchLabel}>
                  Stealth Mode
                  <HelpTooltip content="Your token won't appear in public listings until you're ready to reveal it. Good for keeping your investors private and selected." className="ml-2" />
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

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

export default Step2TokenBasics;




