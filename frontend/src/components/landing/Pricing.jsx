import { useNavigate } from 'react-router-dom'

const features = [
  'Unlimited crop tracking',
  'Live Mandi price alerts',
  'Pincode-based weather alerts',
  'Daily health logs & reminders',
  'AI disease detection camera',
  'ML yield prediction models',
  'Lifetime app updates',
]

export default function Pricing() {
  const navigate = useNavigate()

  return (
    <section id="pricing" className="bg-white py-20 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#1B4D1B]">Simple, Honest Pricing</h2>
        </div>

        {/* Single Pricing Card */}
        <div className="max-w-lg mx-auto border-2 border-[#2D6A2D] rounded-2xl p-8 shadow-sm">

          {/* Badge */}
          <div className="flex justify-center mb-4">
            <span className="bg-green-100 text-[#2D6A2D] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
              Lifetime Access
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="text-5xl font-bold text-[#1B4D1B]">₹299</span>
            <span className="text-2xl text-gray-400 line-through">₹999</span>
          </div>

          {/* Features list */}
          <ul className="space-y-3 mb-8">
            {features.map((f, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                <span className="text-[#2D6A2D] text-lg">✓</span>
                {f}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <button
            onClick={() => navigate('/register')}
            className="w-full bg-[#2D6A2D] hover:bg-[#1B4D1B] text-white font-semibold py-3 rounded-xl transition-colors text-base"
          >
            Get Started Now
          </button>

          <p className="text-center text-xs text-gray-400 mt-3">
            No hidden charges. No monthly fees.
          </p>

        </div>
      </div>
    </section>
  )
}