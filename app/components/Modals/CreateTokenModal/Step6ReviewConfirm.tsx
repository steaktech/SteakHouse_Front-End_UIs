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

  const getProfileDisplayName = (profile: string | null) => {
    if (!profile) return '—';
    switch (profile) {
      case 'ZERO': return 'Zero';
      case 'SUPER': return 'Simple';
      case 'BASIC': return 'Basic';
      case 'ADVANCED': return 'Advanced';
      default: return '—';
    }
  };

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
    const entries: [string, string][] = [];

    // Add deployment mode
    entries.push(['Deployment mode', state.deploymentMode === 'VIRTUAL_CURVE' ? 'Virtual Curve' : 'Direct V2 Launch']);

    if (state.deploymentMode === 'VIRTUAL_CURVE') {
      const taxMode = state.taxMode === 'BASIC' ? 'TAX' : 'NO-TAX';
      entries.push(['Tax mode', taxMode]);
      entries.push(['Profile', getProfileDisplayName(p)]);
    } else if (state.deploymentMode === 'V2_LAUNCH') {
      entries.push(['Trading mode', state.v2Settings.enableTradingMode === 'FULL_LAUNCH' ? 'Full Launch' : 'Deploy Only']);
      entries.push(['Initial liquidity', `${state.v2Settings.initialLiquidityETH} ETH`]);
      entries.push(['Buy tax', `${state.v2Settings.taxSettings.buyTax}%`]);
      entries.push(['Sell tax', `${state.v2Settings.taxSettings.sellTax}%`]);
      entries.push(['Tax receiver', state.v2Settings.taxSettings.taxReceiver || 'Default']);
      entries.push(['Max wallet', `${state.v2Settings.limits.maxWallet}%`]);
      entries.push(['Max transaction', `${state.v2Settings.limits.maxTx}%`]);
      entries.push(['Limits enabled', state.v2Settings.limits.enableLimits ? 'Yes' : 'No']);
    }
    
    // Common token info
    entries.push(['Name', b.name]);
    entries.push(['Symbol', b.symbol]);
    entries.push(['Total supply', `${b.totalSupply} (raw) × 1e18`]);
    
    if (state.deploymentMode === 'VIRTUAL_CURVE') {
      entries.push(['Graduation cap', b.gradCap]);
      entries.push(['Start time', b.startMode === 'NOW' ? 'Now (0)' : `At ${b.startTime} (epoch seconds)`]);
      entries.push(['LP handling', b.lpMode === 'LOCK' ? `Lock ${b.lockDays} days` : 'Burn']);
      entries.push(['Stealth', b.stealth ? 'Yes' : 'No']);
    }
    
    entries.push(['Remove header', b.removeHeader ? 'Yes' : 'No']);
    
    // Fee info
    if (state.deploymentMode === 'VIRTUAL_CURVE') {
      entries.push(['Creation fee', state.fees.creation !== null ? `${fmt.format(state.fees.creation)} ETH` : '—']);
      entries.push(['Platform fee', `${fmt.format(state.fees.platformPct)}%`]);
      entries.push(['Graduation fee', `${fmt.format(state.fees.graduation)} ETH`]);
      entries.push(['Locker fee', b.lpMode === 'LOCK' ? `${fmt.format(state.fees.locker)} ETH` : '—']);
    }

    return entries;
  };

  const generateAbiPreview = () => {
    const b = state.basics;
    const p = state.profile;
    const startTime = b.startTime;

    // Handle V2 launch mode
    if (state.deploymentMode === 'V2_LAUNCH') {
      const v2 = state.v2Settings;
      return [
        'createV2Token(',
        '  meta: { name, symbol, totalSupply, removeHeader },',
        `  enableTradingMode: ${v2.enableTradingMode},`,
        `  initialLiquidityETH: ${v2.initialLiquidityETH} ETH,`,
        '  taxSettings: {',
        `    buyTax: ${v2.taxSettings.buyTax}%,`,
        `    sellTax: ${v2.taxSettings.sellTax}%,`,
        `    taxReceiver: "${v2.taxSettings.taxReceiver}"`,
        '  },',
        '  limits: {',
        `    maxWallet: ${v2.limits.maxWallet}%,`,
        `    maxTx: ${v2.limits.maxTx}%,`,
        `    enableLimits: ${v2.limits.enableLimits}`,
        '  }',
        ')'
      ].join('\n');
    }

    // Handle virtual curve mode
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
        `    removeAllLimitsAfter: ${a.removeAfter}, taxReceiver: \"${a.taxReceiver}\",`,
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
          disabled={!understandFees}
          onClick={onConfirm}
        >
          Confirm & Create
        </button>
      </div>

      {state.txHash && (
        <div className={styles.card} style={{marginTop: '12px'}}>
          <div className={styles.row}>
            <div className={styles.pill}>
              {state.txHash === 'pending' ? 'Pending' : 'Sent'}
            </div>
            <div>
              {state.txHash === 'pending' ? 'Submitting transaction…' : 'Transaction submitted!'}
            </div>
          </div>
          {state.txHash !== 'pending' && (
            <div className={styles.hint}>
              Explorer: 
              <a 
                href={`https://etherscan.io/tx/${state.txHash}`}
                target="_blank" 
                rel="noreferrer"
                style={{marginLeft: '8px', color: 'var(--primary-400)'}}
              >
                {state.txHash.slice(0, 10)}…{state.txHash.slice(-8)}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Step6ReviewConfirm;

