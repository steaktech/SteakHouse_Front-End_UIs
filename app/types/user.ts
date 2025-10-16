// types/user.ts

export interface AddUserPayload {
    wallet_address: string;
    username?: string;
    profile_picture?: string;
    bio?: string;
  }
  
  export interface UserProfile {
    wallet_address: string;
    username: string | null;
    profile_picture: string | null;
    bio: string | null;
    tokens_launched: number;
    tokens_bought: number;
    total_pnl: string;
    buy_volume: string;
    sell_volume: string;
    dev_likes: string;
    dev_dislikes: string;
    dev_score: string;
    leaderboard_rank: number;
    saved_tokens: string[];
    liked_tokens: string[];
    launched_tokens?: Array<{
      token_address: string;
      token_name: string;
      token_symbol: string;
    }>;
  }

  export interface UpdateProfilePayload {
    username?: string;
    bio?: string;
    profile_picture?: string | File | null;
  }

  export interface UpdateProfileResponse {
    user: {
      id: string;
      wallet_address: string;
      username: string;
      profile_picture: string;
      bio: string;
      created_at: string;
      updated_at: string;
    };
  }

