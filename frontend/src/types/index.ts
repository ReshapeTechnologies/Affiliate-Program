import type { CommissionRule, EarningsBreakdown } from "./commission";

export interface User {
  id: string;
  name: string;
  email: string;
  role?: "user" | "admin";
  avatar?: string;
  createdAt?: string; // User's joining/registration date
}

export type ReferralStatus = "active" | "inactive" | "exhausted";

export interface ReferralCode {
  id: string;
  code: string;
  createdAt: string;
  status: ReferralStatus;
  commissionConfig?: CommissionRule[];
  quota?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  durationDays?: number;
  // Dynamic event stats - all events including signup
  eventStats: Record<string, number>;
  earnings?: EarningsBreakdown; // Calculated earnings for this code
}

export interface DashboardStats {
  totalReferralCodes: number;
  activeReferralCodes: number;
  inactiveReferralCodes: number;
  exhaustedReferralCodes: number;
  // Dynamic event stats aggregated across all codes (includes signup, free_trial, purchase, etc.)
  eventStats: Record<string, number>;
  totalEarnings: EarningsBreakdown; // Total income
}

export interface TimeSeriesData {
  date: string;
  // Dynamic event counts by type (signup, free_trial, purchase, etc.)
  eventCounts: Record<string, number>;
}
