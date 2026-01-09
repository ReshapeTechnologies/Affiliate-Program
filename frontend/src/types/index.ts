import type { CommissionRule, EarningsBreakdown } from "./commission";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt?: string; // User's joining/registration date
}

export type ReferralStatus = "active" | "inactive" | "exhausted";

export interface ReferralCode {
  id: string;
  code: string;
  createdAt: string;
  conversions: number; // signup + all configured event conversions
  status: ReferralStatus;
  commissionConfig?: CommissionRule[];
  quota?: number | null;
  referralsCount: number; // signups count
  signupConversions: number; // same as referralsCount, explicit for clarity
  startDate?: string | null;
  endDate?: string | null;
  durationDays?: number;
  // Dynamic event stats - keys match commissionConfig event names
  eventStats?: Record<string, number>;
  // Legacy fields for backward compatibility
  trialConversions?: number;
  paidConversions?: number;
  earnings?: EarningsBreakdown; // Calculated earnings for this code
}

export interface DashboardStats {
  totalReferralCodes: number;
  activeReferralCodes: number;
  inactiveReferralCodes: number;
  exhaustedReferralCodes: number;
  totalConversions: number; // signup + all configured event conversions
  totalReferrals: number; // same as signupConversions
  signupConversions: number;
  // Dynamic event stats aggregated across all codes
  eventStats?: Record<string, number>;
  // Legacy fields for backward compatibility
  trialConversions: number;
  paidConversions: number;
  totalEarnings: EarningsBreakdown; // Total income
}

export interface TimeSeriesData {
  date: string;
  signupConversions: number;
  // Dynamic event counts by type
  eventCounts?: Record<string, number>;
  // Legacy fields for backward compatibility
  trialConversions: number;
  paidConversions: number;
}
