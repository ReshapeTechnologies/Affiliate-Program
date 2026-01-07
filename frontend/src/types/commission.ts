// Commission and Earnings Types

export type CommissionEventType = "signup" | "free_trial" | "purchase" | string;

export interface CommissionRule {
  event: CommissionEventType; // Matches backend: 'event' not 'eventType'
  rate: number;
  currency: string;
}

export interface EarningsBreakdown {
  breakdown: Record<string, number>; // e.g. { 'free_trial': 50, 'purchase': 100 }
  total: number;
  currency: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// API Response Types (matching backend responses)
// ─────────────────────────────────────────────────────────────────────────────

/** Response from GET /api/get-affiliate-referral-codes */
export interface AffiliateReferralCode {
  id: string;
  code: string;
  quota: number | null;
  noOfDays: number;
  startDate: string | null;
  endDate: string | null;
  createdAt: string | null;
  commissionConfig: CommissionRule[];
  stats: {
    totalReferrals: number;
    free_trial: number;
    purchase: number;
  };
}

/** User with purchase events - used in performance tab */
export interface ReferredUserWithHistory {
  userId: string;
  email: string | null;
  name: string | null;
  subscriptionInfo: any | null;
  createdAt: string | null;
  referralCreatedAt?: string | null;
  events: PurchaseEvent[];
}

/** Single purchase event from RevenueCat */
export interface PurchaseEvent {
  type: string; // e.g. "INITIAL_PURCHASE", "RENEWAL", etc.
  period_type?: string; // "TRIAL" | "NORMAL"
  product_id?: string;
  price?: number;
  currency?: string;
  purchased_at_ms?: number;
  [key: string]: any; // Allow other RevenueCat fields
}

/** Response from GET /api/get-affiliate-purchase-history (single code) */
export interface AffiliatePurchaseHistoryByCode {
  referralCode: string;
  commissionConfig: CommissionRule[];
  stats: {
    totalReferrals: number;
    free_trial: number;
    purchase: number;
  };
  users: ReferredUserWithHistory[];
}

/** Response from GET /api/get-affiliate-purchase-history (single user) */
export interface AffiliatePurchaseHistoryByUser {
  referralCode: string;
  user: ReferredUserWithHistory;
  events: PurchaseEvent[];
}
