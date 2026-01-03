import type { User } from '../types';

interface HeaderProps {
  user: User;
}

export default function Header({ user }: HeaderProps) {
  return (
    <header className="dashboard-header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="dashboard-title">Affiliate Dashboard</h1>
        </div>
        <div className="header-right">
          <div className="user-info">
            {user.avatar && (
              <img src={user.avatar} alt={user.name} className="user-avatar" />
            )}
            <div className="user-details">
              <span className="user-name">{user.name}</span>
              <span className="user-email">{user.email}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

