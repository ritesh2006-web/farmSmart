import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import DashboardLayout from '../components/dashboard/DashboardLayout.jsx'

function MyCrops() {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  const navigate = useNavigate()                        // FIX 1: useNavigate is a hook, not a function call
  const [form, setForm] = useState({
    cropName: '',
    soilType: '',
    area: '',
    sowingDate: new Date().toISOString().split('T')[0], // FIX 2: proper date string not Date.now()
  })
  const [crops, setCrops] = useState([])
  const [loading, setLoading] = useState(false)
  const [showPopup, setShowPopup] = useState(false)     // FIX 3: showPopUp was never defined

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // FIX 4: was "handlSubmit" (typo), and axios/navigate were missing
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }
      await axios.post(`${API_URL}/api/crops/add`, form, { headers })
      setShowPopup(false)
      setForm({ cropName: '', soilType: '', area: '', sowingDate: new Date().toISOString().split('T')[0] })
      fetchUserCrops()                                  // refresh list after adding
    } catch (error) {
      console.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  // delete crop
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }
      await axios.delete(`${API_URL}/api/crops/${id}`, { headers })

      setCrops((prev) => prev.filter((crop) => crop.id !== id))
    }
    catch (err) {
      console.error('Delete failed:', err.message)
    }
  }

  // FIX 5: extracted so it can be called after submit too
  const fetchUserCrops = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }
      const response = await axios.get(`${API_URL}/api/crops/get`, { headers }) // FIX 6: correct endpoint
      setCrops(response.data.crops)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchUserCrops()  // FIX 7: function was defined but never called
  }, [])              // FIX 8: was [form] — caused re-fetch on every keystroke

  const soilTypes = ['Alluvial', 'Black', 'Red', 'Laterite', 'Desert', 'Mountain']

  // Helper for professional mock card metadata
  const getMockMetadata = (crop) => {
    const idNum = crop.id || 0
    const nameHash = (crop.crop_name || '').charCodeAt(0) || 0

    // Dynamic health statuses
    const healthOptions = ['Healthy', 'Optimal', 'Stable', 'Needs Attention']
    const healthColors = {
      'Healthy': 'text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-[10px] font-semibold border border-green-200/50',
      'Optimal': 'text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-semibold border border-emerald-200/50',
      'Stable': 'text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full text-[10px] font-semibold border border-blue-200/50',
      'Needs Attention': 'text-red-650 bg-red-50 px-2 py-0.5 rounded-full text-[10px] font-semibold border border-red-200/50'
    }
    const health = healthOptions[nameHash % healthOptions.length]
    const healthStyle = healthColors[health]

    // Score badge values
    const score = (nameHash % 5) + 5
    const scoreStyles = [
      'bg-green-100 text-green-800',
      'bg-blue-100 text-blue-800',
      'bg-amber-100 text-amber-800',
      'bg-sky-100 text-sky-800'
    ]
    const scoreStyle = scoreStyles[idNum % scoreStyles.length]

    // Progress percentage & phase
    const stages = ['Germination', 'Vegetative', 'Flowering', 'Tillering', 'Boll Opening']
    const stage = stages[nameHash % stages.length]
    const percent = ((idNum * 17) % 65) + 30

    // Left border indicator
    const borderColors = [
      'border-l-green-600',
      'border-l-emerald-600',
      'border-l-blue-500',
      'border-l-amber-500'
    ]
    const borderStyle = borderColors[nameHash % borderColors.length]

    return { health, healthStyle, score, scoreStyle, stage, percent, borderStyle }
  }

  return (
    <DashboardLayout>
      <div className="p-8 bg-gray-50 min-h-screen">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Crops</h1>
            <p className="text-sm text-gray-500 mt-1">Manage and monitor your current agricultural assets.</p>
          </div>
          <button
            onClick={() => setShowPopup(true)}
            className="flex items-center gap-2 bg-green-800 hover:bg-green-900 text-white font-semibold px-5 py-2.5 rounded-lg transition shadow-sm text-xs"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add New Crop
          </button>
        </div>

        {/* Crops Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="ml-3 text-gray-500 font-medium text-sm">Loading your crops...</p>
          </div>
        ) : crops.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-dashed border-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-green-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 22V8m0 0c1.5-2 4-4 6-4-1 2-3 4.5-6 4zm0 0c-1.5-2-4-4-6-4 1 2 3 4.5 6 4zm-4 6c1-1.5 3-3 4-3s3 1.5 4 3M8 12c1-1.5 3-3 4-3s3 1.5 4 3" />
            </svg>
            <p className="text-gray-500 font-medium">No crops added yet.</p>
            <p className="text-sm text-gray-400 mt-1">Click "Add New Crop" to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {crops.map((crop) => {
              const meta = getMockMetadata(crop)
              return (
                <div
                  key={crop.id}
                  className={`bg-white rounded-xl shadow-sm border border-gray-200 border-l-4 ${meta.borderStyle} overflow-hidden hover:shadow-md transition flex flex-col justify-between`}
                >
                  <div className="p-5">
                    {/* Top Row: Crop Name & Index Score Badge */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 leading-snug">{crop.crop_name}</h3>
                        <p className="text-xs text-gray-400 mt-0.5 font-medium">{crop.soil_type} Field • {crop.area_acres} Acres</p>
                      </div>
                    </div>

                    {/* Sown Date & Health Status */}
                    <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>
                          {new Date(crop.sowing_date).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="px-5 pb-5 pt-1 flex gap-2">
                    <button
                      onClick={() => handleDelete(crop.id)}
                      className="flex-1 text-xs bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2 rounded-lg transition border border-red-200/40"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── POPUP MODAL ── */}
        {showPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
              {/* Modal Header */}
              <div className="bg-green-800 px-6 py-4 flex items-center justify-between">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 22V8m0 0c1.5-2 4-4 6-4-1 2-3 4.5-6 4zm0 0c-1.5-2-4-4-6-4 1 2 3 4.5 6 4z" />
                  </svg>
                  Add New Crop
                </h2>
                <button
                  onClick={() => setShowPopup(false)}
                  className="text-white hover:text-green-200 text-2xl font-bold leading-none"
                >
                  &times;
                </button>
              </div>
              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Crop Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Crop Name</label>
                  <input
                    type="text"
                    name="cropName"
                    placeholder="e.g. Wheat, Rice, Maize"
                    value={form.cropName}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
                {/* Soil Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Soil Type</label>
                  <select
                    name="soilType"
                    value={form.soilType}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                  >
                    <option value="">Select soil type</option>
                    {soilTypes.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                {/* Area */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Area (in acres)</label>
                  <input
                    type="number"
                    name="area"
                    placeholder="e.g. 2.5"
                    value={form.area}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.1"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
                {/* Sowing Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Sowing Date</label>
                  <input
                    type="date"
                    name="sowingDate"
                    value={form.sowingDate}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-800 hover:bg-green-900 disabled:bg-green-300 text-white font-bold py-3 rounded-lg transition mt-2 text-xs"
                >
                  {loading ? 'Saving...' : 'Add Crop'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
export default MyCrops