// src/components/dashboard/Sidebar.jsx
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const navItems = [
    { 
      label: 'Dashboard', 
      path: '/dashboard',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    },
    { 
      label: 'My Crops', 
      path: '/app/dashboard/my-crops',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 22V8m0 0c1.5-2 4-4 6-4-1 2-3 4.5-6 4zm0 0c-1.5-2-4-4-6-4 1 2 3 4.5 6 4z" />
        </svg>
      )
    },
    { 
      label: 'Mandi Prices', 
      path: '/app/dashboard/mandi-prices',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      label: 'Crop Health Log', 
      path: '/crop-health-log',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      )
    },
    { 
      label: 'ML Predictions', 
      path: '/ml-predictions',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
        </svg>
      )
    },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="fixed top-3 left-6 z-50 md:hidden bg-green-700 text-white p-2 rounded-lg shadow-sm hover:bg-green-800 transition-colors"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 shadow-sm overflow-y-auto transition-transform duration-300 md:translate-x-0 z-40 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* User Info & Profile Photo Card */}
        <div className="p-6 flex flex-col items-center text-center border-b border-gray-100">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-green-600/20 shadow-sm mb-3">
            <img 
              src="https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=100&h=100&q=80" 
              alt="Rajesh Kumar" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?fit=crop&w=100&h=100&q=80"
              }}
            />
          </div>
          <h2 className="font-bold text-gray-800 text-sm leading-tight">{user?.name || 'Rajesh Kumar'}</h2>
          <p className="text-[11px] text-gray-400 mt-0.5">Farmer ID: FS-8821</p>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-2.5">
          {navItems.map((item) => {
            const active = isActive(item.path)
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path)
                  setMenuOpen(false)
                }}
                className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-3 transition-all ${
                  active
                    ? 'bg-green-700 text-white font-semibold shadow-sm'
                    : 'border border-dashed border-blue-200 bg-blue-50/10 text-blue-900 hover:bg-blue-50/30'
                }`}
              >
                <span className={active ? 'text-white' : 'text-blue-600'}>{item.icon}</span>
                <span className="text-xs font-semibold">{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Add Crop Button */}
        <div className="p-4">
          <button
            onClick={() => {
              navigate('/app/dashboard/my-crops')
              setMenuOpen(false)
            }}
            className="w-full bg-green-750 hover:bg-green-800 bg-green-800 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors text-xs"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add New Crop
          </button>
        </div>

        {/* Bottom Menu */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-100 p-4 bg-white space-y-1">
          <button
            onClick={() => navigate('#')}
            className="w-full text-left px-4 py-2 text-gray-600 hover:text-green-700 flex items-center gap-3 text-xs transition-colors rounded-lg hover:bg-gray-50 font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </button>
          <button
            onClick={() => navigate('#')}
            className="w-full text-left px-4 py-2 text-gray-600 hover:text-green-700 flex items-center gap-3 text-xs transition-colors rounded-lg hover:bg-gray-50 font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Support
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  )
}