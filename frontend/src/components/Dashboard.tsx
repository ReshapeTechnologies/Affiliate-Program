import type { User, ReferralCode, DashboardStats, TimeSeriesData } from '../types';
import Header from './Header';
import StatsCard from './StatsCard';
import ReferralCodesTable from './ReferralCodesTable';
import PerformanceCharts from './PerformanceCharts';

interface DashboardProps {
  user: User;
  referralCodes: ReferralCode[];
  stats: DashboardStats;
  timeSeriesData: TimeSeriesData[];
}

export default function Dashboard({ user, referralCodes, stats, timeSeriesData }: DashboardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="dashboard">
      <Header user={user} />
      <main className="dashboard-main">
        <div className="dashboard-content">
          {/* Stats Cards */}
          <div className="stats-grid">
            <StatsCard
              title="Total Referral Codes"
              value={stats.totalReferralCodes}
              subtitle="Active codes"
              icon="🔗"
            />
            <StatsCard
              title="Total Clicks"
              value={stats.totalClicks.toLocaleString()}
              subtitle="All time"
              icon="👆"
            />
            <StatsCard
              title="Total Conversions"
              value={stats.totalConversions.toLocaleString()}
              subtitle={`${stats.conversionRate}% conversion rate`}
              icon="✅"
            />
            <StatsCard
              title="Total Revenue"
              value={formatCurrency(stats.totalRevenue)}
              subtitle={`Avg: ${formatCurrency(stats.averageRevenuePerConversion)} per conversion`}
              icon="💰"
            />
          </div>

          {/* Charts */}
          <PerformanceCharts timeSeriesData={timeSeriesData} />

          {/* Referral Codes Table */}
          <ReferralCodesTable codes={referralCodes} />
        </div>
      </main>
    </div>
  );
}

