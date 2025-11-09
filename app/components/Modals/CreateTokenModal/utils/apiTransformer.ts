import { TokenState } from '../types';
import { CreateTokenApiRequest } from '@/app/types/createToken';
import { CreateTokenService } from '@/app/lib/api/services/createTokenService';

/**
 * Transforms the modal state to the API request format
 * Handles both Virtual Curve and V2 Launch deployment modes
 */
export function transformStateToApiRequest(state: TokenState, tokenAddress?: string): CreateTokenApiRequest {
  // Resolve token address first because it is required in CreateTokenApiRequest
  const resolvedTokenAddress = (tokenAddress && /^0x[a-fA-F0-9]{40}$/.test(tokenAddress))
    ? tokenAddress
    : CreateTokenService.generateTempTokenAddress();

  const request: CreateTokenApiRequest = {
    token_address: resolvedTokenAddress,
  };
  
  // Basic token information
  if (state.basics.name) request.name = state.basics.name;
  if (state.basics.symbol) request.symbol = state.basics.symbol;
  
  // Convert total supply to string (human-readable format as per API guide)
  if (state.basics.totalSupply) {
    request.total_supply = state.basics.totalSupply;
  }
  
  // Handle deployment mode specific fields
  if (state.deploymentMode === 'VIRTUAL_CURVE') {
    // Virtual curve specific fields
    request.token_type = 0; // Virtual curve type

    // Include explicit tokenChoice for backend routing
    if (state.profile) {
      const choiceMap: Record<string, 'basic' | 'advanced' | 'simple' | 'zero'> = {
        ZERO: 'zero',
        SUPER: 'simple',
        BASIC: 'basic',
        ADVANCED: 'advanced',
      };
      const mapped = choiceMap[state.profile];
      if (mapped) request.tokenChoice = mapped;
    }
    
    // Graduation cap: prefer API-computed wei token amount; fallback to USD input if missing
    if (state.basics.gradCapWei && /^\d+$/.test(state.basics.gradCapWei)) {
      request.graduation_cap = state.basics.gradCapWei;
    } else if (state.basics.gradCap) {
      request.graduation_cap = state.basics.gradCap;
    }
    
    // Profile-based flags
    if (state.profile === 'ZERO') {
      request.is_zero_simple = true;
    } else if (state.profile === 'SUPER') {
      request.is_super_simple = true;
    }
    
    // Stealth mode
    if (state.basics.stealth) {
      request.is_stealth = true;
    }
    
    // Start time
    if (state.basics.startMode === 'NOW') {
      request.start_time = 0;
    } else if (state.basics.startTime) {
      request.start_time = state.basics.startTime;
    }
    
    // LP handling
    if (state.basics.lpMode === 'BURN') {
      request.burn_lp = true;
    } else if (state.basics.lpMode === 'LOCK' && state.basics.lockDays) {
      request.lp_lock_duration = state.basics.lockDays * 24 * 60 * 60; // Convert days to seconds
    }
    
    // Profile-specific curve settings
    if (state.profile && state.curves) {
      const curves = state.curves;
      
      // Final tax configuration
      const finalType = curves.finalType[state.profile];
      const finalTax = curves.finalTax[state.profile];
      
      if (finalType === 'TAX' && finalTax) {
        request.final_tax_rate = parseFloat(finalTax);
      }
      
      switch (state.profile) {
        case 'SUPER':
          // Simple profile with basic limits
          if (curves.super.maxWallet) {
            // Convert percentage to token amount
            const maxWalletPercent = parseFloat(curves.super.maxWallet) / 100;
            const totalSupply = BigInt(state.basics.totalSupply || '0');
            request.curve_max_wallet = (totalSupply * BigInt(Math.floor(maxWalletPercent * 1e6)) / BigInt(1e6)).toString();
          }
          if (curves.super.maxTx) {
            // Convert percentage to token amount
            const maxTxPercent = parseFloat(curves.super.maxTx) / 100;
            const totalSupply = BigInt(state.basics.totalSupply || '0');
            request.curve_max_tx = (totalSupply * BigInt(Math.floor(maxTxPercent * 1e6)) / BigInt(1e6)).toString();
          }
          break;
          
        case 'BASIC':
          // Basic profile with timed tax and limits
          if (curves.basic.startTax) {
            request.curve_starting_tax = parseFloat(curves.basic.startTax);
          }
          if (curves.basic.taxDuration) {
            request.curve_tax_duration = parseInt(curves.basic.taxDuration);
          }
          if (curves.basic.maxWallet) {
            const maxWalletPercent = parseFloat(curves.basic.maxWallet) / 100;
            const totalSupply = BigInt(state.basics.totalSupply || '0');
            request.curve_max_wallet = (totalSupply * BigInt(Math.floor(maxWalletPercent * 1e6)) / BigInt(1e6)).toString();
          }
          if (curves.basic.maxWalletDuration) {
            request.curve_max_wallet_duration = parseInt(curves.basic.maxWalletDuration);
          }
          if (curves.basic.maxTx) {
            const maxTxPercent = parseFloat(curves.basic.maxTx) / 100;
            const totalSupply = BigInt(state.basics.totalSupply || '0');
            request.curve_max_tx = (totalSupply * BigInt(Math.floor(maxTxPercent * 1e6)) / BigInt(1e6)).toString();
          }
          if (curves.basic.maxTxDuration) {
            request.curve_max_tx_duration = parseInt(curves.basic.maxTxDuration);
          }
          break;
          
        case 'ADVANCED':
          // Advanced profile with step-down configuration
          const adv = curves.advanced;
          
          if (adv.startTax) {
            request.curve_starting_tax = parseFloat(adv.startTax);
          }
          if (adv.taxStep) {
            request.tax_drop_step = parseFloat(adv.taxStep);
          }
          if (adv.taxInterval) {
            request.tax_drop_interval = parseInt(adv.taxInterval);
          }
          
          // Max wallet configuration
          if (adv.maxWStart) {
            const maxWalletPercent = parseFloat(adv.maxWStart) / 100;
            const totalSupply = BigInt(state.basics.totalSupply || '0');
            request.curve_max_wallet = (totalSupply * BigInt(Math.floor(maxWalletPercent * 1e6)) / BigInt(1e6)).toString();
          }
          if (adv.maxWStep) {
            const maxWalletStepPercent = parseFloat(adv.maxWStep) / 100;
            const totalSupply = BigInt(state.basics.totalSupply || '0');
            request.max_wallet_step = (totalSupply * BigInt(Math.floor(maxWalletStepPercent * 1e6)) / BigInt(1e6)).toString();
          }
          if (adv.maxWInterval) {
            request.max_wallet_interval = parseInt(adv.maxWInterval);
          }
          
          // Max tx configuration
          if (adv.maxTStart) {
            const maxTxPercent = parseFloat(adv.maxTStart) / 100;
            const totalSupply = BigInt(state.basics.totalSupply || '0');
            request.curve_max_tx = (totalSupply * BigInt(Math.floor(maxTxPercent * 1e6)) / BigInt(1e6)).toString();
          }
          if (adv.maxTStep) {
            const maxTxStepPercent = parseFloat(adv.maxTStep) / 100;
            const totalSupply = BigInt(state.basics.totalSupply || '0');
            request.max_tx_step = (totalSupply * BigInt(Math.floor(maxTxStepPercent * 1e6)) / BigInt(1e6)).toString();
          }
          if (adv.maxTInterval) {
            request.max_tx_interval = parseInt(adv.maxTInterval);
          }
          
          if (adv.removeAfter) {
            request.limit_removal_time = parseInt(adv.removeAfter);
          }
          if (adv.taxReceiver) {
            request.tax_wallet = adv.taxReceiver;
          }
          break;
      }
    }
  } else if (state.deploymentMode === 'V2_LAUNCH') {
    // V2 Launch specific fields
    request.token_type = 1; // V2 launch type
    
    const v2 = state.v2Settings;
    
    // Tax settings
    if (v2.taxSettings.taxReceiver) {
      request.tax_wallet = v2.taxSettings.taxReceiver;
    }
    
    // For V2 launch with advanced tax config
    if (v2.advancedTaxConfig.enabled) {
      request.curve_starting_tax = parseFloat(v2.advancedTaxConfig.startTax);
      request.final_tax_rate = parseFloat(v2.advancedTaxConfig.finalTax);
      request.tax_drop_step = parseFloat(v2.advancedTaxConfig.taxDropStep);
      request.tax_drop_interval = parseInt(v2.advancedTaxConfig.taxDropInterval);
    } else {
      // Simple tax configuration
      const avgTax = (parseFloat(v2.taxSettings.buyTax) + parseFloat(v2.taxSettings.sellTax)) / 2;
      request.final_tax_rate = avgTax;
    }
    
    // Advanced limits configuration
    if (v2.advancedLimitsConfig.enabled) {
      const totalSupply = BigInt(state.basics.totalSupply || '0');
      
      // Convert percentages to token amounts
      const startMaxTxPercent = parseFloat(v2.advancedLimitsConfig.startMaxTx) / 100;
      const maxTxStepPercent = parseFloat(v2.advancedLimitsConfig.maxTxStep) / 100;
      const startMaxWalletPercent = parseFloat(v2.advancedLimitsConfig.startMaxWallet) / 100;
      const maxWalletStepPercent = parseFloat(v2.advancedLimitsConfig.maxWalletStep) / 100;
      
      request.curve_max_tx = (totalSupply * BigInt(Math.floor(startMaxTxPercent * 1e6)) / BigInt(1e6)).toString();
      request.max_tx_step = (totalSupply * BigInt(Math.floor(maxTxStepPercent * 1e6)) / BigInt(1e6)).toString();
      request.curve_max_wallet = (totalSupply * BigInt(Math.floor(startMaxWalletPercent * 1e6)) / BigInt(1e6)).toString();
      request.max_wallet_step = (totalSupply * BigInt(Math.floor(maxWalletStepPercent * 1e6)) / BigInt(1e6)).toString();
      request.max_wallet_interval = parseInt(v2.advancedLimitsConfig.limitsInterval);
      request.max_tx_interval = parseInt(v2.advancedLimitsConfig.limitsInterval);
    } else if (v2.limits.enableLimits) {
      // Simple limits
      const totalSupply = BigInt(state.basics.totalSupply || '0');
      const maxWalletPercent = parseFloat(v2.limits.maxWallet) / 100;
      const maxTxPercent = parseFloat(v2.limits.maxTx) / 100;
      
      request.curve_max_wallet = (totalSupply * BigInt(Math.floor(maxWalletPercent * 1e6)) / BigInt(1e6)).toString();
      request.curve_max_tx = (totalSupply * BigInt(Math.floor(maxTxPercent * 1e6)) / BigInt(1e6)).toString();
    }
    
    // Stealth config
    if (v2.stealthConfig.enabled) {
      request.is_stealth = true;
      // The ETH amount would be used in contract deployment, not in token metadata
    }
  }
  
  // Metadata
  if (state.meta.desc) {
    request.bio = state.meta.desc;
  }
  if (state.meta.website) {
    request.website = state.meta.website;
  }
  if (state.meta.tg) {
    request.telegram = state.meta.tg;
  }
  if (state.meta.tw) {
    request.twitter = state.meta.tw;
  }
  
  // Image URLs (files are handled separately)
  if (state.meta.logo && !state.meta.logoFile) {
    request.image_url = state.meta.logo;
  }
  if (state.meta.banner && !state.meta.bannerFile) {
    request.banner_url = state.meta.banner;
  }
  
  // Category
  if (state.basics.tokenCategory) {
    // Map our categories to a simple string (API field name is 'catagory' with typo)
    // We'll send it to match the API expectation
    request.bio = request.bio ? `${request.bio} [${state.basics.tokenCategory}]` : `[${state.basics.tokenCategory}]`;
  }
  
  // Set timestamps
  request.created_at_timestamp = Date.now();
  
  return request;
}