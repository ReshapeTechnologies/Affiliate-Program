// Commission and Earnings Types

export type CommissionEventType = "signup" | "free_trial" | "purchase" | string;

export interface CommissionRule {
  event: CommissionEventType; // Matches backend: 'event' not 'eventType'
  rate: number;
  currency: string;
  display_name?: string; // Human-readable name from config mapping
}

export interface EarningsBreakdown {
  breakdown: Record<string, number>; // e.g. { 'free_trial': 50, 'purchase': 100 }
  total: number;
  currency: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Config Mapping Types (for dynamic event name resolution)
// ─────────────────────────────────────────────────────────────────────────────

/** Mapping entry from the hosted JSON config */
export interface ConfigMapping {
  commission_config_event_name: string; // e.g., "3_meals_logged"
  backend_activity_event_name: string; // e.g., "3 Meals Logged"
  display_name: string; // e.g., "3 Meals Logged"
}

/** Event metadata built from union of all codes */
export interface EventMetadata {
  displayName: string;
  isPurchaseType: boolean;
}

/** Union map of all event types across referral codes */
export type EventUnionMap = Map<string, EventMetadata>;

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
    // Dynamic keys spread from eventStats (e.g., free_trial, purchase, 3_meals_logged)
    [key: string]: number;
  };
}

/** Enriched event with display metadata (new response format) */
export interface EnrichedEvent {
  commission_event_name: string; // Original config name (e.g., "3_meals_logged")
  display_name: string; // Human-readable (e.g., "3 Meals Logged")
  count: number;
  timestamps: string[];
}

/** Enriched referral code data (new response format) */
export interface EnrichedReferralCodeData {
  code: string;
  events: EnrichedEvent[];
}

/** User with purchase events - used in performance tab */
export interface ReferredUserWithHistory {
  userId: string;
  email: string | null;
  name: string | null;
  subscriptionInfo: any | null;
  createdAt: string | null;
  referralCreatedAt?: string | null;
  // Combined and sorted events from both purchase and activity sources
  events: NormalizedEvent[];
  // Separate arrays for backward compatibility
  purchaseEvents?: NormalizedEvent[];
  activityEvents?: NormalizedEvent[];
}

/** Normalized event shape (common for both purchase and activity events) */
export interface NormalizedEvent {
  type: string; // e.g. "free_trial", "purchase", "3_meals_logged"
  source: "purchase" | "activity";
  date: string | null;
  raw: any; // Original event data
}

/** Single purchase event from RevenueCat (legacy, kept for raw data) */
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
    [key: string]: number;
  };
  users: ReferredUserWithHistory[];
  // New enriched format
  code?: string;
  events?: EnrichedEvent[];
}

/** Response from GET /api/get-affiliate-purchase-history (single user) */
export interface AffiliatePurchaseHistoryByUser {
  referralCode: string;
  user: ReferredUserWithHistory;
  events: NormalizedEvent[];
  purchaseEvents?: NormalizedEvent[];
  activityEvents?: NormalizedEvent[];
}

/** Response from GET /api/get-affiliate-purchase-history (all codes - new format) */
export interface AffiliatePurchaseHistoryResponse {
  // Legacy format (backward compatible)
  data: AffiliatePurchaseHistoryByCode[];
  // New enriched format
  referral_codes?: EnrichedReferralCodeData[];
}
