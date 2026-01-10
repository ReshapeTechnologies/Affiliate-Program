import type { ReferralCode, DashboardStats, ReferralStatus } from "../types";
import type { AffiliateReferralCode } from "../types/commission";
import { calculateEarnings } from "./earnings";

/**
 * Provide a shared zeroed-out dashboard stats structure
 */
export function createEmptyDashboardStats(
  currency: string = "USD"
): DashboardStats {
  return {
    totalReferralCodes: 0,
    activeReferralCodes: 0,
    inactiveReferralCodes: 0,
    exhaustedReferralCodes: 0,
    eventStats: {},
    totalEarnings: {
      breakdown: {},
      total: 0,
      currency,
    },
  };
}

/**
 * Transform backend referral data to frontend format
 */
export function transformReferralCode(
  backendRef: AffiliateReferralCode
): ReferralCode {
  const now = new Date();
  const endDate = backendRef.endDate ? new Date(backendRef.endDate) : null;
  const startDate = backendRef.startDate
    ? new Date(backendRef.startDate)
    : null;
  const quota = typeof backendRef.quota === "number" ? backendRef.quota : null;

  // Use stats from backend - all events including signup
  const eventStats: Record<string, number> = backendRef.stats || {};

  // Determine status based on dates and quota
  let status: ReferralStatus = "active";
  const inactiveBySchedule = Boolean(
    (endDate && endDate < now) || (startDate && startDate > now)
  );

  // Total conversions = sum of all eventStats (includes signup)
  const totalConversions = Object.values(eventStats).reduce(
    (sum, count) => sum + count,
    0
  );

  if (inactiveBySchedule) {
    status = "inactive";
  } else if (quota !== null && totalConversions >= quota) {
    status = "exhausted";
  }

  // Calculate earnings using stats object which includes all events
  const earnings = calculateEarnings(
    eventStats,
    backendRef.commissionConfig || []
  );

  return {
    id: backendRef.id,
    code: backendRef.code,
    createdAt:
      backendRef.createdAt || backendRef.startDate || new Date().toISOString(),
    status,
    commissionConfig: backendRef.commissionConfig || [],
    quota,
    startDate: backendRef.startDate || null,
    endDate: backendRef.endDate || null,
    durationDays: backendRef.noOfDays,
    eventStats,
    earnings,
  };
}

/**
 * Transform array of backend referrals to frontend format
 */
export function transformReferralCodes(
  backendRefs: AffiliateReferralCode[]
): ReferralCode[] {
  return backendRefs.map((ref) => transformReferralCode(ref));
}

/**
 * Calculate dashboard stats from referral codes
 */
export function calculateDashboardStats(
  referralCodes: ReferralCode[]
): DashboardStats {
  const defaultCurrency =
    referralCodes.find((code) => code.earnings)?.earnings?.currency || "USD";

  const emptyStats = createEmptyDashboardStats(defaultCurrency);

  const totals = referralCodes.reduce((acc, code) => {
    // Aggregate dynamic eventStats (includes signup, free_trial, purchase, etc.)
    if (code.eventStats) {
      for (const [event, count] of Object.entries(code.eventStats)) {
        acc.eventStats![event] = (acc.eventStats![event] || 0) + count;
      }
    }

    if (code.status === "active") {
      acc.activeReferralCodes += 1;
    } else if (code.status === "inactive") {
      acc.inactiveReferralCodes += 1;
    } else if (code.status === "exhausted") {
      acc.exhaustedReferralCodes += 1;
    }

    if (code.earnings) {
      acc.totalEarnings.total += code.earnings.total;
      acc.totalEarnings.currency = code.earnings.currency;

      // Aggregate breakdown
      for (const [event, amount] of Object.entries(code.earnings.breakdown)) {
        acc.totalEarnings.breakdown[event] =
          (acc.totalEarnings.breakdown[event] || 0) + amount;
      }
    }

    return acc;
  }, emptyStats);

  return {
    totalReferralCodes: referralCodes.length,
    activeReferralCodes: totals.activeReferralCodes,
    inactiveReferralCodes: totals.inactiveReferralCodes,
    exhaustedReferralCodes: totals.exhaustedReferralCodes,
    eventStats: totals.eventStats,
    totalEarnings: {
      breakdown: totals.totalEarnings.breakdown,
      total: Number(totals.totalEarnings.total.toFixed(2)),
      currency: totals.totalEarnings.currency,
    },
  };
}

/**
 * Find the earliest meaningful start date across referral codes.
 * Prefers explicit startDate, falls back to createdAt.
 */
export function getEarliestStartDate(
  referralCodes: ReferralCode[]
): string | null {
  if (!referralCodes.length) return null;

  const timestamps: number[] = [];

  referralCodes.forEach((code) => {
    const candidate =
      code.startDate ||
      (code.createdAt ? code.createdAt.split("T")[0] : undefined);
    if (candidate) {
      const ts = new Date(candidate).getTime();
      if (!Number.isNaN(ts)) {
        timestamps.push(ts);
      }
    }
  });

  if (!timestamps.length) return null;

  const earliest = Math.min(...timestamps);
  return new Date(earliest).toISOString().split("T")[0];
}
