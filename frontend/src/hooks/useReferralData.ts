import { useState, useEffect, useMemo } from "react";
import { apiService } from "../services/api";
import {
  transformReferralCodes,
  calculateDashboardStats,
  createEmptyDashboardStats,
} from "../utils/transformers";
import { buildTimeSeriesFromUsers } from "../utils/timeSeries";
import {
  buildEventUnionMapFromLegacy,
  generateTimeSeriesFromLegacyHistory,
  type EventUnionMap,
} from "../utils/eventAggregation";
import type { ReferralCode, DashboardStats, TimeSeriesData } from "../types";
import type { AffiliatePurchaseHistoryByCode } from "../types/commission";

interface UseReferralDataReturn {
  referralCodes: ReferralCode[];
  stats: DashboardStats;
  timeSeriesData: TimeSeriesData[];
  loadingCodes: boolean;
  loadingHistory: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  /** Union map of all event types (source of truth for rendering) */
  eventUnionMap: EventUnionMap;
  /** Raw purchase history response for advanced usage */
  purchaseHistoryData: AffiliatePurchaseHistoryByCode[];
  /** Raw referral codes response for debugging */
  rawReferralCodesResponse: any[];
  /** Raw purchase history response for debugging */
  rawPurchaseHistoryResponse: any[];
}

export function useReferralData(
  isAuthenticated: boolean = true
): UseReferralDataReturn {
  const [referralCodes, setReferralCodes] = useState<ReferralCode[]>([]);
  const [rawReferralCodesResponse, setRawReferralCodesResponse] = useState<
    any[]
  >([]);
  const [stats, setStats] = useState<DashboardStats>(() =>
    createEmptyDashboardStats("USD")
  );
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [loadingCodes, setLoadingCodes] = useState<boolean>(true);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [purchaseHistoryData, setPurchaseHistoryData] = useState<
    AffiliatePurchaseHistoryByCode[]
  >([]);
  const [rawPurchaseHistoryResponse, setRawPurchaseHistoryResponse] = useState<
    any[]
  >([]);

  // Build event union map from purchase history data
  const eventUnionMap = useMemo<EventUnionMap>(() => {
    if (purchaseHistoryData.length === 0) {
      return new Map();
    }
    return buildEventUnionMapFromLegacy(purchaseHistoryData);
  }, [purchaseHistoryData]);

  const fetchCodes = async () => {
    try {
      setLoadingCodes(true);
      // Fetch referral codes using JWT authentication (no affiliateUserId needed)
      const response = await apiService.getAffiliateReferralCodes();

      if (response.success && response.data) {
        // Store raw response
        setRawReferralCodesResponse(response.data);
        // Transform backend data to frontend format (with earnings calculation)
        const transformedCodes = transformReferralCodes(
          Array.isArray(response.data) ? response.data : []
        );
        setReferralCodes(transformedCodes);

        // Calculate stats
        const calculatedStats = calculateDashboardStats(transformedCodes);
        setStats(calculatedStats);
      } else {
        setError(response.message || "Failed to fetch referral codes");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      console.error("Error fetching referral codes:", err);
    } finally {
      setLoadingCodes(false);
    }
  };

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const allUsers: Array<{
        referralCreatedAt?: string | null;
        events?: any[];
      }> = [];

      const historyResponse = await apiService.getAffiliatePurchaseHistory(
        "system"
      );

      if (historyResponse.success && historyResponse.data) {
        // Store raw response for debugging
        setRawPurchaseHistoryResponse(historyResponse.data);
        // Store processed data for union map building (ensure it's an array)
        setPurchaseHistoryData(
          Array.isArray(historyResponse.data) ? historyResponse.data : []
        );

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

        // Try to generate time series from new enriched format first
        const unionMap = buildEventUnionMapFromLegacy(historyResponse.data);
        if (unionMap.size > 0) {
          const enrichedTimeSeries = generateTimeSeriesFromLegacyHistory(
            historyResponse.data,
            unionMap
          );
          if (enrichedTimeSeries.length > 0) {
            setTimeSeriesData(enrichedTimeSeries);
            return;
          }
        }
      }

      // Fallback: Generate time series data using legacy helper
      const timeSeries = buildTimeSeriesFromUsers(allUsers);
      setTimeSeriesData(timeSeries);
    } catch (err) {
      console.warn(`Failed to fetch purchase history:`, err);
      // Less critical, so we might not block the whole dashboard or set the main error
      // But we can log it or show a toast if we had one here
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchData = async () => {
    setError(null);
    // Fire both requests in parallel
    await Promise.all([fetchCodes(), fetchHistory()]);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  return {
    referralCodes,
    stats,
    timeSeriesData,
    loadingCodes,
    loadingHistory,
    error,
    refetch: fetchData,
    eventUnionMap,
    purchaseHistoryData,
    rawReferralCodesResponse,
    rawPurchaseHistoryResponse,
  };
}
