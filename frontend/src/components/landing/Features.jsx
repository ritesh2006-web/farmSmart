const features = [
  {
    icon: '🌱',
    title: 'Crop Management',
    desc: 'Track your crops from sowing to harvest with automated digital records.',
  },
  {
    icon: '🏪',
    title: 'Live Mandi Prices',
    desc: 'Get real-time market rates from nearby Mandis to sell at the best price.',
  },
  {
    icon: '🌤️',
    title: 'Weather Insights',
    desc: 'Hyper-local weather alerts by pincode to plan your daily farm activities.',
  },
  {
    icon: '📋',
    title: 'Crop Health Logs',
    desc: 'Maintain a daily journal of fertilization, irrigation, and growth progress.',
  },
  {
    icon: '🔬',
    title: 'Disease Detection',
    desc: 'Snap a photo of your leaf and our AI identifies pests and diseases instantly.',
  },
  {
    icon: '📊',
    title: 'Yield Prediction',
    desc: 'Advanced ML models forecast your harvest weight based on historical data.',
  },
]

export default function Features() {
  return (
    <section id="features" className="bg-[#EEF4EE] py-20 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#1B4D1B] mb-3">
            Everything You Need to Farm Smarter
          </h2>
          <p className="text-gray-500 text-lg">
            Built specifically for the needs of the modern Indian farmer.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4">
                {f.icon}
              </div>
              <h3 className="text-[#2D6A2D] font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}