import React, { useState, useEffect } from 'react'
import DashboardLayout from '../components/dashboard/DashboardLayout.jsx'
import axios from 'axios'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
// ── Constants ──────────────────────────────────────────────
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal"
];

// Professional SVG Icons for crops
const getCropIcon = (cropName) => {
  switch (cropName?.toLowerCase()) {
    case 'wheat':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M8 5v14M16 5v14M12 7l4-2M12 11l4-2M12 15l4-2M8 9l4-2M8 13l4-2M8 17l4-2" />
        </svg>
      )
    case 'rice':
    case 'basmati rice':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20M17 5c-2.5 0-5 2.5-5 5s2.5 5 5 5 5-2.5 5-5-2.5-5-5-5zm-10 6c-2.5 0-5 2.5-5 5s2.5 5 5 5 5-2.5 5-5-2.5-5-5-5z" />
        </svg>
      )
    case 'cotton':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0 M12 6a3 3 0 1 0 0 6M12 12a3 3 0 1 0 0 6M6 12a3 3 0 1 0 6 0M12 12a3 3 0 1 0 6 0" />
        </svg>
      )
    case 'mustard':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )
    case 'soyabean':
    case 'soybean':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-3 0-5 2-5 4s2 4 5 4 5-2 5-4-2-4-5-4z M12 2v6M12 16v6" />
        </svg>
      )
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 22V8m0 0c1.5-2 4-4 6-4-1 2-3 4.5-6 4zm0 0c-1.5-2-4-4-6-4 1 2 3 4.5 6 4z" />
        </svg>
      )
  }
}
// Mock price history data (replace with real API if available)
const generateHistory = (base) => [
  { month: 'Jan', price: base - 300 },
  { month: 'Feb', price: base - 200 },
  { month: 'Mar', price: base - 50 },
  { month: 'Apr (Current)', price: base },
]
function MandiPrices() {
  const [selectedState, setSelectedState] = useState('Madhya Pradesh')
  const [selectedCrop, setSelectedCrop] = useState('All Crops')
  const [mandiData, setMandiData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [chartCrop, setChartCrop] = useState('Wheat') // which crop to show in price history
  const [chartRange, setChartRange] = useState('3M')
  const [CROPS, setCROPS] = useState([])
  const fetchRates = async (cropsList = CROPS) => {
    if (!cropsList || cropsList.length === 0) return
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }
      const requests = cropsList.map((crop) =>
        axios.get(`${API_URL}/api/data/mandi`, {
          headers,
          params: { crop, state: selectedState }
        })
      )
      const responses = await Promise.all(requests)
      const combined = responses.map((res, i) => {
        const entry = res.data.data?.[0]           // first result per crop
        return {
          crop: cropsList[i],
          market: entry?.market || '—',
          price: entry?.modal_price || null,
          minPrice: entry?.min_price || null,
          maxPrice: entry?.max_price || null,
          date: entry?.arrival_date || 'Today',
        }
      })
      setMandiData(combined)
      setLastUpdated(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }))

      // Update chart crop if current chart crop is not in list
      if (cropsList.length > 0 && !cropsList.includes(chartCrop)) {
        setChartCrop(cropsList[0])
      }
    } catch (err) {
      console.error('Mandi fetch error:', err)
      setError('Failed to fetch mandi prices. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  const fetchUserCrops = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }
      const response = await axios.get(`${API_URL}/api/crops/get`, { headers })
      const cropNames = response.data.crops.map(c => c.crop_name || c.cropName)
      const uniqueNames = Array.from(new Set(cropNames)).filter(Boolean)
      const finalCrops = uniqueNames.length > 0 ? uniqueNames : ['Wheat', 'Rice', 'Cotton', 'Mustard', 'Soyabean']
      setCROPS(finalCrops)
      fetchRates(finalCrops)
    } catch (err) {
      console.error(err)
      const defaultCrops = ['Wheat', 'Rice', 'Cotton', 'Mustard', 'Soyabean']
      setCROPS(defaultCrops)
      fetchRates(defaultCrops)
    }
  }
  useEffect(() => {
    fetchUserCrops()
  }, [])
  // re-fetch when state changes
  useEffect(() => {
    if (CROPS.length > 0) {
      fetchRates(CROPS)
    }
  }, [selectedState])
  // Filter table by selected crop dropdown
  const filteredData = selectedCrop === 'All Crops'
    ? mandiData
    : mandiData.filter((d) => d.crop === selectedCrop)
  // Trend helper — compares modal vs min price as a simple delta
  const getTrend = (item) => {
    if (!item.price || !item.minPrice) return { label: '→ 0.0%', color: 'text-gray-500' }
    const delta = (((item.price - item.minPrice) / item.minPrice) * 100).toFixed(1)
    if (delta > 0) return { label: `↑ +${delta}%`, color: 'text-green-600' }
    if (delta < 0) return { label: `↓ ${delta}%`, color: 'text-red-500' }
    return { label: '→ 0.0%', color: 'text-gray-500' }
  }
  const chartCropData = mandiData.find((d) => d.crop === chartCrop)
  const historyData = chartCropData?.price
    ? generateHistory(chartCropData.price)
    : generateHistory(2200)
  return (
    <DashboardLayout>
      <div className="p-8 bg-gray-50 min-h-screen">
        {/* ── Page Header + Filters ── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mandi Prices</h1>
            <p className="text-sm text-gray-500 mt-1">Real-time market rates for informed selling.</p>
          </div>
          {/* Filters Row */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* State Selector */}
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1 pl-1">Select State</label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm"
              >
                {STATES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            {/* Crop Filter */}
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1 pl-1">Select Crop</label>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm"
              >
                <option>All Crops</option>
                {CROPS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <button
              onClick={() => fetchRates(CROPS)}
              className="mt-5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition shadow-sm flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
        {/* ── Live Mandi Rates Table ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          {/* Table Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="bg-green-100 text-green-700 p-1.5 rounded flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </span>
              <h2 className="text-base font-bold text-gray-900">Live Mandi Rates</h2>
            </div>
            {lastUpdated && (
              <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
                Updated: {lastUpdated}
              </span>
            )}
          </div>
          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-gray-500">Fetching live rates...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-48">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <th className="px-6 py-3">Crop</th>
                    <th className="px-6 py-3">Market</th>
                    <th className="px-6 py-3">Price (₹/Qtl)</th>
                    <th className="px-6 py-3">Trend</th>
                    <th className="px-6 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-gray-400 text-sm">
                        No data available for selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item) => {
                      const trend = getTrend(item)
                      return (
                        <tr
                          key={item.crop}
                          onClick={() => setChartCrop(item.crop)}
                          className="hover:bg-green-50 cursor-pointer transition"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                {getCropIcon(item.crop)}
                              </span>
                              <span className="font-semibold text-gray-800">{item.crop}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{item.market}</td>
                          <td className="px-6 py-4">
                            <span className="text-lg font-bold text-gray-900">
                              {item.price ? `₹ ${Number(item.price).toLocaleString('en-IN')}` : '—'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-sm font-semibold ${trend.color}`}>
                              {trend.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{item.date}</td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {/* ── Price History Chart ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </span>
              <h2 className="text-base font-bold text-gray-900">Price History (Last 3 Months)</h2>
            </div>
            {/* Range buttons */}
            <div className="flex gap-1">
              {['3M', '6M', '1Y'].map((r) => (
                <button
                  key={r}
                  onClick={() => setChartRange(r)}
                  className={`text-xs font-semibold px-3 py-1 rounded transition ${chartRange === r
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-400 mb-6">
            Showing trend for{' '}
            <span className="font-semibold text-gray-700">{chartCrop}</span>{' '}
            in {selectedState} — click any row above to switch crop
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={historyData}>
              <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 12 }} />
              <YAxis
                stroke="#9ca3af"
                tick={{ fontSize: 12 }}
                tickFormatter={(v) => `₹${v}`}
                domain={['auto', 'auto']}
              />
              <Tooltip
                formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Price']}
                contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#3b82f6"
                strokeWidth={2.5}
                fill="url(#priceGrad)"
                dot={{ fill: '#3b82f6', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  )
}
export default MandiPrices