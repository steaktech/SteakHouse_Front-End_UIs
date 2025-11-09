import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TokenState } from './types';
import { fmt } from './utils';
import styles from './CreateTokenModal.module.css';
import { simulateGradCap } from '@/app/lib/api/services/gradCapService';
import { useWallet } from '@/app/hooks/useWallet';
import { useTrading } from '@/app/hooks/useTrading';
import WalletTopUpModal from '@/app/components/Modals/WalletTopUpModal/WalletTopUpModal';

interface Step6ReviewConfirmProps {
  state: TokenState;
  onConfirm: () => void;
  isLoading?: boolean;
  onBasicsChange: (field: string, value: any) => void;
}

const Step6ReviewConfirm: React.FC<Step6ReviewConfirmProps> = ({
  state,
  onConfirm,
  isLoading = false,
  onBasicsChange,
}) => {
  const [understandFees, setUnderstandFees] = useState(false);
  const [gradLoading, setGradLoading] = useState(false);
  const [gradError, setGradError] = useState<string | null>(null);
  const [gradResult, setGradResult] = useState<{ supplyToCirculate?: string; ethRaisedWei?: string; priceWei?: string; priceWeiPer1e18?: string }>({});
  
  // Wallet / Top up modal state
  const { isConnected, connect, balanceFormatted } = useWallet();
  const { tradingState, topUpTradingWallet } = useTrading();
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);

  // Format big integer wei to human tokens (18 decimals)
  const formatUnits = (wei?: string, decimals: number = 18) => {
    if (!wei) return '—';
    try {
      const raw = BigInt(wei);
      const base = BigInt(10) ** BigInt(decimals);
      const integer = raw / base;
      const fraction = raw % base;
      if (fraction === BigInt(0)) return integer.toString();
      const fracStr = fraction.toString().padStart(decimals, '0').replace(/0+$/, '');
      return `${integer.toString()}.${fracStr.slice(0, 6)}`; // show up to 6 decimals
    } catch {
      return '—';
    }
  };

  const inFlightKeyRef = useRef<string | null>(null);
  const lastComputedKeyRef = useRef<string | null>(null);
  const isMountedRef = useRef<boolean>(true);

  // Track mounted state to avoid updating after unmount/remount (Strict Mode)
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  useEffect(() => {
    // Trigger simulation when arriving here or when inputs change
    const basics = state.basics;
    if (!basics.totalSupply || !basics.gradCap) return;
    const totalSupply = basics.totalSupply.trim();
    const targetUsd = basics.gradCap.trim();
    if (!/^\d+$/.test(totalSupply) || Number(targetUsd) <= 0) return;

    const key = `${totalSupply}-${targetUsd}`;

    // Skip if we've already computed for this key in this session
    if (lastComputedKeyRef.current === key && (state.basics.gradCapWei || gradError)) {
      return;
    }
    // Skip if request already in-flight for same key
    if (inFlightKeyRef.current === key) {
      return;
    }

    const totalSupplyWei = (BigInt(totalSupply) * BigInt('1000000000000000000')).toString();
    inFlightKeyRef.current = key;
    (async () => {
      try {
        if (isMountedRef.current) {
          setGradLoading(true);
          setGradError(null);
        }
        const resp = await simulateGradCap({ totalSupplyWei, targetMcapUsd: targetUsd });
        const supplyToCirculate = resp?.results?.supplyToCirculate;
        if (isMountedRef.current) {
          setGradResult({
            supplyToCirculate,
            ethRaisedWei: resp?.results?.ethRaisedWei,
            priceWei: resp?.results?.priceWei ?? resp?.results?.priceWeiPer1e18,
            priceWeiPer1e18: resp?.results?.priceWeiPer1e18,
          });
        }
        onBasicsChange('gradCapWei', supplyToCirculate || null);
        onBasicsChange('gradCapError', null);
        lastComputedKeyRef.current = key;
      } catch (e: any) {
        const reason = e?.message || 'Graduation cap not allowed';
        if (isMountedRef.current) {
          setGradError(reason);
        }
        onBasicsChange('gradCapError', reason);
        onBasicsChange('gradCapWei', null);
        lastComputedKeyRef.current = key;
      } finally {
        // Always clear loading
        if (isMountedRef.current) {
          setGradLoading(false);
        }
        if (inFlightKeyRef.current === key) inFlightKeyRef.current = null;
      }
    })();
    return () => { };
  }, [state.basics.totalSupply, state.basics.gradCap, gradError, onBasicsChange]);

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

      // Advanced tax configuration
      if (state.v2Settings.advancedTaxConfig.enabled) {
        entries.push(['Advanced Tax Config', 'Enabled']);
        entries.push(['Start Tax', `${state.v2Settings.advancedTaxConfig.startTax}%`]);
        entries.push(['Final Tax', `${state.v2Settings.advancedTaxConfig.finalTax}%`]);
        entries.push(['Tax Drop Interval', `${state.v2Settings.advancedTaxConfig.taxDropInterval}s`]);
        entries.push(['Tax Drop Step', `${state.v2Settings.advancedTaxConfig.taxDropStep}%`]);
      }

      // Regular limits
      if (state.v2Settings.limits.enableLimits) {
        entries.push(['Max wallet', `${state.v2Settings.limits.maxWallet}%`]);
        entries.push(['Max transaction', `${state.v2Settings.limits.maxTx}%`]);
      }

      // Advanced limits configuration
      if (state.v2Settings.advancedLimitsConfig.enabled) {
        entries.push(['Dynamic Limits', 'Enabled']);
        entries.push(['Start Max Transaction', `${state.v2Settings.advancedLimitsConfig.startMaxTx}% of supply`]);
        entries.push(['Max Transaction Step', `+${state.v2Settings.advancedLimitsConfig.maxTxStep}% per interval`]);
        entries.push(['Start Max Wallet', `${state.v2Settings.advancedLimitsConfig.startMaxWallet}% of supply`]);
        entries.push(['Max Wallet Step', `+${state.v2Settings.advancedLimitsConfig.maxWalletStep}% per interval`]);
        entries.push(['Limits Interval', `${state.v2Settings.advancedLimitsConfig.limitsInterval}s`]);
      }

      // Stealth configuration
      if (state.v2Settings.stealthConfig.enabled) {
        entries.push(['Stealth Launch', 'Enabled']);
        entries.push(['Stealth ETH Amount', `${state.v2Settings.stealthConfig.ethAmount} ETH`]);
      }
    }

    // Common token info
    entries.push(['Name', b.name]);
    entries.push(['Symbol', b.symbol]);
    entries.push(['Total supply', `${b.totalSupply} (raw) × 1e18`]);

    if (state.deploymentMode === 'VIRTUAL_CURVE') {
      entries.push(['Graduation cap (USD target)', b.gradCap ? `$${Number(b.gradCap).toLocaleString()}` : '—']);
      entries.push(['Supply to circulate (tokens)', b.gradCapWei ? `${formatUnits(b.gradCapWei)} tokens` : gradLoading ? 'Calculating…' : (gradError || '—')]);
      entries.push(['Start time', b.startMode === 'NOW' ? 'Now (0)' : `At ${b.startTime} (epoch seconds)`]);
      entries.push(['LP handling', b.lpMode === 'LOCK' ? `Lock ${b.lockDays} days` : 'Burn']);
      entries.push(['Stealth', b.stealth ? 'Yes' : 'No']);
    }

    entries.push(['Remove header', b.removeHeader ? 'Yes' : 'No']);

    // Fee info
    if (state.deploymentMode === 'VIRTUAL_CURVE') {
      // Show the effective creation fee that will actually be sent (apply profile minimums)
      const configured = typeof state.fees.creation === 'number' ? state.fees.creation : 0;
      const minByProfile = state.profile === 'ZERO' ? 0.0005
        : state.profile === 'SUPER' ? 0.001
          : state.profile === 'BASIC' ? 0.01
            : state.profile === 'ADVANCED' ? 0.01
              : 0;
      const effectiveCreation = Math.max(configured, minByProfile);
      entries.push(['Creation fee', `${fmt.format(effectiveCreation)} ETH`]);
      entries.push(['Platform fee', `${fmt.format(state.fees.platformPct)}%`]);
      entries.push(['Graduation fee', `${fmt.format(state.fees.graduation)} ETH`]);
      entries.push(['Locker fee', b.lpMode === 'LOCK' ? `${fmt.format(state.fees.locker)} ETH` : '—']);
    }

    return entries;
  };

  const autoBrandingPreview = () => {
    const a = state.meta.autoBrand
    const palette = state.meta.palette;
    const r = document.body;
    if (a && palette) {
      try {
        const parsedPalette = JSON.parse(palette);
        if (r) {
          r.style.setProperty('--ab-modal-title', parsedPalette.recommended.text);
          r.style.setProperty('--ab-modal-bg', parsedPalette.recommended.background);
          r.style.setProperty('--ab-modal-header', parsedPalette.recommended.background);
        }
        return palette;
      } catch (error) {
        console.error('Failed to parse palette:', error);
        return '';
      }
    }
    else{
      r.style.removeProperty('--ab-modal-title');
      r.style.removeProperty('--ab-modal-bg');
      r.style.removeProperty('--ab-modal-header');
    }
    return '';
  }

  const generateAbiPreview = () => {
    const b = state.basics;
    const p = state.profile;
    const startTime = b.startTime;

    // Handle V2 launch mode
    if (state.deploymentMode === 'V2_LAUNCH') {
      const v2 = state.v2Settings;
      const b = state.basics;

      // Generate the manual deploy JSON structure
      const deployConfig: any = {
        name_: b.name,
        symbol_: b.symbol,
        supply_: `${BigInt(b.totalSupply) * BigInt(10 ** 18)}`, // Convert to wei
        _taxWallet: v2.taxSettings.taxReceiver || '0x0000000000000000000000000000000000000000',
        _treasury: '0x0000000000000000000000000000000000000000' // Default treasury
      };

      // Add advanced tax configuration if enabled
      if (v2.advancedTaxConfig.enabled) {
        const startTaxBps = Math.floor(Number(v2.advancedTaxConfig.startTax) * 100); // Convert % to basis points
        const finalTaxBps = Math.floor(Number(v2.advancedTaxConfig.finalTax) * 100);
        const decayStep = Math.floor(Number(v2.advancedTaxConfig.taxDropStep) * 100);

        deployConfig.decayCfg = {
          startTax: startTaxBps,
          finalTax: finalTaxBps,
          decayStep: decayStep,
          decayInterval: Number(v2.advancedTaxConfig.taxDropInterval)
        };
      }

      // Add advanced limits configuration if enabled
      if (v2.advancedLimitsConfig.enabled) {
        const totalSupply = BigInt(b.totalSupply) * BigInt(10 ** 18);

        // Convert percentages to token amounts in wei
        const startMaxTxPercent = Number(v2.advancedLimitsConfig.startMaxTx) / 100;
        const maxTxStepPercent = Number(v2.advancedLimitsConfig.maxTxStep) / 100;
        const startMaxWalletPercent = Number(v2.advancedLimitsConfig.startMaxWallet) / 100;
        const maxWalletStepPercent = Number(v2.advancedLimitsConfig.maxWalletStep) / 100;

        const startMaxTxWei = `${BigInt(Math.floor(Number(totalSupply) * startMaxTxPercent))}`;
        const maxTxStepWei = `${BigInt(Math.floor(Number(totalSupply) * maxTxStepPercent))}`;
        const startMaxWalletWei = `${BigInt(Math.floor(Number(totalSupply) * startMaxWalletPercent))}`;
        const maxWalletStepWei = `${BigInt(Math.floor(Number(totalSupply) * maxWalletStepPercent))}`;

        deployConfig.limitsCfg = {
          startMaxTx: startMaxTxWei,
          maxTxStep: maxTxStepWei,
          startMaxWallet: startMaxWalletWei,
          maxWalletStep: maxWalletStepWei
        };
      }

      // Add stealth ETH amount if enabled
      if (v2.stealthConfig.enabled) {
        deployConfig.eth = v2.stealthConfig.ethAmount;
      }

      return JSON.stringify(deployConfig, null, 2);
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
  const palette = autoBrandingPreview();

  // Compute minimal required ETH (creation fee + small gas buffer)
  const configuredCreation = typeof state.fees.creation === 'number' ? state.fees.creation : 0;
  const minByProfile = state.profile === 'ZERO' ? 0.0005
    : state.profile === 'SUPER' ? 0.001
      : state.profile === 'BASIC' ? 0.01
        : state.profile === 'ADVANCED' ? 0.01
          : 0;
  const effectiveCreationEth = Math.max(configuredCreation, minByProfile);
  const gasBufferEth = 0.003; // small buffer for gas on Sepolia
  const requiredEth = effectiveCreationEth + gasBufferEth;
  const walletEth = parseFloat(balanceFormatted || '0');
  const hasEnoughForCreation = isConnected && walletEth >= requiredEth;

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

      {!hasEnoughForCreation && isConnected && (
        <div className={styles.card} style={{ borderColor: 'var(--warning-400)' }}>
          <div className={styles.row}>
            <div className={styles.pill}>Insufficient funds</div>
            <div>
              You need at least {fmt.format(requiredEth)} ETH (creation {fmt.format(effectiveCreationEth)} + gas buffer {fmt.format(gasBufferEth)}) but your wallet has {fmt.format(walletEth)} ETH.
            </div>
          </div>
        </div>
      )}

      <div className={styles.footerNav}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginLeft: 'auto' }}>
          {!isConnected ? (
            <button
              className={`${styles.btn} ${styles.btnPrimary} ${styles.navButton}`}
              onClick={() => { void connect().catch(() => {}); }}
            >
              Connect Wallet
            </button>
          ) : (
            <>
              <button
                className={`${styles.btn} ${styles.navButton}`}
                onClick={() => setIsTopUpOpen(true)}
              >
                Top Up
              </button>
              <button
                className={`${styles.btn} ${styles.btnPrimary} ${styles.navButton}`}
                disabled={!understandFees || isLoading || gradLoading || !!gradError || !state.basics.gradCapWei || !hasEnoughForCreation}
                onClick={onConfirm}
              >
                {gradLoading ? 'Calculating…' : (isLoading ? 'Creating...' : 'Confirm & Create')}
              </button>
            </>
          )}
        </div>
      </div>

      {gradError && (
        <div className={styles.card} style={{ marginTop: '12px', borderColor: 'var(--danger-400)' }}>
          <div className={styles.row}>
            <div className={styles.pill}>Graduation cap error</div>
            <div style={{ color: 'var(--danger-400)' }}>{gradError}</div>
          </div>
        </div>
      )}

      {state.txHash && (
        <div className={styles.card} style={{ marginTop: '12px' }}>
          <div className={styles.row}>
            <div className={styles.pill}>
              {state.txHash === 'pending' ? 'Pending' : isLoading ? 'Creating' : 'Sent'}
            </div>
            <div>
              {state.txHash === 'pending' ? 'Creating token...' : isLoading ? 'Processing...' : 'Token created successfully!'}
            </div>
          </div>
          {state.txHash !== 'pending' && (
            <div className={styles.hint}>
              Explorer:
              <a
                href={`https://etherscan.io/tx/${state.txHash}`}
                target="_blank"
                rel="noreferrer"
                style={{ marginLeft: '8px', color: 'var(--primary-400)' }}
              >
                {state.txHash.slice(0, 10)}…{state.txHash.slice(-8)}
              </a>
            </div>
          )}
        </div>
      )}
      {/* Top Up Modal */}
      <WalletTopUpModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
        tradingWallet={tradingState?.tradingWallet}
        defaultAmountEth={tradingState?.topUpSuggestionEth || ''}
        onConfirmTopUp={async (amt) => topUpTradingWallet(amt)}
      />
    </div>
  );
};

export default Step6ReviewConfirm;

