'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { CreateTokenModalProps, TokenState, ProfileType, TaxMode, FinalTokenType } from './types';
import { initialState, updateCreationFee, getPlatformFee, validateBasics, validateCurve, fmt, generateFakeHash } from './utils';
import { CreateTokenService } from '@/app/lib/api/services/createTokenService';
import { transformTokenStateToApiData } from './apiTransform';
import Step1ChooseType from './Step1ChooseType';
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
    const fee = updateCreationFee(profile, state.taxMode);
    const platformPct = getPlatformFee(profile);
    
    setState(prev => ({
      ...prev,
      profile,
      fees: { ...prev.fees, creation: fee, platformPct }
    }));
  }, [state.taxMode]);

  const handleBasicsChange = useCallback((field: string, value: any) => {
    setState(prev => ({
      ...prev,
      basics: { ...prev.basics, [field]: value }
    }));
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

    if (targetStep === 2) {
      if (!state.taxMode || !state.profile) {
        newErrors.step1 = 'Please select tax mode and profile';
        isValid = false;
      }
    } else if (targetStep === 3) {
      const validation = validateBasics(state.basics);
      if (!validation.isValid) {
        newErrors = { ...newErrors, ...validation.errors };
        isValid = false;
      }
    } else if (targetStep === 4) {
      if (state.profile) {
        const validation = validateCurve(state.profile, state.curves, state.curves.finalType);
        if (!validation.isValid) {
          newErrors = { ...newErrors, ...validation.errors };
          isValid = false;
        }
      }
    }

    if (isValid) {
      goToStep(targetStep);
    } else {
      setErrors(newErrors);
    }
  }, [state, goToStep]);

  const handleMetaChange = useCallback((field: string, value: string) => {
    setState(prev => ({
      ...prev,
      meta: { ...prev.meta, [field]: value }
    }));
  }, []);

  const handleFileChange = useCallback((field: 'logo' | 'banner', file: File | undefined) => {
    setState(prev => ({
      ...prev,
      files: { ...prev.files, [field]: file }
    }));
  }, []);

  const handleConfirm = useCallback(async () => {
    console.log('🎯 handleConfirm called');
    setState(prev => ({ ...prev, isCreating: true, txHash: 'pending' }));
    
    try {
      // Generate temporary token address (in production, get from wallet/contract)
      const tokenAddress = CreateTokenService.generateTempTokenAddress();
      console.log('🏷️ Generated token address:', tokenAddress);
      
      // Transform state to API format
      const apiData = transformTokenStateToApiData(
        state,
        tokenAddress,
        state.files.logo,
        state.files.banner
      );
      console.log('🔄 Transformed API data:', apiData);
      
      // Validate data
      const validationErrors = CreateTokenService.validateTokenData(apiData);
      if (validationErrors.length > 0) {
        console.error('❌ Validation errors:', validationErrors);
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }
      console.log('✅ Validation passed');
      
      // Call API
      console.log('🚀 About to call API...');
      const result = await CreateTokenService.createToken(apiData);
      console.log('✅ API call completed:', result);
      
      // Success - generate transaction hash
      const fakeHash = generateFakeHash();
      setState(prev => ({
        ...prev,
        txHash: fakeHash,
        isCreating: false,
        creationResult: {
          success: true,
          data: result,
          txHash: fakeHash
        }
      }));
      
    } catch (error) {
      console.error('Token creation failed:', error);
      setState(prev => ({
        ...prev,
        txHash: null,
        isCreating: false,
        creationResult: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        }
      }));
    }
  }, [state]);

  const stepTitles = {
    1: '1) Choose type',
    2: '2) Token basics', 
    3: '3) Curve settings',
    4: '4) Fees & network',
    5: '5) Metadata & socials',
    6: '6) Review & confirm'
  };

  const isProfileAllowed = (profile: ProfileType) => {
    if (state.taxMode === 'NO_TAX') {
      return profile === 'ZERO' || profile === 'SUPER';
    } else if (state.taxMode === 'BASIC') {
      return profile === 'BASIC' || profile === 'ADVANCED';
    }
    return true;
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
          </div>
        </div>

        <div className={styles.wizard}>
          <aside className={styles.sidebar}>
            {[1, 2, 3, 4, 5, 6].map(step => (
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
            ))}
          </aside>

          <main className={styles.content}>
            <div className={styles.contentHeader}>
              <h2>{stepTitles[state.step as keyof typeof stepTitles]}</h2>
              <span className={styles.badge}>{state.profile || '—'}</span>
            </div>

            {/* Step Components */}
            {state.step === 1 && (
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

            {state.step === 2 && (
              <Step2TokenBasics
                basics={state.basics}
                errors={errors}
                onBasicsChange={handleBasicsChange}
                onBack={() => goToStep(1)}
                onContinue={() => validateAndGoToStep(3)}
              />
            )}

            {state.step === 3 && (
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

            {state.step === 4 && (
              <Step4FeesNetwork
                fees={state.fees}
                removeHeader={state.basics.removeHeader}
                lpMode={state.basics.lpMode}
                onBack={() => goToStep(3)}
                onContinue={() => goToStep(5)}
              />
            )}

            {state.step === 5 && (
              <Step5MetadataSocials
                meta={state.meta}
                files={state.files}
                onMetaChange={handleMetaChange}
                onFileChange={handleFileChange}
                onBack={() => goToStep(4)}
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
