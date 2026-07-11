// src/components/dashboard/DashboardLayout.jsx
import Sidebar from './Sidebar'
import { useAuth } from '../../context/AuthContext.jsx'

export default function DashboardLayout({ children }) {
  const { logout } = useAuth()

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto md:ml-64">
        {/* Top Navbar */}
        <div className="sticky top-0 bg-white border-b border-gray-200 shadow-sm px-6 py-3.5 z-40">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Label */}
            <div className="text-gray-400 text-sm md:hidden font-semibold pl-12">Menu</div>

            {/* Search Bar (Desktop Only) */}
            <div className="relative hidden md:block w-96">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search crops, mandis, or pincodes..."
                className="w-full pl-10 pr-4 py-2 bg-blue-50/50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition-all placeholder-gray-400"
              />
            </div>

            {/* Right Side Controls */}
            <div className="flex items-center gap-3">
              {/* Logout Button */}
              <button
                onClick={logout}
                className="flex items-center gap-2 border border-dashed border-blue-300 hover:border-blue-400 bg-blue-50/20 hover:bg-blue-50 text-blue-700 font-semibold px-4 py-1.5 rounded-full text-xs transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>

              {/* User Avatar */}
              <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200 shadow-sm cursor-pointer flex-shrink-0">
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
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}