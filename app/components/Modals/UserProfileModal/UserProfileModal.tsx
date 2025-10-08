'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { 
  fetchUserProfile, 
  updateUserProfile, 
  deleteProfilePicture 
} from '@/app/lib/api/services/userService';
import type { 
  UserProfileModalProps, 
  ProfileFormData, 
  ProfileFormErrors, 
  ProfileModalState
} from './types';
import type { UserProfile } from '@/app/types/user';
import styles from './UserProfileModal.module.css';

// Icon components
const Icons = {
  Close: () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5L5 15M5 5l10 10"/></svg>,
  Copy: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5.5" y="5.5" width="7" height="7" rx="1"/><path d="M4.5 10.5h-1a1 1 0 01-1-1v-6a1 1 0 011-1h6a1 1 0 011 1v1"/></svg>,
  Check: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8l3 3 7-7"/></svg>,
  Camera: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  Trash: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4h12M5 4V2.5A1.5 1.5 0 016.5 1h3A1.5 1.5 0 0111 2.5V4m2 0v9a2 2 0 01-2 2H5a2 2 0 01-2-2V4"/></svg>,
  Wallet: () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 4h14a2 2 0 012 2v8a2 2 0 01-2 2H3a2 2 0 01-2-2V6a2 2 0 012-2z"/><path d="M15 10a1 1 0 100-2 1 1 0 000 2z"/></svg>,
  TrendingUp: () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12l4.5-4.5 3 3L14 6l4 4"/><path d="M14 6h4v4"/></svg>,
  Sparkles: () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 10V7.5L2.5 10 5 12.5V10zm10 0v2.5l2.5-2.5L15 7.5V10zm-5-5H7.5L10 2.5 12.5 5H10zm0 10h2.5L10 17.5 7.5 15H10z"/></svg>,
  User: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
};

// Blockchain balance API (per provided docs)
const BLOCKCHAIN_API_BASE = 'https://steak-blockchain-api-bf5e689d4321.herokuapp.com';

const VALIDATION_RULES = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 20,
    PATTERN: /^[a-zA-Z0-9_-]+$/,
  },
  BIO: {
    MAX_LENGTH: 200,
  },
  PROFILE_PICTURE: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  },
} as const;

