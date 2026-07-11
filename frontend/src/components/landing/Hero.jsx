import { useNavigate } from 'react-router-dom'

export default function Hero() {
  const navigate = useNavigate()

  return (
    <section id="home" className="bg-[#EEF4EE] py-20 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">

        {/* Left Content */}
        <div className="flex-1">
          <h1 className="text-5xl md:text-6xl font-bold text-[#1B4D1B] leading-tight mb-6">
            Smart Farming <br /> Starts Here
          </h1>
          <p className="text-gray-600 text-lg mb-8 max-w-md">
            AI-powered crop management, real-time mandi prices, and weather insights
            for Indian farmers. Empower your growth with data you can trust.
          </p>
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => navigate('/register')}
              className="bg-[#2D6A2D] hover:bg-[#1B4D1B] text-white font-semibold px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              Start Free Trial →
            </button>
            <button className="border border-gray-400 text-gray-700 font-semibold px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors">
              ▶ Watch Demo
            </button>
          </div>
        </div>

        {/* Right Image */}
        <div className="flex-1 relative">
          <div className="rounded-2xl overflow-hidden shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&q=80"
              alt="Indian farmer with smartphone"
              className="w-full h-80 object-cover"
            />
          </div>

          {/* Floating Card */}
          <div className="absolute bottom-4 left-4 bg-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <span className="text-green-700 text-lg">📈</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Yield Forecast</p>
              <p className="text-green-700 font-bold text-lg">+24% Expected</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}