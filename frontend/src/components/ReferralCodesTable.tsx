import type { ReferralCode } from '../types';

interface ReferralCodesTableProps {
  codes: ReferralCode[];
}

export default function ReferralCodesTable({ codes }: ReferralCodesTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getConversionRate = (code: ReferralCode) => {
    if (code.clicks === 0) return '0.00%';
    return ((code.conversions / code.clicks) * 100).toFixed(2) + '%';
  };

  return (
    <div className="referral-codes-section">
      <h2 className="section-title">My Referral Codes</h2>
      <div className="table-container">
        <table className="referral-codes-table">
          <thead>
            <tr>
              <th>Referral Code</th>
              <th>Created</th>
              <th>Clicks</th>
              <th>Conversions</th>
              <th>Conversion Rate</th>
              <th>Revenue</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {codes.map((code) => (
              <tr key={code.id}>
                <td>
                  <div className="code-cell">
                    <code className="referral-code">{code.code}</code>
                    <button
                      className="copy-button"
                      onClick={() => {
                        navigator.clipboard.writeText(code.code);
                      }}
                      title="Copy code"
                    >
                      📋
                    </button>
                  </div>
                </td>
                <td>{formatDate(code.createdAt)}</td>
                <td>{code.clicks.toLocaleString()}</td>
                <td>{code.conversions.toLocaleString()}</td>
                <td>{getConversionRate(code)}</td>
                <td className="revenue-cell">{formatCurrency(code.revenue)}</td>
                <td>
                  <span className={`status-badge ${code.status}`}>
                    {code.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

