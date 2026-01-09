import StatsCard from "./StatsCard";
import ReferralCodesTable from "./ReferralCodesTable";
import HomeSkeleton from "./HomeSkeleton";
import { formatCurrency } from "../config/commission";
import type { ReferralCode, DashboardStats } from "../types";

interface HomeViewProps {
  stats: DashboardStats;
  referralCodes: ReferralCode[];
  loading?: boolean;
}

/**
 * Format event type for display (e.g., "free_trial" -> "Free Trial", "3_meals_logged" -> "3 Meals Logged")
 * This is a fallback when display_name is not available
 */
function formatEventType(eventType: string): string {
  return eventType
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Build a lookup map of event -> display_name from all referral codes
 */
function buildEventDisplayNameMap(
  referralCodes: ReferralCode[]
): Map<string, string> {
  const map = new Map<string, string>();
  for (const code of referralCodes) {
    for (const config of code.commissionConfig || []) {
      if (config.display_name && !map.has(config.event)) {
        map.set(config.event, config.display_name);
      }
    }
  }
  return map;
}

/**
 * Build dynamic conversion subtitle from eventStats
 * Note: Signups = Referrals count, so we don't duplicate it
 */
function buildConversionSubtitle(
  stats: DashboardStats,
  displayNameMap: Map<string, string>
): string {
  const parts: string[] = [];

  // Add dynamic event stats (skip "signup" since referrals count IS signups)
  if (stats.eventStats && Object.keys(stats.eventStats).length > 0) {
    Object.entries(stats.eventStats).forEach(([eventType, count]) => {
      // Skip "signup" event - it's the same as referrals count
      if (eventType.toLowerCase() === "signup") return;

      // Use display name from map if available, otherwise format the event type
      const displayName =
        displayNameMap.get(eventType) || formatEventType(eventType);
      parts.push(`${count.toLocaleString()} ${displayName.toLowerCase()}`);
    });
  } else {
    // Fallback to legacy fields if no eventStats
    if (stats.trialConversions > 0) {
      parts.push(`${stats.trialConversions.toLocaleString()} trial`);
    }
    if (stats.paidConversions > 0) {
      parts.push(`${stats.paidConversions.toLocaleString()} paid`);
    }
  }

  return parts.length > 0 ? parts.join(" · ") : "No conversions yet";
}

/**
 * Build dynamic earnings subtitle from breakdown
 */
function buildEarningsSubtitle(
  stats: DashboardStats,
  displayNameMap: Map<string, string>
): string {
  const { breakdown, currency } = stats.totalEarnings;
  const parts: string[] = [];

  // Add each breakdown item
  Object.entries(breakdown).forEach(([eventType, amount]) => {
    if (amount > 0) {
      // Use display name from map if available, otherwise format the event type
      const displayName =
        displayNameMap.get(eventType) || formatEventType(eventType);
      parts.push(
        `${formatCurrency(amount, currency)} from ${displayName.toLowerCase()}`
      );
    }
  });

  return parts.length > 0 ? parts.join(" · ") : "No earnings yet";
}

export default function HomeView({
  stats,
  referralCodes,
  loading = false,
}: HomeViewProps) {
  // Build display name map from all referral codes
  const displayNameMap = buildEventDisplayNameMap(referralCodes);

  if (loading) {
    return <HomeSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="stats-grid">
        <StatsCard
          title="Total Referral Codes"
          value={stats.totalReferralCodes}
          subtitle={`${stats.inactiveReferralCodes} inactive · ${stats.activeReferralCodes} active · ${stats.exhaustedReferralCodes} exhausted`}
        />

        <StatsCard
          title="Total Conversions"
          value={stats.totalConversions.toLocaleString()}
          subtitle={buildConversionSubtitle(stats, displayNameMap)}
        />
        <StatsCard
          title="Total Earnings"
          value={formatCurrency(
            stats.totalEarnings.total,
            stats.totalEarnings.currency
          )}
          subtitle={buildEarningsSubtitle(stats, displayNameMap)}
        />
      </div>

      {/* Referral Codes Table */}
      <ReferralCodesTable codes={referralCodes} />
    </div>
  );
}
