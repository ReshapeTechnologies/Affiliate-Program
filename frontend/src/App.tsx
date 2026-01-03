import './App.css'
import Dashboard from './components/Dashboard'
import { mockUser, mockReferralCodes, getDashboardStats, getTimeSeriesData } from './data/mockData'

function App() {
  const stats = getDashboardStats()
  const timeSeriesData = getTimeSeriesData()

  return (
    <Dashboard
      user={mockUser}
      referralCodes={mockReferralCodes}
      stats={stats}
      timeSeriesData={timeSeriesData}
    />
  )
}

export default App
