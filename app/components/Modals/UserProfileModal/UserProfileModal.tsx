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
          username: profile.username || '',
          bio: profile.bio || '',
          profile_picture: profile.profile_picture,
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
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, []);

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
          <h2 className={styles.title}>User Profile</h2>
          <button
            onClick={onClose}
            disabled={state.isSaving || state.isUploadingImage}
            className={styles.closeButton}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Status Messages */}
          {state.successMessage && (
            <div className={`${styles.statusMessage} ${styles.successMessage}`}>
              {state.successMessage}
            </div>
          )}
          
          {state.errors.general && (
            <div className={`${styles.statusMessage} ${styles.errorMessage}`}>
              {state.errors.general}
            </div>
          )}

          {state.isLoading ? (
            <div className={styles.profileSection}>
              <div className={styles.loadingSpinner} />
              Loading profile...
            </div>
          ) : (
            <>
              {/* Profile Image Section */}
              <div className={styles.profileSection}>
                <div className={styles.profileImageContainer}>
                  <div 
                    className={styles.imageHoverContainer}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {state.formData.profile_picture && typeof state.formData.profile_picture === 'string' ? (
                      <Image
                        src={state.formData.profile_picture}
                        alt="Profile"
                        width={120}
                        height={120}
                        className={styles.profileImage}
                      />
                    ) : (
                      <div className={styles.profileImagePlaceholder}>
                        👤
                      </div>
                    )}
                    
                    {!state.isUploadingImage && (
                      <div className={styles.editOverlay}>
                        <div className={styles.editIcon}>✏️</div>
                      </div>
                    )}
                  </div>
                  
                  {state.isUploadingImage && (
                    <div className={styles.uploadingIndicator}>
                      <span className={styles.loadingSpinner} />
                      Uploading...
                    </div>
                  )}
                  
                  {state.formData.profile_picture && typeof state.formData.profile_picture === 'string' && !state.isUploadingImage && (
                    <button
                      onClick={handleImageDelete}
                      disabled={state.isUploadingImage}
                      className={`${styles.imageButton} ${styles.deleteButton}`}
                    >
                      Remove Image
                    </button>
                  )}
                  
                  {state.errors.profile_picture && (
                    <div className={styles.errorText}>
                      {state.errors.profile_picture}
                    </div>
                  )}
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className={styles.hiddenFileInput}
                />
              </div>

              {/* Form Section */}
              <div className={styles.formSection}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Wallet Address</label>
                  <input
                    type="text"
                    value={formatAddress(walletAddress)}
                    disabled
                    className={styles.input}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Username</label>
                  <input
                    type="text"
                    value={state.formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="Enter username (optional)"
                    className={styles.input}
                    maxLength={VALIDATION_RULES.USERNAME.MAX_LENGTH}
                  />
                  {state.errors.username && (
                    <div className={styles.errorText}>{state.errors.username}</div>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Bio</label>
                  <textarea
                    value={state.formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell us about yourself (optional)"
                    className={`${styles.input} ${styles.textarea}`}
                    maxLength={VALIDATION_RULES.BIO.MAX_LENGTH}
                  />
                  <div className={styles.label}>
                    {state.formData.bio.length}/{VALIDATION_RULES.BIO.MAX_LENGTH}
                  </div>
                  {state.errors.bio && (
                    <div className={styles.errorText}>{state.errors.bio}</div>
                  )}
                </div>
              </div>

              {/* Stats Section */}
              {state.profile && (
                <div className={styles.statsGrid}>
                  <div className={styles.statCard}>
                    <div className={styles.statLabel}>Tokens Launched</div>
                    <div className={styles.statValue}>{state.profile.tokens_launched}</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statLabel}>Tokens Bought</div>
                    <div className={styles.statValue}>{state.profile.tokens_bought}</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statLabel}>Total P&L</div>
                    <div className={styles.statValue}>${formatNumber(state.profile.total_pnl)}</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statLabel}>Dev Score</div>
                    <div className={styles.statValue}>{formatNumber(state.profile.dev_score)}</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statLabel}>Buy Volume</div>
                    <div className={styles.statValue}>${formatNumber(state.profile.buy_volume)}</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statLabel}>Sell Volume</div>
                    <div className={styles.statValue}>${formatNumber(state.profile.sell_volume)}</div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className={styles.actions}>
                <button
                  onClick={onClose}
                  disabled={state.isSaving}
                  className={`${styles.button} ${styles.secondaryButton}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={state.isSaving || state.isUploadingImage}
                  className={`${styles.button} ${styles.primaryButton}`}
                >
                  {state.isSaving ? (
                    <>
                      <span className={styles.loadingSpinner} />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
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
