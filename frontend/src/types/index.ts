export interface User {
  id: string;
  name: string;
  email: string;
  role: 'affiliate' | 'influencer';
  avatar?: string;
}

export interface ReferralCode {
  id: string;
  code: string;
  createdAt: string;
  clicks: number;
  conversions: number;
  revenue: number;
  status: 'active' | 'inactive';
}

export interface ReferralEvent {
  id: string;
  referralCodeId: string;
  type: 'click' | 'conversion' | 'signup';
  timestamp: string;
  userAgent?: string;
  ip?: string;
  revenue?: number;
}

export interface DashboardStats {
  totalReferralCodes: number;
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  conversionRate: number;
  averageRevenuePerConversion: number;
}

export interface TimeSeriesData {
  date: string;
  clicks: number;
  conversions: number;
  revenue: number;
}
