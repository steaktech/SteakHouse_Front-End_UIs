// types.ts
import type { UserProfile } from '@/app/types/user';

export interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
}

export interface ProfileFormData {
  username: string;
  bio: string;
  profile_picture: string | File | null;
}

export interface ProfileFormErrors {
  username?: string;
  bio?: string;
  profile_picture?: string;
  general?: string;
}

export interface ProfileModalState {
  isLoading: boolean;
  isSaving: boolean;
  isUploadingImage: boolean;
  profile: UserProfile | null;
  formData: ProfileFormData;
  errors: ProfileFormErrors;
  successMessage: string | null;
}

export const VALIDATION_RULES = {
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
