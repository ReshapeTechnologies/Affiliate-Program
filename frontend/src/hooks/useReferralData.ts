import { useState, useEffect } from "react";
import { apiService } from "../services/api";
import {
  transformReferralCodes,
  calculateDashboardStats,
  createEmptyDashboardStats,
} from "../utils/transformers";
import { buildTimeSeriesFromUsers } from "../utils/timeSeries";
import type { ReferralCode, DashboardStats, TimeSeriesData } from "../types";

interface UseReferralDataReturn {
  referralCodes: ReferralCode[];
  stats: DashboardStats;
  timeSeriesData: TimeSeriesData[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useReferralData(): UseReferralDataReturn {
  const [referralCodes, setReferralCodes] = useState<ReferralCode[]>([]);
  const [stats, setStats] = useState<DashboardStats>(() =>
    createEmptyDashboardStats("USD")
  );
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use system/null identifier to fetch system-level codes (existing logic)
      const response = await apiService.getAffiliateReferralCodes("system");

      if (response.success && response.data) {
        // Transform backend data to frontend format (with earnings calculation)
        // transformReferralCodes now handles the new AffiliateReferralCode structure
        let transformedCodes = transformReferralCodes(response.data);

        // Fetch purchase history for each referral code to get time series data
        // Uses the NEW getAffiliatePurchaseHistory API which returns full event details
        // Collect all users from all referral codes for centralized time series generation
        const allUsers: Array<{
          referralCreatedAt?: string | null;
          events?: any[];
        }> = [];

        // We fetch history for "system" (null affiliate) to match the codes above.
        try {
          const historyResponse = await apiService.getAffiliatePurchaseHistory(
            "system"
          );

          if (historyResponse.success && historyResponse.data) {
            // data is array of { referralCode, users: [ { events:[...] } ] }
            historyResponse.data.forEach((codeGroup: any) => {
              if (codeGroup.users && Array.isArray(codeGroup.users)) {
                codeGroup.users.forEach((user: any) => {
                  allUsers.push({
                    referralCreatedAt: user?.referralCreatedAt ?? null,
                    events: user?.events ?? [],
                  });
                });
              }
            });
          }
        } catch (err) {
          console.warn(`Failed to fetch purchase history:`, err);
        }

        setReferralCodes(transformedCodes);

        // Calculate stats
        const calculatedStats = calculateDashboardStats(transformedCodes);
        setStats(calculatedStats);

        // Generate time series data using centralized helper
        const timeSeries = buildTimeSeriesFromUsers(allUsers);
        setTimeSeriesData(timeSeries);
      } else {
        setError(response.message || "Failed to fetch referral codes");
        setReferralCodes([]);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      console.error("Error fetching referral data:", err);
      setReferralCodes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    referralCodes,
    stats,
    timeSeriesData,
    loading,
    error,
    refetch: fetchData,
  };
}
