import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth();

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollTo('home')}>
          <span className="text-2xl">🌿</span>
          <span className="text-xl font-bold text-[#1B4D1B]">FarmSmart</span>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: 'Home', id: 'home' },
            { label: 'Features', id: 'features' },
            { label: 'Reviews', id: 'reviews' },
            { label: 'Pricing', id: 'pricing' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="text-sm text-gray-600 hover:text-[#2D6A2D] font-medium transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* CTA Buttons */}

        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ?
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-[#2D6A2D] hover:bg-[#1B4D1B] text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
            >
              My Profile
            </button> : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="text-sm font-medium text-gray-700 hover:text-[#2D6A2D] transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="bg-[#2D6A2D] hover:bg-[#1B4D1B] text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
                >
                  Get Started
                </button>
              </>)
          }
        </div>


        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-gray-600"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-4">
          {['home', 'features', 'reviews', 'pricing'].map((id) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="text-sm text-gray-600 capitalize text-left"
            >
              {id}
            </button>
          ))}
          {isAuthenticated ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-[#2D6A2D] text-white text-sm font-semibold px-5 py-2 rounded-lg text-center"
            >
              My Profile
            </button>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="text-sm text-gray-700 text-left">Login</button>
              <button
                onClick={() => navigate('/register')}
                className="bg-[#2D6A2D] text-white text-sm font-semibold px-5 py-2 rounded-lg"
              >
                Get Started
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  )
}