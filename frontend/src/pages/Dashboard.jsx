import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import DashboardLayout from '../components/dashboard/DashboardLayout'
function Dashboard() {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  const [totalCrops, setTotalCrops] = useState(0)
  const [avgHealth, setAvgHealth] = useState(0)
  const [bestMandi, setBestMandi] = useState(0)
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token')
        const user = JSON.parse(localStorage.getItem('user'))
        const headers = { Authorization: `Bearer ${token}` }
        // Fetch crops
        const cropsRes = await axios.get(`${API_URL}/api/crops/get`, { headers })
        setTotalCrops(cropsRes.data.crops.length)
        // Mock avg health
        setAvgHealth(8.2)
        // Fetch mandi price
        const mandiRes = await axios.get(
          `${API_URL}/api/data/mandi?crop=Wheat&state=Punjab`,
          { headers }
        );
        setBestMandi(mandiRes.data.data?.[0]?.modal_price || 2150)
        // Fetch weather
        const pincode = user?.pincode || '700001'
        const weatherRes = await axios.get(`${API_URL}/api/weather?pincode=${pincode}`, { headers })
        setWeather(weatherRes.data.data)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])
  // Mock data for charts
  const healthChartData = [
    { day: 'Day 1', score: 6 },
    { day: 'Day 5', score: 6.5 },
    { day: 'Day 10', score: 7 },
    { day: 'Day 15', score: 7.5 },
    { day: 'Day 20', score: 7.8 },
    { day: 'Day 25', score: 8 },
    { day: 'Day 30', score: 8.2 },
  ]
  const priceChartData = [
    { day: 'Mon', price: 2280 },
    { day: 'Tue', price: 2320 },
    { day: 'Wed', price: 2380 },
    { day: 'Thu', price: 2400 },
    { day: 'Fri', price: 2480 },
    { day: 'Sat', price: 2550 },
    { day: 'Sun', price: 2610 },
  ]
  const alerts = [
    { id: 1, type: 'weather', title: 'Weather Alert', desc: 'Rain expected in 2 days. Consider delaying irrigation for Plot B.', time: '2 hours ago' },
    { id: 2, type: 'market', title: 'Market Spike', desc: 'Price spike detected for Cotton at nearby mandis.', link: 'View Details' },
    { id: 3, type: 'action', title: 'Action Required', desc: 'Start pest management for Rice (Plot A) based on ML prediction model.' },
  ]
  // SVG icon components for stat cards
  const CropIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}>
      <path d="M7 20h10" />
      <path d="M10 20c5.5-2.5 .8-6.4 3-10" />
      <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
      <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
    </svg>
  )
  const HealthIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4l2 2" />
    </svg>
  )
  const RupeeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}>
      <path d="M6 3h12" />
      <path d="M6 8h12" />
      <path d="M6 13l8.5 8" />
      <path d="M6 13h3c6.667 0 6.667-10 0-10" />
    </svg>
  )
  const WeatherIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  )
  // SVG icon components for alerts
  const AlertWeatherIcon = () => (
    <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
      </svg>
    </div>
  )
  const AlertMarketIcon = () => (
    <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
        <path d="M6 3h12" />
        <path d="M6 8h12" />
        <path d="M6 13l8.5 8" />
        <path d="M6 13h3c6.667 0 6.667-10 0-10" />
      </svg>
    </div>
  )
  const AlertActionIcon = () => (
    <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
        <path d="M12 16h.01" />
        <path d="M12 8v4" />
        <circle cx="12" cy="12" r="10" />
      </svg>
    </div>
  )
  const BellIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  )
  const ThreeDotsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#9ca3af" style={{ width: 20, height: 20, cursor: 'pointer' }}>
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </svg>
  )
  const getAlertIcon = (type) => {
    switch (type) {
      case 'weather': return <AlertWeatherIcon />
      case 'market': return <AlertMarketIcon />
      case 'action': return <AlertActionIcon />
      default: return null
    }
  }
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-lg font-semibold text-gray-600">Loading Dashboard...</p>
        </div>
      </DashboardLayout>
    )
  }
  return (
    <DashboardLayout>
      <div style={{ padding: '0', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        {/* SECTION 1: Stats Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Card 1: Total Crops */}
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: '13px', fontWeight: 500, color: '#6b7280', margin: 0 }}>Total Crops</p>
              <CropIcon />
            </div>
            <div style={{ marginTop: '12px' }}>
              <p style={{ fontSize: '28px', fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1 }}>{totalCrops}</p>
              <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>Active Fields</p>
            </div>
          </div>
          {/* Card 2: Avg Health */}
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: '13px', fontWeight: 500, color: '#6b7280', margin: 0 }}>Avg Health</p>
              <HealthIcon />
            </div>
            <div style={{ marginTop: '12px' }}>
              <p style={{ fontSize: '28px', fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1 }}>
                {avgHealth} <span style={{ fontSize: '14px', fontWeight: 400, color: '#9ca3af' }}>/ 10</span>
              </p>
              <div style={{ marginTop: '10px', backgroundColor: '#e5e7eb', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
                <div
                  style={{ backgroundColor: '#16a34a', height: '100%', borderRadius: '999px', transition: 'width 0.5s', width: `${(avgHealth / 10) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          {/* Card 3: Best Mandi Price */}
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: '13px', fontWeight: 500, color: '#6b7280', margin: 0 }}>Best Mandi (Wheat)</p>
              <RupeeIcon />
            </div>
            <div style={{ marginTop: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <p style={{ fontSize: '28px', fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1 }}>
                  <span style={{ fontSize: '18px' }}>Rs.</span>{bestMandi}
                </p>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>/ qtl</span>
              </div>
            </div>
          </div>
          {/* Card 4: Weather */}
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: '13px', fontWeight: 500, color: '#6b7280', margin: 0 }}>Weather (Local)</p>
              <WeatherIcon />
            </div>
            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <p style={{ fontSize: '28px', fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1 }}>{weather?.main?.temp || 28}°C</p>
              <span style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'capitalize' }}>{weather?.weather?.[0]?.description || 'Partly Cloudy'}</span>
            </div>
          </div>
        </div>
        {/* SECTION 2: Charts + Alerts (two-column layout, alerts span full height) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Left Column: Charts stacked vertically */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Health Chart */}
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0 }}>Crop Health Score (30 Days)</h2>
                <ThreeDotsIcon />
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={healthChartData}>
                  <defs>
                    <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} hide />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    cursor={{ stroke: '#d1d5db' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#16a34a"
                    strokeWidth={2.5}
                    fill="url(#healthGradient)"
                    dot={false}
                    activeDot={{ fill: '#16a34a', r: 5, strokeWidth: 2, stroke: '#fff' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {/* Price Chart */}
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0 }}>Wheat Price Trend (Indore Mandi)</h2>
                <span style={{ backgroundColor: '#2563eb', color: '#fff', fontSize: '11px', fontWeight: 600, padding: '4px 12px', borderRadius: '6px' }}>Live Data</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={priceChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} hide />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    cursor={{ fill: 'rgba(59,130,246,0.06)' }}
                  />
                  <Bar dataKey="price" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Right Column: Alerts sidebar spanning full height */}
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <BellIcon />
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0 }}>Recent Alerts</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  style={{
                    padding: '16px',
                    borderRadius: '10px',
                    backgroundColor: alert.type === 'action' ? '#fef2f2' : '#f8fafc',
                    border: `1px solid ${alert.type === 'action' ? '#fecaca' : '#e2e8f0'}`,
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {getAlertIcon(alert.type)}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: alert.type === 'action' ? '#dc2626' : '#111827',
                        margin: 0,
                      }}>{alert.title}</p>
                      <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', lineHeight: 1.5 }}>{alert.desc}</p>
                      {alert.time && (
                        <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '6px' }}>{alert.time}</p>
                      )}
                      {alert.link && (
                        <button style={{ fontSize: '12px', color: '#2563eb', marginTop: '6px', background: 'none', border: 'none', padding: 0, fontWeight: 500, cursor: 'pointer' }}>
                          {alert.link}
                        </button>
                      )}
                    </div>
                  </div>
                  {alert.type === 'action' && (
                    <button style={{
                      marginTop: '12px',
                      width: 'auto',
                      backgroundColor: '#dc2626',
                      color: '#fff',
                      fontSize: '12px',
                      fontWeight: 600,
                      padding: '6px 20px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      marginLeft: '52px',
                    }}>
                      Take Action
                    </button>
                  )}
                </div>
              ))}
            </div>
            {/* View All Alerts */}
            <button style={{
              marginTop: '20px',
              width: '100%',
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              backgroundColor: '#fff',
              color: '#374151',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#fff'}
            >
              View All Alerts
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
export default Dashboard