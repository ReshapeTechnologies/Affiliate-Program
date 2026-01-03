interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function StatsCard({ title, value, subtitle, icon, trend }: StatsCardProps) {
  return (
    <div className="stats-card">
      <div className="stats-card-header">
        <h3 className="stats-card-title">{title}</h3>
        {icon && <span className="stats-card-icon">{icon}</span>}
      </div>
      <div className="stats-card-value">{value}</div>
      {subtitle && <div className="stats-card-subtitle">{subtitle}</div>}
      {trend && (
        <div className={`stats-card-trend ${trend.isPositive ? 'positive' : 'negative'}`}>
          {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
        </div>
      )}
    </div>
  );
}