export default function UserProfileModal({ isOpen, onClose, walletAddress }: UserProfileModalProps) {
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [state, setState] = useState<ProfileModalState>({
    isLoading: false,
    isSaving: false,
    isUploadingImage: false,
    profile: null,
    formData: {
      username: '',
      bio: '',
      profile_picture: null,
    },
    errors: {},
    successMessage: null,
  });

  // Address and balance states
  const [walletEth, setWalletEth] = useState<string | null>(null);
  const [tradingEth, setTradingEth] = useState<string | null>(null);
  const [loadingWalletEth, setLoadingWalletEth] = useState(false);
  const [loadingTradingEth, setLoadingTradingEth] = useState(false);
  const [walletEthError, setWalletEthError] = useState<string | null>(null);
  const [tradingEthError, setTradingEthError] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // Handle mounting for portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Load user profile when modal opens
  useEffect(() => {
    if (isOpen && walletAddress) {
      loadUserProfile();
    }
  }, [isOpen, walletAddress]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setState(prev => ({
        ...prev,
        errors: {},
        successMessage: null,
        isLoading: false,
        isSaving: false,
        isUploadingImage: false,
      }));
    }
  }, [isOpen]);

  // Keyboard event handling
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !state.isSaving && !state.isUploadingImage) {
        onClose();
      }
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, state.isSaving, state.isUploadingImage]);

  const loadUserProfile = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, errors: {} }));
    
    try {
      const profile = await fetchUserProfile(walletAddress);
      setState(prev => ({
        ...prev,
        profile,
        formData: {
          username: (profile as any).username || '',
          bio: (profile as any).bio || '',
          profile_picture: (profile as any).profile_picture,
        },
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to load user profile:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        errors: { 
          general: error instanceof Error ? error.message : 'Failed to load profile' 
        },
      }));
    }
  }, [walletAddress]);

  const validateForm = useCallback((): boolean => {
    const errors: ProfileFormErrors = {};
    
    // Username validation
    if (state.formData.username.trim()) {
      if (state.formData.username.length < VALIDATION_RULES.USERNAME.MIN_LENGTH) {
        errors.username = `Username must be at least ${VALIDATION_RULES.USERNAME.MIN_LENGTH} characters`;
      } else if (state.formData.username.length > VALIDATION_RULES.USERNAME.MAX_LENGTH) {
        errors.username = `Username must be no more than ${VALIDATION_RULES.USERNAME.MAX_LENGTH} characters`;
      } else if (!VALIDATION_RULES.USERNAME.PATTERN.test(state.formData.username)) {
        errors.username = 'Username can only contain letters, numbers, hyphens, and underscores';
      }
    }
    
    // Bio validation
    if (state.formData.bio.length > VALIDATION_RULES.BIO.MAX_LENGTH) {
      errors.bio = `Bio must be no more than ${VALIDATION_RULES.BIO.MAX_LENGTH} characters`;
    }
    
    setState(prev => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  }, [state.formData]);

  const handleInputChange = useCallback((field: keyof ProfileFormData, value: string) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, [field]: value },
      errors: { ...prev.errors, [field]: undefined, general: undefined },
      successMessage: null,
    }));
  }, []);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!VALIDATION_RULES.PROFILE_PICTURE.ALLOWED_TYPES.includes(file.type as any)) {
      setState(prev => ({
        ...prev,
        errors: { ...prev.errors, profile_picture: 'Please select a valid image file (JPEG, PNG, WebP)' },
      }));
      return;
    }

    if (file.size > VALIDATION_RULES.PROFILE_PICTURE.MAX_SIZE) {
      setState(prev => ({
        ...prev,
        errors: { ...prev.errors, profile_picture: 'Image size must be less than 5MB' },
      }));
      return;
    }

    handleImageUpload(file);
  }, []);

  const handleImageUpload = useCallback(async (file: File) => {
    setState(prev => ({ 
      ...prev, 
      isUploadingImage: true, 
      errors: { ...prev.errors, profile_picture: undefined },
      successMessage: null,
    }));

    try {
      const response = await updateUserProfile(walletAddress, { profile_picture: file });
      setState(prev => ({
        ...prev,
        formData: { ...prev.formData, profile_picture: response.user.profile_picture },
        profile: prev.profile ? {
          ...prev.profile,
          profile_picture: response.user.profile_picture,
        } : null,
        isUploadingImage: false,
        successMessage: 'Profile picture uploaded successfully!',
      }));
    } catch (error) {
      console.error('Image upload failed:', error);
      setState(prev => ({
        ...prev,
        isUploadingImage: false,
        errors: { 
          ...prev.errors, 
          profile_picture: error instanceof Error ? error.message : 'Upload failed' 
        },
      }));
    }
  }, [walletAddress]);

  const handleImageDelete = useCallback(async () => {
    setState(prev => ({ 
      ...prev, 
      isUploadingImage: true, 
      errors: { ...prev.errors, profile_picture: undefined },
      successMessage: null,
    }));

    try {
      const response = await deleteProfilePicture(walletAddress);
      setState(prev => ({
        ...prev,
        formData: { ...prev.formData, profile_picture: null },
        profile: prev.profile ? {
          ...prev.profile,
          profile_picture: null,
        } : null,
        isUploadingImage: false,
        successMessage: 'Profile picture removed successfully!',
      }));
    } catch (error) {
      console.error('Image deletion failed:', error);
      setState(prev => ({
        ...prev,
        isUploadingImage: false,
        errors: { 
          ...prev.errors, 
          profile_picture: error instanceof Error ? error.message : 'Deletion failed' 
        },
      }));
    }
  }, [walletAddress]);

  const handleSave = useCallback(async () => {
    if (!validateForm()) return;

    setState(prev => ({ ...prev, isSaving: true, errors: {}, successMessage: null }));

    try {
      const updatePayload: any = {};
      
      // Only include changed text fields (profile_picture is handled separately)
      if (state.formData.username.trim() !== (state.profile?.username || '')) {
        updatePayload.username = state.formData.username.trim() || undefined;
      }
      if (state.formData.bio.trim() !== (state.profile?.bio || '')) {
        updatePayload.bio = state.formData.bio.trim() || undefined;
      }

      // Only make API call if there are text field changes
      if (Object.keys(updatePayload).length > 0) {
        const response = await updateUserProfile(walletAddress, updatePayload);
        
        // Update local profile state
        setState(prev => ({
          ...prev,
          profile: prev.profile ? {
            ...prev.profile,
            username: response.user.username,
            bio: response.user.bio,
          } : null,
          isSaving: false,
          successMessage: 'Profile updated successfully!',
        }));
      } else {
        setState(prev => ({
          ...prev,
          isSaving: false,
          successMessage: 'No changes to save.',
        }));
      }
    } catch (error) {
      console.error('Profile update failed:', error);
      setState(prev => ({
        ...prev,
        isSaving: false,
        errors: { 
          general: error instanceof Error ? error.message : 'Failed to update profile' 
        },
      }));
    }
  }, [validateForm, state.formData, state.profile, walletAddress]);

  const formatAddress = useCallback((address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, []);

  const copy = useCallback(async (text: string | null | undefined, addressType: string) => {
    try {
      if (text) {
        await navigator.clipboard.writeText(text);
        setCopiedAddress(addressType);
        setTimeout(() => setCopiedAddress(null), 2000);
      }
    } catch {}
  }, []);

  const fetchEthBalance = useCallback(async (addr: string): Promise<string> => {
    const res = await fetch(`${BLOCKCHAIN_API_BASE}/ethBalance/${encodeURIComponent(addr)}`);
    if (!res.ok) throw new Error(`Failed: ${res.status}`);
    const data = await res.json();
    if (data?.eth) return data.eth as string;
    if (data?.error) throw new Error(data.error);
    throw new Error('Unexpected response');
  }, []);

  // Load balances after profile is present
  useEffect(() => {
    if (!isOpen) return;

    const actualWallet = (state.profile as any)?.wallet || walletAddress;
    const tradingWallet = (state.profile as any)?.trading_wallet as string | undefined;

    let active = true;
    const run = async () => {
      // Reset
      setWalletEth(null);
      setTradingEth(null);
      setWalletEthError(null);
      setTradingEthError(null);

      // Wallet balance
      if (actualWallet) {
        setLoadingWalletEth(true);
        try {
          const eth = await fetchEthBalance(actualWallet);
          if (!active) return;
          setWalletEth(eth);
        } catch (err) {
          if (!active) return;
          setWalletEthError(err instanceof Error ? err.message : 'Failed to fetch balance');
        } finally {
          if (active) setLoadingWalletEth(false);
        }
      }

      // Trading wallet balance
      if (tradingWallet) {
        setLoadingTradingEth(true);
        try {
          const eth = await fetchEthBalance(tradingWallet);
          if (!active) return;
          setTradingEth(eth);
        } catch (err) {
          if (!active) return;
          setTradingEthError(err instanceof Error ? err.message : 'Failed to fetch balance');
        } finally {
          if (active) setLoadingTradingEth(false);
        }
      }
    };

    run();
    return () => { active = false; };
  }, [isOpen, walletAddress, state.profile, fetchEthBalance]);

  const formatNumber = useCallback((value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '0';
    return num.toLocaleString();
  }, []);

  if (!mounted || !isOpen) return null;

  const modalContent = (
    <div className={styles.modal}>
      <div 
        className={styles.backdrop} 
        onClick={() => !state.isSaving && !state.isUploadingImage && onClose()}
      />
      
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.titleWrapper}>
              <div className={styles.titleIcon}>
                <Icons.User />
              </div>
              <h2 className={styles.title}>Profile Settings</h2>
            </div>
            <p className={styles.headerSubtitle}>Manage your identity and trading details</p>
          </div>
          <button
            onClick={onClose}
            disabled={state.isSaving || state.isUploadingImage}
            className={styles.closeButton}
            aria-label="Close modal"
          >
            <Icons.Close />
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Status Messages */}
          {state.successMessage && (
            <div className={`${styles.statusMessage} ${styles.successMessage}`}>
              <Icons.Check />
              <span>{state.successMessage}</span>
            </div>
          )}
          
          {state.errors.general && (
            <div className={`${styles.statusMessage} ${styles.errorMessage}`}>
              <span>{state.errors.general}</span>
            </div>
          )}

          {state.isLoading ? (
            <div className={styles.loadingState}>
              <div className={styles.loadingSpinner} />
              <p>Loading profile...</p>
            </div>
          ) : (
            <>

              {/* Top Avatar */}
              <div className={styles.topAvatar}>
                <div
                  className={styles.avatarContainer}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className={styles.avatarWrapper}>
                    {state.formData.profile_picture && typeof state.formData.profile_picture === 'string' ? (
                      <Image
                        src={state.formData.profile_picture}
                        alt="Profile"
                        width={100}
                        height={100}
                        className={styles.avatar}
                      />
                    ) : (
                      <div className={styles.avatarPlaceholder}>
                        <Icons.User />
                      </div>
                    )}

                    {!state.isUploadingImage && (
                      <div className={styles.avatarOverlay}>
                        <Icons.Camera />
                        <span>Change Photo</span>
                      </div>
                    )}

                    {state.isUploadingImage && (
                      <div className={styles.avatarLoading}>
                        <span className={styles.loadingSpinner} />
                      </div>
                    )}
                  </div>

                  {state.formData.profile_picture && typeof state.formData.profile_picture === 'string' && !state.isUploadingImage && (
                    <button
                      onClick={handleImageDelete}
                      disabled={state.isUploadingImage}
                      className={styles.removeAvatarButton}
                      aria-label="Remove avatar"
                    >
                      <Icons.Trash />
                    </button>
                  )}
                </div>

                {state.errors.profile_picture && (
                  <div className={styles.errorText}>
                    {state.errors.profile_picture}
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className={styles.hiddenFileInput}
                />
              </div>

              {/* Addresses & Balances */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <Icons.Wallet />
                  <h3 className={styles.sectionTitle}>Wallets & Balances</h3>
                </div>
                <div className={styles.balancesGrid}>
                  {/* Actual Wallet */}
                  <div className={styles.addressCard}>
                    <div className={styles.addressCardHeader}>
                      <span className={styles.addressLabel}>Main Wallet</span>
                      <div className={styles.addressBadge}>Active</div>
                    </div>
                    <div className={styles.addressContent}>
                      <div className={styles.addressRow}>
                        <code className={styles.addressValue}>{formatAddress((state.profile as any)?.wallet || walletAddress)}</code>
                        <button 
                          className={styles.copyButton} 
                          onClick={() => copy((state.profile as any)?.wallet || walletAddress, 'wallet')}
                          data-copied={copiedAddress === 'wallet'}
                        >
                          {copiedAddress === 'wallet' ? <Icons.Check /> : <Icons.Copy />}
                          <span>{copiedAddress === 'wallet' ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </div>
                      <div className={styles.balanceInfo}>
                        <div className={styles.balanceRow}>
                          <span className={styles.balanceLabel}>Balance</span>
                          {loadingWalletEth ? (
                            <span className={styles.balanceValue}>
                              <span className={styles.miniSpinner} />
                              <span>Loading...</span>
                            </span>
                          ) : walletEthError ? (
                            <span className={styles.balanceError}>{walletEthError}</span>
                          ) : walletEth !== null ? (
                            <span className={styles.balanceValue}>
                              <span className={styles.ethAmount}>{Number(walletEth).toFixed(6)}</span>
                              <span className={styles.ethSymbol}>ETH</span>
                            </span>
                          ) : (
                            <span className={styles.balanceValue}>—</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trading Wallet */}
                  <div className={styles.addressCard}>
                    <div className={styles.addressCardHeader}>
                      <span className={styles.addressLabel}>Trading Wallet</span>
                      <div className={styles.addressBadge} data-type="trading">Trading</div>
                    </div>
                    <div className={styles.addressContent}>
                      {(state.profile as any)?.trading_wallet ? (
                        <>
                          <div className={styles.addressRow}>
                            <code className={styles.addressValue}>{formatAddress((state.profile as any)?.trading_wallet)}</code>
                            <button 
                              className={styles.copyButton} 
                              onClick={() => copy((state.profile as any)?.trading_wallet, 'trading')}
                              data-copied={copiedAddress === 'trading'}
                            >
                              {copiedAddress === 'trading' ? <Icons.Check /> : <Icons.Copy />}
                              <span>{copiedAddress === 'trading' ? 'Copied!' : 'Copy'}</span>
                            </button>
                          </div>
                          <div className={styles.balanceInfo}>
                            <div className={styles.balanceRow}>
                              <span className={styles.balanceLabel}>Balance</span>
                              {loadingTradingEth ? (
                                <span className={styles.balanceValue}>
                                  <span className={styles.miniSpinner} />
                                  <span>Loading...</span>
                                </span>
                              ) : tradingEthError ? (
                                <span className={styles.balanceError}>{tradingEthError}</span>
                              ) : tradingEth !== null ? (
                                <span className={styles.balanceValue}>
                                  <span className={styles.ethAmount}>{Number(tradingEth).toFixed(6)}</span>
                                  <span className={styles.ethSymbol}>ETH</span>
                                </span>
                              ) : (
                                <span className={styles.balanceValue}>—</span>
                              )}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className={styles.emptyState}>
                          <p>No trading wallet configured</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Section */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <Icons.User />
                  <h3 className={styles.sectionTitle}>Profile Details</h3>
                </div>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="username" className={styles.formLabel}>
                      Username
                      <span className={styles.optional}>(optional)</span>
                    </label>
                    <div className={styles.inputWrapper}>
                      <input
                        id="username"
                        type="text"
                        value={state.formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        placeholder="Choose a unique username"
                        className={styles.formInput}
                        maxLength={VALIDATION_RULES.USERNAME.MAX_LENGTH}
                      />
                      <div className={styles.inputHint}>
                        {state.formData.username.length}/{VALIDATION_RULES.USERNAME.MAX_LENGTH} characters
                      </div>
                    </div>
                    {state.errors.username && (
                      <div className={styles.formError}>{state.errors.username}</div>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="bio" className={styles.formLabel}>
                      Bio
                      <span className={styles.optional}>(optional)</span>
                    </label>
                    <div className={styles.inputWrapper}>
                      <textarea
                        id="bio"
                        value={state.formData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        placeholder="Tell the community about yourself, your trading style, or interests..."
                        className={`${styles.formInput} ${styles.formTextarea}`}
                        maxLength={VALIDATION_RULES.BIO.MAX_LENGTH}
                        rows={3}
                      />
                      <div className={styles.inputHint}>
                        {state.formData.bio.length}/{VALIDATION_RULES.BIO.MAX_LENGTH} characters
                      </div>
                    </div>
                    {state.errors.bio && (
                      <div className={styles.formError}>{state.errors.bio}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Section */}
              {state.profile && (
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <Icons.TrendingUp />
                    <h3 className={styles.sectionTitle}>Trading Statistics</h3>
                  </div>
                  <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                      <div className={styles.statIcon} data-type="tokens">🚀</div>
                      <div className={styles.statContent}>
                        <div className={styles.statValue}>{formatNumber(state.profile.tokens_launched)}</div>
                        <div className={styles.statLabel}>Tokens Launched</div>
                      </div>
                    </div>
                    <div className={styles.statCard}>
                      <div className={styles.statIcon} data-type="purchased">💰</div>
                      <div className={styles.statContent}>
                        <div className={styles.statValue}>{formatNumber(state.profile.tokens_bought)}</div>
                        <div className={styles.statLabel}>Tokens Bought</div>
                      </div>
                    </div>
                    <div className={styles.statCard}>
                      <div className={styles.statIcon} data-type="pnl">📈</div>
                      <div className={styles.statContent}>
                        <div className={styles.statValue} data-positive={Number(state.profile.total_pnl) >= 0}>
                          ${formatNumber(state.profile.total_pnl)}
                        </div>
                        <div className={styles.statLabel}>Total P&L</div>
                      </div>
                    </div>
                    <div className={styles.statCard}>
                      <div className={styles.statIcon} data-type="score">⭐</div>
                      <div className={styles.statContent}>
                        <div className={styles.statValue}>{formatNumber(state.profile.dev_score)}</div>
                        <div className={styles.statLabel}>Dev Score</div>
                      </div>
                    </div>
                    <div className={styles.statCard}>
                      <div className={styles.statIcon} data-type="buy">🔼</div>
                      <div className={styles.statContent}>
                        <div className={styles.statValue}>${formatNumber(state.profile.buy_volume)}</div>
                        <div className={styles.statLabel}>Buy Volume</div>
                      </div>
                    </div>
                    <div className={styles.statCard}>
                      <div className={styles.statIcon} data-type="sell">🔽</div>
                      <div className={styles.statContent}>
                        <div className={styles.statValue}>${formatNumber(state.profile.sell_volume)}</div>
                        <div className={styles.statLabel}>Sell Volume</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className={styles.modalFooter}>
                <button
                  onClick={onClose}
                  disabled={state.isSaving}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={state.isSaving || state.isUploadingImage}
                  className={styles.saveButton}
                >
                  {state.isSaving ? (
                    <>
                      <span className={styles.buttonSpinner} />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Icons.Check />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
