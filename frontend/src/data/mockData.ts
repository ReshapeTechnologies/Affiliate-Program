import type { User, ReferralCode, ReferralEvent, DashboardStats, TimeSeriesData } from '../types';

// Hardcoded user data (Phase 1)
export const mockUser: User = {
  id: 'user-1',
  name: 'John Influencer',
  email: 'john@influencer.com',
  role: 'influencer',
  avatar: 'https://ui-avatars.com/api/?name=John+Influencer&background=6366f1&color=fff'
};

// Mock referral codes
export const mockReferralCodes: ReferralCode[] = [
  {
    id: 'ref-1',
    code: 'JOHN2024',
    createdAt: '2024-01-15T10:00:00Z',
    clicks: 1250,
    conversions: 45,
    revenue: 2250.00,
    status: 'active'
  },
  {
    id: 'ref-2',
    code: 'JOHNSUMMER',
    createdAt: '2024-02-01T10:00:00Z',
    clicks: 890,
    conversions: 32,
    revenue: 1600.00,
    status: 'active'
  },
  {
    id: 'ref-3',
    code: 'JOHNSPECIAL',
    createdAt: '2024-02-20T10:00:00Z',
    clicks: 650,
    conversions: 18,
    revenue: 900.00,
    status: 'active'
  },
  {
    id: 'ref-4',
    code: 'JOHNWINTER',
    createdAt: '2024-03-10T10:00:00Z',
    clicks: 420,
    conversions: 12,
    revenue: 600.00,
    status: 'active'
  },
  {
    id: 'ref-5',
    code: 'JOHNOLD',
    createdAt: '2023-12-01T10:00:00Z',
    clicks: 2100,
    conversions: 78,
    revenue: 3900.00,
    status: 'inactive'
  }
];

// Mock events
export const mockEvents: ReferralEvent[] = [
  {
    id: 'event-1',
    referralCodeId: 'ref-1',
    type: 'conversion',
    timestamp: '2024-03-20T14:30:00Z',
    revenue: 50.00
  },
  {
    id: 'event-2',
    referralCodeId: 'ref-2',
    type: 'click',
    timestamp: '2024-03-20T13:15:00Z'
  },
  {
    id: 'event-3',
    referralCodeId: 'ref-1',
    type: 'conversion',
    timestamp: '2024-03-20T12:00:00Z',
    revenue: 50.00
  },
  {
    id: 'event-4',
    referralCodeId: 'ref-3',
    type: 'click',
    timestamp: '2024-03-20T11:45:00Z'
  }
];

// Calculate dashboard stats
export const getDashboardStats = (): DashboardStats => {
  const totalClicks = mockReferralCodes.reduce((sum, code) => sum + code.clicks, 0);
  const totalConversions = mockReferralCodes.reduce((sum, code) => sum + code.conversions, 0);
  const totalRevenue = mockReferralCodes.reduce((sum, code) => sum + code.revenue, 0);
  const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
  const averageRevenuePerConversion = totalConversions > 0 ? totalRevenue / totalConversions : 0;

  return {
    totalReferralCodes: mockReferralCodes.length,
    totalClicks,
    totalConversions,
    totalRevenue,
    conversionRate: Number(conversionRate.toFixed(2)),
    averageRevenuePerConversion: Number(averageRevenuePerConversion.toFixed(2))
  };
};

// Generate time series data for last 30 days
export const getTimeSeriesData = (): TimeSeriesData[] => {
  const data: TimeSeriesData[] = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Simulate some variation in data
    const baseClicks = Math.floor(Math.random() * 50) + 20;
    const baseConversions = Math.floor(baseClicks * 0.03) + Math.floor(Math.random() * 3);
    const baseRevenue = baseConversions * (40 + Math.random() * 20);
    
    data.push({
      date: date.toISOString().split('T')[0],
      clicks: baseClicks,
      conversions: baseConversions,
      revenue: Number(baseRevenue.toFixed(2))
    });
  }
  
  return data;
};

