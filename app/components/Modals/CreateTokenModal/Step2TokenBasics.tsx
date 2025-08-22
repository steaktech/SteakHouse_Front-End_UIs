import React from 'react';
import { TokenBasics } from './types';
import styles from './CreateTokenModal.module.css';

interface Step2TokenBasicsProps {
  basics: TokenBasics;
  errors: Record<string, string>;
  onBasicsChange: (field: string, value: any) => void;
  onBack: () => void;
  onContinue: () => void;
}

const Step2TokenBasics: React.FC<Step2TokenBasicsProps> = ({
  basics,
  errors,
  onBasicsChange,
  onBack,
  onContinue
}) => {
  return (
    <div className={styles.panel}>
      <div className={styles.grid2}>
        <div className={styles.card}>
          <label className={styles.label}>Name</label>
          <input 
            className={`${styles.input} ${errors.name ? styles.fieldError : ''}`}
            value={basics.name}
            onChange={(e) => onBasicsChange('name', e.target.value)}
            placeholder="My Token" 
          />
          {errors.name && <div className={styles.error}>{errors.name}</div>}
        </div>
        <div className={styles.card}>
          <label className={styles.label}>Symbol</label>
          <input 
            className={`${styles.input} ${errors.symbol ? styles.fieldError : ''}`}
            value={basics.symbol}
            onChange={(e) => onBasicsChange('symbol', e.target.value)}
            placeholder="MTK"
            maxLength={12}
          />
          {errors.symbol && <div className={styles.error}>{errors.symbol}</div>}
        </div>

        <div className={styles.card}>
          <label className={styles.label}>Total Supply (tokens)</label>
          <input 
            className={`${styles.input} ${errors.totalSupply ? styles.fieldError : ''}`}
            value={basics.totalSupply}
            onChange={(e) => onBasicsChange('totalSupply', e.target.value)}
            placeholder="1.000.000.000"
          />
          <div className={styles.hint}>
            Default: 1.000.000.000 × 1e18 (use integers; we'll parseUnits).
          </div>
          {errors.totalSupply && <div className={styles.error}>{errors.totalSupply}</div>}
        </div>
        <div className={styles.card}>
          <label className={styles.label}>Graduation Cap (tokens)</label>
          <input 
            className={`${styles.input} ${errors.gradCap ? styles.fieldError : ''}`}
            value={basics.gradCap}
            onChange={(e) => onBasicsChange('gradCap', e.target.value)}
            placeholder="≤ total supply"
          />
          <div className={styles.hint}>Must be ≤ total supply.</div>
          {errors.gradCap && <div className={styles.error}>{errors.gradCap}</div>}
        </div>
      </div>

      <div className={styles.grid3}>
        <div className={styles.card}>
          <div className={styles.label}>Launch time</div>
          <div className={styles.segmented}>
            <div 
              className={`${styles.segment} ${basics.startMode === 'NOW' ? styles.active : ''}`}
              onClick={() => onBasicsChange('startMode', 'NOW')}
            >
              Start now
            </div>
            <div 
              className={`${styles.segment} ${basics.startMode === 'SCHEDULE' ? styles.active : ''}`}
              onClick={() => onBasicsChange('startMode', 'SCHEDULE')}
            >
              Pick time
            </div>
          </div>
          {basics.startMode === 'SCHEDULE' && (
            <div className={styles.row} style={{marginTop: '10px'}}>
              <input 
                className={`${styles.input} ${errors.startTime ? styles.fieldError : ''}`}
                type="datetime-local"
                onChange={(e) => onBasicsChange('launchDateTime', e.target.value)}
              />
              <span className={styles.hint}>UTC; must be now or later.</span>
            </div>
          )}
          {errors.startTime && <div className={styles.error}>{errors.startTime}</div>}
        </div>

        <div className={styles.card}>
          <div className={styles.label}>LP handling</div>
          <div className={styles.segmented}>
            <div 
              className={`${styles.segment} ${basics.lpMode === 'LOCK' ? styles.active : ''}`}
              onClick={() => onBasicsChange('lpMode', 'LOCK')}
            >
              Lock
            </div>
            <div 
              className={`${styles.segment} ${basics.lpMode === 'BURN' ? styles.active : ''}`}
              onClick={() => onBasicsChange('lpMode', 'BURN')}
            >
              Burn
            </div>
          </div>
          {basics.lpMode === 'LOCK' && (
            <div style={{marginTop: '10px'}}>
              <div className={styles.inline}>
                <input 
                  className={`${styles.input} ${errors.lockDays ? styles.fieldError : ''}`}
                  value={basics.lockDays}
                  onChange={(e) => onBasicsChange('lockDays', Number(e.target.value))}
                  placeholder="Lock duration (days)"
                />
                <span className={styles.unit}>min 30 days</span>
              </div>
              {errors.lockDays && <div className={styles.error}>{errors.lockDays}</div>}
            </div>
          )}
        </div>

        <div className={styles.card}>
          <div className={styles.label}>Extras</div>
          <div className={styles.row} style={{gap: '16px'}}>
            <label className={styles.switch}>
              <input 
                type="checkbox" 
                className={styles.switchInput}
                checked={basics.removeHeader}
                onChange={(e) => onBasicsChange('removeHeader', e.target.checked)}
              />
              <span className={styles.switchLabel}>
                Remove Steak header (headerless add-on)
              </span>
            </label>
          </div>
          <div className={styles.row} style={{gap: '16px', marginTop: '8px'}}>
            <label className={styles.switch}>
              <input 
                type="checkbox" 
                className={styles.switchInput}
                checked={basics.stealth}
                onChange={(e) => onBasicsChange('stealth', e.target.checked)}
              />
              <span className={styles.switchLabel}>
                Stealth launch (hidden from listings)
              </span>
            </label>
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

export default Step2TokenBasics;


