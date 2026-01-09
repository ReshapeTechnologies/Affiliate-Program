import "./App.css";
import Dashboard from "./components/Dashboard";
import LoginPage from "./components/LoginPage";
import LoadingSpinner from "./components/LoadingSpinner";
import { useReferralData } from "./hooks/useReferralData";
import { useAuth, AuthProvider } from "./context/AuthContext";
import type { User } from "./types";

function AppContent() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const { referralCodes, stats, timeSeriesData, loading, error, refetch } =
    useReferralData(isAuthenticated);

  // Show loading spinner while checking auth status
  if (authLoading) {
    return <LoadingSpinner />;
  }

  // Show login page if not authenticated
  if (!isAuthenticated || !user) {
    return <LoginPage />;
  }

  // Transform auth user to User type for Dashboard
  const dashboardUser: User = {
    id: user.email,
    name: user.name,
    email: user.email,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user.name
    )}&background=6366f1&color=fff`,
  };

  return (
    <Dashboard
      user={dashboardUser}
      referralCodes={referralCodes}
      stats={stats}
      timeSeriesData={timeSeriesData}
      loading={loading}
      error={error}
      onRetry={refetch}
      onLogout={logout}
    />
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
