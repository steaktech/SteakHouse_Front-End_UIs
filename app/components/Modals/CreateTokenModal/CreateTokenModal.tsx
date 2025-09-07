'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { CreateTokenModalProps, TokenState, ProfileType, TaxMode, FinalTokenType, DeploymentMode } from './types';
import { initialState, updateCreationFee, getPlatformFee, validateBasics, validateCurve, validateV2Settings, fmt, generateFakeHash } from './utils';
import { useStablePriceData } from '@/app/hooks/useStablePriceData';
import Step0ChooseDeploymentMode from './Step0ChooseDeploymentMode';
import Step1ChooseType from './Step1ChooseType';
import StepV2LaunchSettings from './StepV2LaunchSettings';
import Step2TokenBasics from './Step2TokenBasics';
import Step3CurveSettings from './Step3CurveSettings';
import Step4FeesNetwork from './Step4FeesNetwork';
import Step5MetadataSocials from './Step5MetadataSocials';
import Step6ReviewConfirm from './Step6ReviewConfirm';
import styles from './CreateTokenModal.module.css';

const CreateTokenModal: React.FC<CreateTokenModalProps> = ({ isOpen, onClose }) => {
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<TokenState>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Use stable price data hook - only fetch when modal is open
  const { formattedGasPrice, formattedEthPrice, loading: priceLoading } = useStablePriceData(isOpen);

  useEffect(() => {
    setMounted(true);
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  // Prevent body scroll when modal is open on mobile
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      
      return () => {
        document.body.style.overflow = originalStyle;
        document.body.style.touchAction = 'auto';
      };
    } else {
      // Ensure body scroll is restored when modal is closed
      document.body.style.overflow = '';
      document.body.style.touchAction = 'auto';
    }
  }, [isOpen]);

  const updateState = useCallback((updates: Partial<TokenState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const goToStep = useCallback((step: number) => {
    updateState({ step });
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [updateState]);

  const handleTaxModeChange = useCallback((taxMode: TaxMode) => {
    const newState = { ...state, taxMode, profile: null };
    const fee = updateCreationFee(null, taxMode);
    const platformPct = getPlatformFee(null);
    
    setState({
      ...newState,
      fees: { ...newState.fees, creation: fee, platformPct }
    });
  }, [state]);

  const handleProfileChange = useCallback((profile: ProfileType) => {
    // Automatically determine tax mode based on profile
    const taxMode = (profile === 'ZERO' || profile === 'SUPER') ? 'NO_TAX' : 'BASIC';
    const baseFee = updateCreationFee(profile, taxMode) || 0;
    const platformPct = getPlatformFee(profile);
    
    setState(prev => {
      // Calculate total creation fee including any existing addons
      let totalCreationFee = baseFee;
      
      if (prev.basics.removeHeader) {
        totalCreationFee += prev.fees.headerless;
      }
      
      if (prev.basics.stealth) {
        totalCreationFee += prev.fees.stealth;
      }
      
      return {
        ...prev,
        profile,
        taxMode,
        fees: { ...prev.fees, creation: totalCreationFee, platformPct }
      };
    });
  }, []);

  const handleBasicsChange = useCallback((field: string, value: any) => {
    setState(prev => {
      const newBasics = { ...prev.basics, [field]: value };
      
      // Recalculate total creation fee when addons are toggled
      if (field === 'removeHeader' || field === 'stealth') {
        // Start with base fee
        const baseFee = updateCreationFee(prev.profile, prev.taxMode) || 0;
        let totalCreationFee = baseFee;
        
        // Determine final state of both addons after this change
        const finalRemoveHeader = field === 'removeHeader' ? value : newBasics.removeHeader;
        const finalStealth = field === 'stealth' ? value : newBasics.stealth;
        
        // Add addon fees based on final state
        if (finalRemoveHeader) {
          totalCreationFee += prev.fees.headerless;
        }
        
        if (finalStealth) {
          totalCreationFee += prev.fees.stealth;
        }
        
        return {
          ...prev,
          basics: newBasics,
          fees: { ...prev.fees, creation: totalCreationFee }
        };
      }
      
      return {
        ...prev,
        basics: newBasics
      };
    });
  }, []);

  const handleCurveChange = useCallback((section: string, field: string, value: any) => {
    setState(prev => ({
      ...prev,
      curves: {
        ...prev.curves,
        [section]: { ...prev.curves[section as keyof typeof prev.curves], [field]: value }
      }
    }));
  }, []);

  const handleFinalTypeChange = useCallback((profile: ProfileType, type: FinalTokenType) => {
    setState(prev => ({
      ...prev,
      curves: {
        ...prev.curves,
        finalType: { ...prev.curves.finalType, [profile]: type }
      }
    }));
  }, []);

  const validateAndGoToStep = useCallback((targetStep: number) => {
    let isValid = true;
    let newErrors: Record<string, string> = {};

    if (targetStep === 1) {
      if (!state.deploymentMode) {
        newErrors.step0 = 'Please select a deployment mode';
        isValid = false;
      }
    } else if (targetStep === 2) {
      if (state.deploymentMode === 'VIRTUAL_CURVE') {
        if (!state.profile) {
          newErrors.step1 = 'Please select a profile';
          isValid = false;
        }
      } else if (state.deploymentMode === 'V2_LAUNCH') {
        const validation = validateV2Settings(state.v2Settings);
        if (!validation.isValid) {
          newErrors = { ...newErrors, ...validation.errors };
          isValid = false;
        }
      }
    } else if (targetStep === 3) {
      // Step 3 is only for VIRTUAL_CURVE - validate basics when coming from step 2
      const validation = validateBasics(state.basics);
      if (!validation.isValid) {
        newErrors = { ...newErrors, ...validation.errors };
        isValid = false;
      }
    } else if (targetStep === 4) {
      if (state.deploymentMode === 'VIRTUAL_CURVE' && state.profile) {
        const validation = validateCurve(state.profile, state.curves, state.curves.finalType);
        if (!validation.isValid) {
          newErrors = { ...newErrors, ...validation.errors };
          isValid = false;
        }
      }
    } else if (targetStep === 5) {
      // Step 5 can be reached from step 2 (V2_LAUNCH) or step 4 (VIRTUAL_CURVE)
      const validation = validateBasics(state.basics);
      if (!validation.isValid) {
        newErrors = { ...newErrors, ...validation.errors };
        isValid = false;
      }
    }

    if (isValid) {
      goToStep(targetStep);
    } else {
      setErrors(newErrors);
    }
  }, [state, goToStep]);

  const handleDeploymentModeChange = useCallback((deploymentMode: DeploymentMode) => {
    setState(prev => ({
      ...prev,
      deploymentMode,
      // Reset subsequent steps when deployment mode changes
      taxMode: null,
      profile: null
    }));
  }, []);

  const handleV2SettingsChange = useCallback((field: string, value: any) => {
    setState(prev => ({
      ...prev,
      v2Settings: { ...prev.v2Settings, [field]: value }
    }));
  }, []);

  const handleMetaChange = useCallback((field: string, value: string) => {
    setState(prev => ({
      ...prev,
      meta: { ...prev.meta, [field]: value }
    }));
  }, []);

  const handleConfirm = useCallback(async () => {
    setState(prev => ({ ...prev, txHash: 'pending' }));
    
    // Simulate transaction
    await new Promise(resolve => setTimeout(resolve, 1200));
    const fakeHash = generateFakeHash();
    setState(prev => ({ ...prev, txHash: fakeHash }));
  }, []);

  const getStepTitle = (step: number) => {
    if (step === 0) return 'Choose deployment mode';
    
    if (state.deploymentMode === 'V2_LAUNCH') {
      // V2 Launch: 0,1,2,3,4 (internal: 0,1,2,5,6)
      if (step === 1) return '1) V2 Launch settings';
      if (step === 2) return '2) Token basics';
      if (step === 5) return '3) Metadata & socials';
      if (step === 6) return '4) Review & confirm';
    } else {
      // Virtual Curve: 0,1,2,3,4,5,6 (normal)
      if (step === 1) return '1) Choose type';
      if (step === 2) return '2) Token basics';
      if (step === 3) return '3) Curve settings';
      if (step === 4) return '4) Fees & network';
      if (step === 5) return '5) Metadata & socials';
      if (step === 6) return '6) Review & confirm';
    }
    
    return 'Unknown step';
  };

  const isProfileAllowed = (profile: ProfileType) => {
    if (state.taxMode === 'NO_TAX') {
      return profile === 'ZERO' || profile === 'SUPER';
    } else if (state.taxMode === 'BASIC') {
      return profile === 'BASIC' || profile === 'ADVANCED';
    }
    return true;
  };

  const getProfileDisplayName = (profile: ProfileType | null) => {
    if (!profile) return '—';
    switch (profile) {
      case 'ZERO': return 'Zero';
      case 'SUPER': return 'Simple';
      case 'BASIC': return 'Basic';
      case 'ADVANCED': return 'Advanced';
      default: return '—';
    }
  };

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div 
      className={styles.modalOverlay}
      onClick={handleOverlayClick}
    >
      <div 
        className={styles.modalContainer}
        onClick={e => e.stopPropagation()}
      >
        <div className={styles.hero}>
          <div className={styles.brand}>
            <Image
              src="/images/create-token-logo.png"
              alt="Create Token Logo"
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
          <div>
            <h1 className={styles.heroTitle}>Create Token Wizard</h1>
            {/* Price information display */}
            <div className={styles.priceInfo}>
              {priceLoading ? (
                <span className={styles.priceLoading}>Loading prices...</span>
              ) : (
                <div className={styles.priceContainer}>
                  <span className={styles.priceItem}>
                    ⛽ Gas: {formattedGasPrice}
                  </span>
                  <span className={styles.priceItem}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="inline mr-1">
                      <path d="M12 1.75l-6.25 10.5L12 16l6.25-3.75L12 1.75zM5.75 13.5L12 22.25l6.25-8.75L12 17.25 5.75 13.5z"/>
                    </svg>
                    ETH: {formattedEthPrice}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.wizard}>
          <aside className={styles.sidebar}>
            {/* Step 0: Deployment Mode Selection */}
            <div 
              className={`${styles.step} ${state.step === 0 ? styles.active : ''} ${state.step > 0 ? styles.done : ''}`}
              onClick={() => {
                if (0 <= state.step) goToStep(0);
                else if (0 === state.step + 1) validateAndGoToStep(0);
              }}
            >
              <div className={styles.stepIndex}>0</div>
              <div>Deployment mode</div>
              <div className={styles.badge}>Required</div>
            </div>

            {/* Dynamic step rendering based on deployment mode */}
            {state.deploymentMode === 'V2_LAUNCH' ? (
              // V2 Launch: Steps 0,1,2,3,4 (internal steps 0,1,2,5,6)
              [1, 2, 5, 6].map((internalStep, index) => {
                const displayStep = index + 1; // Show as steps 1,2,3,4
                return (
                  <div 
                    key={internalStep}
                    className={`${styles.step} ${state.step === internalStep ? styles.active : ''} ${state.step > internalStep ? styles.done : ''}`}
                    onClick={() => {
                      if (internalStep <= state.step) goToStep(internalStep);
                      else if (internalStep === state.step + 1) validateAndGoToStep(internalStep);
                    }}
                  >
                    <div className={styles.stepIndex}>{displayStep}</div>
                    <div>
                      {internalStep === 1 && 'V2 settings'}
                      {internalStep === 2 && 'Token basics'}
                      {internalStep === 5 && 'Metadata & socials'}
                      {internalStep === 6 && 'Review & confirm'}
                    </div>
                    <div className={styles.badge}>
                      {internalStep === 1 && 'Required'}
                      {internalStep === 2 && '—'}
                      {internalStep === 5 && 'Optional'}
                      {internalStep === 6 && '1 tx'}
                    </div>
                  </div>
                );
              })
            ) : (
              // Virtual Curve: Steps 0,1,2,3,4,5,6 (normal flow)
              [1, 2, 3, 4, 5, 6].map(step => (
                <div 
                  key={step}
                  className={`${styles.step} ${state.step === step ? styles.active : ''} ${state.step > step ? styles.done : ''}`}
                  onClick={() => {
                    if (step <= state.step) goToStep(step);
                    else if (step === state.step + 1) validateAndGoToStep(step);
                  }}
                >
                  <div className={styles.stepIndex}>{step}</div>
                  <div>
                    {step === 1 && 'Choose type'}
                    {step === 2 && 'Token basics'}
                    {step === 3 && 'Curve settings'}
                    {step === 4 && 'Fees & network'}
                    {step === 5 && 'Metadata & socials'}
                    {step === 6 && 'Review & confirm'}
                  </div>
                  <div className={styles.badge}>
                    {step === 1 && 'Required'}
                    {step === 2 && '—'}
                    {step === 3 && 'Profile'}
                    {step === 4 && 'Read-only'}
                    {step === 5 && 'Optional'}
                    {step === 6 && '1 tx'}
                  </div>
                </div>
              ))
            )}
          </aside>

          <main className={styles.content}>
            <div className={styles.contentHeader}>
              <h2>{getStepTitle(state.step)}</h2>
              <span className={styles.badge}>{getProfileDisplayName(state.profile)}</span>
            </div>

            {/* Step Components */}
            {state.step === 0 && (
              <Step0ChooseDeploymentMode
                deploymentMode={state.deploymentMode}
                errors={errors}
                onDeploymentModeChange={handleDeploymentModeChange}
                onContinue={() => validateAndGoToStep(1)}
              />
            )}

            {state.step === 1 && state.deploymentMode === 'VIRTUAL_CURVE' && (
              <Step1ChooseType
                taxMode={state.taxMode}
                profile={state.profile}
                creationFee={state.fees.creation}
                errors={errors}
                onTaxModeChange={handleTaxModeChange}
                onProfileChange={handleProfileChange}
                onContinue={() => validateAndGoToStep(2)}
              />
            )}

            {state.step === 1 && state.deploymentMode === 'V2_LAUNCH' && (
              <StepV2LaunchSettings
                v2Settings={state.v2Settings}
                errors={errors}
                onV2SettingsChange={handleV2SettingsChange}
                onBack={() => goToStep(0)}
                onContinue={() => validateAndGoToStep(2)}
              />
            )}

            {state.step === 2 && (
              <Step2TokenBasics
                basics={state.basics}
                deploymentMode={state.deploymentMode}
                errors={errors}
                onBasicsChange={handleBasicsChange}
                onBack={() => goToStep(1)}
                onContinue={() => {
                  // For V2 launch, skip curve settings and fees, go directly to metadata
                  if (state.deploymentMode === 'V2_LAUNCH') {
                    validateAndGoToStep(5);
                  } else {
                    validateAndGoToStep(3);
                  }
                }}
              />
            )}

            {state.step === 3 && state.deploymentMode === 'VIRTUAL_CURVE' && (
              <Step3CurveSettings
                profile={state.profile}
                curves={state.curves}
                errors={errors}
                onCurveChange={handleCurveChange}
                onFinalTypeChange={handleFinalTypeChange}
                onBack={() => goToStep(2)}
                onContinue={() => validateAndGoToStep(4)}
              />
            )}

            {state.step === 4 && state.deploymentMode === 'VIRTUAL_CURVE' && (
              <Step4FeesNetwork
                fees={state.fees}
                removeHeader={state.basics.removeHeader}
                stealth={state.basics.stealth}
                lpMode={state.basics.lpMode}
                onBack={() => goToStep(3)}
                onContinue={() => goToStep(5)}
              />
            )}

            {state.step === 5 && (
              <Step5MetadataSocials
                meta={state.meta}
                onMetaChange={handleMetaChange}
                onBack={() => {
                  // For V2 launch, go back to token basics (step 2)
                  if (state.deploymentMode === 'V2_LAUNCH') {
                    goToStep(2);
                  } else {
                    goToStep(4);
                  }
                }}
                onContinue={() => goToStep(6)}
              />
            )}

            {state.step === 6 && (
              <Step6ReviewConfirm
                state={state}
                onBack={() => goToStep(5)}
                onConfirm={handleConfirm}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default CreateTokenModal;
