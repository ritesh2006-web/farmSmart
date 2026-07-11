import { useState, useEffect } from 'react'
import axios from 'axios'
import DashboardLayout from '../components/dashboard/DashboardLayout.jsx'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

// ── Calendar helpers ────────────────────────────────────────
const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()

const toDateKey = (date) => date.toISOString().split('T')[0] // "YYYY-MM-DD"

const getCalendarDays = (month) => {
    const year = month.getFullYear()
    const mon = month.getMonth()
    const first = new Date(year, mon, 1).getDay()   // 0=Sun
    const total = new Date(year, mon + 1, 0).getDate()
    const days = []
    for (let i = 0; i < first; i++) days.push(null) // empty padding cells
    for (let d = 1; d <= total; d++) days.push(new Date(year, mon, d))
    return days
}

// ── Component ───────────────────────────────────────────────
function CropHealthLog() {
    // FIX 1: all hooks must be INSIDE the component function
    const [crops, setCrops] = useState([])
    const [selectedCrop, setSelectedCrop] = useState(null)
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [form, setForm] = useState({ healthScore: 7, notes: '' })
    const [photo, setPhoto] = useState(null)        // FIX 2: photo separate from JSON form
    const [photoPreview, setPhotoPreview] = useState(null)
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState(null)
    const [isDraft, setIsDraft] = useState(false)

    const authHeaders = () => {
        const token = localStorage.getItem('token')
        return { Authorization: `Bearer ${token}` }     // FIX 3: auth headers on every request
    }

    // ── Fetch crops on mount ──────────────────────────────────
    // FIX 4: async function defined AND called correctly inside useEffect
    // FIX 5: try/catch wraps the CALL not the function definition
    useEffect(() => {
        const fetchCrops = async () => {
            try {
                setLoading(true)
                const res = await axios.get(`${API_URL}/api/crops/get`, { headers: authHeaders() })
                const cropList = res.data.crops || []
                console.log('Fetched crops:', cropList)  // FIX 6: log the fetched crops for debugging
                setCrops(cropList)
                if (cropList.length > 0) setSelectedCrop(cropList[0])
            } catch (err) {
                console.error('Error fetching crops:', err)
                setError('Could not load crops.')
            } finally {
                setLoading(false)
            }
        }
        fetchCrops() // called in scope
    }, [])

    // ── Fetch logs when crop changes ──────────────────────────
    // FIX 7: dependency is [selectedCrop] not [] so dots refresh on crop switch
    useEffect(() => {
        if (!selectedCrop) return
        const fetchLogs = async () => {
            try {
                const selectedCropId = selectedCrop.id
                const res = await axios.get(`${API_URL}/api/crops/${selectedCropId}/logs`, {  // FIX 8: correct endpoint
                    headers: authHeaders(),
                    params: { cropId: selectedCrop.id }
                })
                setLogs(res.data.logs || [])
            } catch (err) {
                console.error('Error fetching logs:', err)
            }
        }
        fetchLogs()
    }, [selectedCrop])

    // ── Pre-fill form if a log exists for selectedDate ────────
    useEffect(() => {
        const key = toDateKey(selectedDate)
        const existing = logs.find((l) => l.date?.startsWith(key))
        if (existing) {
            setForm({ healthScore: existing.health_score, notes: existing.notes || '' })
            setPhotoPreview(existing.photo_url || null)
            setIsDraft(false)
        } else {
            setForm({ healthScore: 7, notes: '' })
            setPhoto(null)
            setPhotoPreview(null)
            setIsDraft(false)
        }
    }, [selectedDate, logs])

    // ── Submit handler ────────────────────────────────────────
    // FIX 9: was posting to /api/logs — corrected to /api/logs/add
    // FIX 10: sends cropId + date, uses FormData when photo present
    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!selectedCrop) return
        try {
            setSubmitting(true)
            const headers = authHeaders()
            const payload = {
                cropId: selectedCrop.id,
                date: toDateKey(selectedDate),
                healthScore: form.healthScore,
                notes: form.notes,
            }

            if (photo) {
                const fd = new FormData()
                Object.entries(payload).forEach(([k, v]) => fd.append(k, v))
                fd.append('photo', photo)
                await axios.post(`${API_URL}/api/crops/${selectedCrop.id}/logs`, fd, {
                    headers: { ...headers, 'Content-Type': 'multipart/form-data' }
                })
            } else {
                await axios.post(`${API_URL}/api/crops/${selectedCrop.id}/logs`, payload, { headers })
            }

            // Refresh logs so calendar dots update
            const res = await axios.get(`${API_URL}/api/crops/${selectedCrop.id}/logs`, {
                headers,
                params: { cropId: selectedCrop.id }
            })
            setLogs(res.data.logs || [])
            setIsDraft(false)
        } catch (err) {
            console.error('Error submitting log:', err)
            setError('Failed to submit log. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    const handlePhotoChange = (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (file.size > 5 * 1024 * 1024) { alert('Max file size is 5MB'); return }
        setPhoto(file)
        setPhotoPreview(URL.createObjectURL(file))
    }

    // ── Calendar ──────────────────────────────────────────────
    const calDays = getCalendarDays(currentMonth)
    const loggedKeys = new Set(logs.map((l) => l.date?.split('T')[0]))
    const today = new Date()

    const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
    const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))

    const existingLog = logs.find((l) => l.date?.startsWith(toDateKey(selectedDate)))

    // ── Render ────────────────────────────────────────────────
    return (
        <DashboardLayout>
            <div className="p-8 bg-gray-50 min-h-screen">

                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Crop Health Log</h1>
                    <p className="text-sm text-gray-500 mt-1">Track daily health metrics and detect potential diseases early.</p>
                </div>

                {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                        {/* ── LEFT PANEL ───────────────────────────── */}
                        <div className="col-span-1 lg:col-span-2 space-y-6">

                            {/* Crop Selector */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                                <p className="text-sm font-semibold text-gray-700 mb-3">Select Crop</p>
                                <select
                                    value={selectedCrop?.id || ''}
                                    onChange={(e) => {
                                        const c = crops.find((c) => c.id === e.target.value)
                                        setSelectedCrop(c || null)
                                    }}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
                                >
                                    {crops.length === 0
                                        ? <option>No crops found</option>
                                        : crops.map((c) => <option key={c.id} value={c.id}>{c.crop_name}</option>)
                                    }
                                </select>
                            </div>

                            {/* Mini Calendar */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-sm font-bold text-gray-700">Log Date</p>
                                    <div className="flex items-center gap-2">
                                        <button onClick={prevMonth} className="text-gray-400 hover:text-gray-600 text-lg px-1">‹</button>
                                        <span className="text-sm font-semibold text-green-700 min-w-24 text-center">
                                            {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                                        </span>
                                        <button onClick={nextMonth} className="text-gray-400 hover:text-gray-600 text-lg px-1">›</button>
                                    </div>
                                </div>

                                {/* Day headers */}
                                <div className="grid grid-cols-7 mb-1">
                                    {DAYS.map((d) => (
                                        <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
                                    ))}
                                </div>

                                {/* Date cells */}
                                <div className="grid grid-cols-7 gap-y-1">
                                    {calDays.map((date, i) => {
                                        if (!date) return <div key={`empty-${i}`} />
                                        const key = toDateKey(date)
                                        const isLogged = loggedKeys.has(key)
                                        const isSelected = isSameDay(date, selectedDate)
                                        const isToday = isSameDay(date, today)
                                        const isPast = date < today && !isToday

                                        return (
                                            <button
                                                key={key}
                                                onClick={() => setSelectedDate(date)}
                                                className={`relative flex flex-col items-center justify-center h-9 w-9 mx-auto rounded-full text-sm transition
                          ${isSelected ? 'bg-green-600 text-white font-bold' : ''}
                          ${isToday && !isSelected ? 'border-2 border-green-400 font-semibold text-green-700' : ''}
                          ${!isSelected && !isToday ? 'text-gray-700 hover:bg-gray-100' : ''}
                        `}
                                            >
                                                {date.getDate()}
                                                {/* Dot indicator */}
                                                {!isSelected && (
                                                    <span className={`absolute bottom-0.5 w-1.5 h-1.5 rounded-full
                            ${isLogged ? 'bg-orange-400' : isPast ? 'bg-gray-300' : 'hidden'}
                          `} />
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>

                                {/* Legend */}
                                <div className="flex gap-4 mt-4 pt-3 border-t border-gray-100">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                        <span className="w-2 h-2 rounded-full bg-orange-400 inline-block"></span> Logged
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                        <span className="w-2 h-2 rounded-full bg-gray-300 inline-block"></span> Missing
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── RIGHT PANEL ──────────────────────────── */}
                        <div className="col-span-1 lg:col-span-3">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">

                                {/* Entry Header */}
                                <div className="flex items-center justify-between mb-1">
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Health Entry for {selectedDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                    </h2>
                                    {isDraft && (
                                        <span className="flex items-center gap-1 bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                                            ⟳ Draft
                                        </span>
                                    )}
                                    {existingLog && !isDraft && (
                                        <span className="flex items-center gap-1 bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full">
                                            ✓ Logged
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-400 mb-6">{selectedCrop?.crop_name || '—'}</p>

                                <form onSubmit={handleSubmit} className="space-y-6">

                                    {/* Health Score Slider */}
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-sm font-semibold text-gray-700">Overall Health Score</p>
                                            <input
                                                type="number"
                                                min="1" max="10"
                                                value={form.healthScore}
                                                onChange={(e) => {
                                                    setForm({ ...form, healthScore: Number(e.target.value) })
                                                    setIsDraft(true)
                                                }}
                                                className="w-12 text-center border border-gray-300 rounded-lg py-1 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-green-400"
                                            />
                                        </div>
                                        <input
                                            type="range" min="1" max="10" step="1"
                                            value={form.healthScore}
                                            onChange={(e) => {
                                                setForm({ ...form, healthScore: Number(e.target.value) })
                                                setIsDraft(true)
                                            }}
                                            className="w-full accent-green-600"
                                        />
                                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                                            <span>Poor (1)</span>
                                            <span>Excellent (10)</span>
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <p className="text-sm font-semibold text-gray-700 mb-2">Observations & Notes</p>
                                        <textarea
                                            rows={4}
                                            value={form.notes}
                                            onChange={(e) => { setForm({ ...form, notes: e.target.value }); setIsDraft(true) }}
                                            placeholder="e.g., 'Observed slight yellowing on lower leaves...'"
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                                        />
                                    </div>

                                    {/* Photo Upload */}
                                    <div>
                                        <p className="text-sm font-semibold text-gray-700 mb-2">Disease Detection Photo</p>
                                        <div
                                            onClick={() => document.getElementById('healthPhoto').click()}
                                            className="cursor-pointer border-2 border-dashed border-gray-300 rounded-xl h-44 flex flex-col items-center justify-center hover:border-green-400 hover:bg-green-50 transition overflow-hidden"
                                        >
                                            {photoPreview ? (
                                                <img src={photoPreview} alt="preview" className="h-full w-full object-cover" />
                                            ) : (
                                                <>
                                                    <span className="text-4xl mb-2">📷</span>
                                                    <p className="text-sm font-semibold text-gray-600">Upload Photo</p>
                                                    <p className="text-xs text-gray-400 mt-1 text-center px-6">
                                                        Upload a clear picture of affected leaves for instant ML disease prediction. Max size: 5MB.
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                        <input
                                            id="healthPhoto"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handlePhotoChange}
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setForm({ healthScore: 7, notes: '' })
                                                setPhoto(null)
                                                setPhotoPreview(null)
                                                setIsDraft(false)
                                            }}
                                            className="flex-1 border border-gray-300 text-gray-700 font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition text-sm"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting || !selectedCrop}
                                            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-2.5 rounded-lg transition text-sm flex items-center justify-center gap-2"
                                        >
                                            {submitting ? (
                                                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Saving...</>
                                            ) : (
                                                <><span>▦</span> {existingLog ? 'Update Log' : 'Submit Daily Log'}</>
                                            )}
                                        </button>
                                    </div>

                                </form>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}

export default CropHealthLog