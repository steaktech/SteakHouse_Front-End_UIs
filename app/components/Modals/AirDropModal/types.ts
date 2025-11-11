// types.ts
export interface AirDropModalProps {
  isOpen: boolean;
  onClose: () => void;
  tradingWallet?: string | null;
}

export interface AirDropPointsResponse {
  wallet: string;
  points: {
    trade_points: number;
    dev_points: number;
    referral_points: number;
    total: number;
  };
  bases: {
    my_trade_usd: number;
    my_dev_usd_spent: number;
    referees_trade_usd: number;
  };
}
