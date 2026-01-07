import { API_CONFIG, getAuthToken } from "../config/api";

type BackendApiResponse<T> = {
  message: string;
  success: boolean;
  data: T;
};

/**
 * API Service for fetching referral data from backend
 */

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = getAuthToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  /**
   * Get referral details with purchase history
   * This fetches data from SQL PurchaseHistory table via get-referral-details endpoint
   */
  async getReferralDetails(
    referralCode: string
  ): Promise<BackendApiResponse<any[]>> {
    return this.request<BackendApiResponse<any[]>>(
      `/get-referral-details?referralCode=${encodeURIComponent(referralCode)}`,
      {
        method: "GET",
      }
    );
  }

  /**
   * Get purchase history for a specific user
   * Fetches directly from SQL PurchaseHistory table
   */
  async getPurchaseHistoryByUserId(
    userId: string
  ): Promise<BackendApiResponse<{ userId: string; events: any[] }>> {
    return this.request<BackendApiResponse<{ userId: string; events: any[] }>>(
      `/get-purchasehistory?userId=${encodeURIComponent(userId)}`,
      {
        method: "GET",
      }
    );
  }

  /**
   * Get affiliate referral codes with stats
   */
  async getAffiliateReferralCodes(
    affiliateUserId: string
  ): Promise<BackendApiResponse<any[]>> {
    return this.request<BackendApiResponse<any[]>>(
      `/get-affiliate-referral-codes?affiliateUserId=${encodeURIComponent(
        affiliateUserId
      )}`,
      {
        method: "GET",
      }
    );
  }

  /**
   * Get affiliate purchase history (full details)
   */
  async getAffiliatePurchaseHistory(
    affiliateUserId: string,
    referralCode?: string,
    userId?: string
  ): Promise<BackendApiResponse<any[]>> {
    const params = new URLSearchParams({ affiliateUserId });
    if (referralCode) params.append("referralCode", referralCode);
    if (userId) params.append("userId", userId);

    return this.request<BackendApiResponse<any[]>>(
      `/get-affiliate-purchase-history?${params.toString()}`,
      {
        method: "GET",
      }
    );
  }
}

export const apiService = new ApiService();
