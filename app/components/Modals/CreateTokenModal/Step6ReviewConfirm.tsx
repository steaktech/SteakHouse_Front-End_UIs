import React, { useState } from 'react';
import { TokenState } from './types';
import { fmt } from './utils';
import styles from './CreateTokenModal.module.css';

interface Step6ReviewConfirmProps {
  state: TokenState;
  onBack: () => void;
  onConfirm: () => void;
}

const Step6ReviewConfirm: React.FC<Step6ReviewConfirmProps> = ({
  state,
  onBack,
  onConfirm
}) => {
  const [understandFees, setUnderstandFees] = useState(false);

  const renderOverviewTable = (entries: [string, string][]) => {
    return (
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <th style={{ textAlign: 'left', padding: '8px', color: 'var(--muted)' }}>Key</th>
            <th style={{ textAlign: 'left', padding: '8px', color: 'var(--muted)' }}>Value</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([key, value], index) => (
            <tr key={index} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '8px', color: 'var(--text-dim)' }}>{key}</td>
              <td style={{ padding: '8px', color: 'var(--text)' }}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const generateOverview = () => {
    const b = state.basics;
    const p = state.profile;
    const taxMode = state.taxMode === 'BASIC' ? 'TAX' : 'NO-TAX';
    
    const entries: [string, string][] = [
      ['Tax mode', taxMode],
      ['Profile', p || '—'],
      ['Name', b.name],
      ['Symbol', b.symbol],
      ['Total supply', `${b.totalSupply} (raw) × 1e18`],
      ['Graduation cap', b.gradCap],
      ['Start time', b.startMode === 'NOW' ? 'Now (0)' : `At ${b.startTime} (epoch seconds)`],
      ['LP handling', b.lpMode === 'LOCK' ? `Lock ${b.lockDays} days` : 'Burn'],
      ['Stealth', b.stealth ? 'Yes' : 'No'],
      ['Remove header', b.removeHeader ? 'Yes' : 'No'],
      ['Creation fee', state.fees.creation !== null ? `${fmt.format(state.fees.creation)} ETH` : '—'],
      ['Platform fee', `${fmt.format(state.fees.platformPct)}%`],
      ['Graduation fee', `${fmt.format(state.fees.graduation)} ETH`],
      ['Locker fee', b.lpMode === 'LOCK' ? `${fmt.format(state.fees.locker)} ETH` : '—']
    ];

    return entries;
  };

  const generateAbiPreview = () => {
    const b = state.basics;
    const p = state.profile;
    const startTime = b.startTime;

    if (p === 'ZERO') {
      return [
        'createZeroSimpleToken(',
        '  meta: { name, symbol, totalSupply, gradCap, removeHeader },',
        `  startTime: ${startTime},`,
        `  isStealth: ${b.stealth}`,
        ')',
        '',
        `finalType: ${state.curves.finalType.ZERO}`,
        `finalTax: ${state.curves.finalTax.ZERO || 0}`
      ].join('\n');
    } else if (p === 'SUPER') {
      return [
        'createSuperSimpleToken(',
        '  meta: { name, symbol, totalSupply, gradCap, removeHeader },',
        `  startTime: ${startTime},`,
        `  isStealth: ${b.stealth},`,
        `  maxWallet: ${state.curves.super.maxWallet},`,
        `  maxTx: ${state.curves.super.maxTx},`,
        `  finalType: ${state.curves.finalType.SUPER}, finalTax: ${state.curves.finalTax.SUPER || 0}`,
        ')'
      ].join('\n');
    } else if (p === 'BASIC') {
      const bc = state.curves.basic;
      return [
        'createBasicToken(',
        '  meta: { name, symbol, totalSupply, gradCap, removeHeader },',
        `  startTime: ${startTime},`,
        `  isStealth: ${b.stealth},`,
        '  config: {',
        `    startTaxPct: ${bc.startTax}, taxActiveFor: ${bc.taxDuration},`,
        `    maxWallet: ${bc.maxWallet}, maxWalletActiveFor: ${bc.maxWalletDuration},`,
        `    maxTx: ${bc.maxTx}, maxTxActiveFor: ${bc.maxTxDuration},`,
        `    finalType: ${state.curves.finalType.BASIC}, finalTax: ${state.curves.finalTax.BASIC || 0}`,
        '  }',
        ')'
      ].join('\n');
    } else if (p === 'ADVANCED') {
      const a = state.curves.advanced;
      return [
        'createAdvancedToken(',
        '  meta: { name, symbol, totalSupply, gradCap, removeHeader },',
        `  startTime: ${startTime},`,
        `  isStealth: ${b.stealth},`,
        '  config: {',
        `    startTaxPct: ${a.startTax}, taxStepPct: ${a.taxStep || 0}, taxStepInterval: ${a.taxInterval || 0},`,
        `    maxWalletStart: ${a.maxWStart}, maxWalletStep: ${a.maxWStep || 0}, maxWalletStepInterval: ${a.maxWInterval || 0},`,
        `    maxTxStart: ${a.maxTStart}, maxTxStep: ${a.maxTStep || 0}, maxTxStepInterval: ${a.maxTInterval || 0},`,
        `    removeAllLimitsAfter: ${a.removeAfter}, taxReceiver: "${a.taxReceiver}",`,
        `    finalType: ${state.curves.finalType.ADVANCED}, finalTax: ${state.curves.finalTax.ADVANCED || 0}`,
        '  }',
        ')'
      ].join('\n');
    }

    return 'No profile selected';
  };

  const overviewEntries = generateOverview();
  const abiPreview = generateAbiPreview();

  return (
    <div className={styles.panel}>
      <div className={styles.grid2}>
        <details className={styles.collapsed} open>
          <summary className={styles.collapsedSummary}>Selection overview</summary>
          <div className={styles.collapsedBody}>
            {renderOverviewTable(overviewEntries)}
          </div>
        </details>

        <details className={styles.collapsed}>
          <summary className={styles.collapsedSummary}>Contract preview (ABI-ready)</summary>
          <div className={styles.collapsedBody}>
            <div className={styles.abi}>
              {abiPreview}
            </div>
          </div>
        </details>
      </div>

      <div className={`${styles.card} ${styles.cardAlt}`}>
        <label className={styles.switch}>
          <input 
            type="checkbox" 
            className={styles.switchInput}
            checked={understandFees}
            onChange={(e) => setUnderstandFees(e.target.checked)}
          />
          <span className={styles.switchLabel}>
            I understand the difference between upfront fees and fees at trade/graduation.
          </span>
        </label>
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
          disabled={!understandFees || state.isCreating}
          onClick={onConfirm}
        >
          {state.isCreating ? 'Creating Token...' : 'Confirm & Create'}
        </button>
      </div>

      {/* API Error Display */}
      {state.creationResult?.error && (
        <div className={`${styles.card}`} style={{marginTop: '12px', borderColor: 'var(--danger)', backgroundColor: 'rgba(255, 71, 87, 0.1)'}}>
          <div className={styles.row}>
            <div className={styles.pill} style={{backgroundColor: 'var(--danger)', color: 'white'}}>
              Error
            </div>
            <div style={{color: 'var(--danger)'}}>
              {state.creationResult.error}
            </div>
          </div>
        </div>
      )}

      {/* Transaction Status Display */}
      {state.txHash && (
        <div className={styles.card} style={{marginTop: '12px'}}>
          <div className={styles.row}>
            <div className={styles.pill} style={{
              backgroundColor: state.txHash === 'pending' ? 'var(--warn)' : 'var(--success)',
              color: state.txHash === 'pending' ? 'black' : 'white'
            }}>
              {state.txHash === 'pending' ? 'Creating...' : 'Success'}
            </div>
            <div>
              {state.txHash === 'pending' ? 'Creating token via API...' : 'Token created successfully!'}
            </div>
          </div>
          {state.txHash !== 'pending' && (
            <div className={styles.hint}>
              Transaction Hash: 
              <a 
                href={`https://etherscan.io/tx/${state.txHash}`}
                target="_blank" 
                rel="noreferrer"
                style={{marginLeft: '8px', color: 'var(--focus)'}}
              >
                {state.txHash.slice(0, 10)}…{state.txHash.slice(-8)}
              </a>
            </div>
          )}
          {state.creationResult?.success && state.creationResult.data && (
            <div className={styles.hint} style={{marginTop: '8px'}}>
              Token Address: 
              <span style={{marginLeft: '8px', color: 'var(--focus)', fontFamily: 'monospace'}}>
                {state.creationResult.data.token_address || 'Generated'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Step6ReviewConfirm;

