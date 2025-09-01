// types/user.ts

export interface AddUserPayload {
    wallet_address: string;
    username?: string;
    profile_picture?: string;
    bio?: string;
  }
  
  export interface UserProfile {
    wallet_address: string;
    username: string;
    profile_picture: string;
    bio: string;
    tokens_launched: number;
    tokens_bought: number;
    total_pnl: number;
    buy_volume: number;
    sell_volume: number;
    dev_likes: number;
    dev_dislikes: number;
    dev_score: number;
    leaderboard_rank: number;
    saved_tokens: string[];
    liked_tokens: string[];
    launched_tokens: Array<{
      token_address: string;
      token_name: string;
      token_symbol: string;
    }>;
  }