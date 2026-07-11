const steps = [
  {
    number: 1,
    title: 'Register & Pay',
    desc: 'Simple one-time payment of ₹299 for lifetime access to all pro features.',
  },
  {
    number: 2,
    title: 'Add Your Crops',
    desc: 'Select your crops, sowing dates, and farm location using your phone.',
  },
  {
    number: 3,
    title: 'Track & Grow',
    desc: 'Receive AI guidance and market alerts daily to ensure a healthy harvest.',
  },
]

export default function HowItWorks() {
  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#1B4D1B]">
            Get Started in 3 Simple Steps
          </h2>
        </div>

        {/* Steps */}
        <div className="flex flex-col md:flex-row items-start justify-center gap-8 relative">

          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center text-center flex-1">

              {/* Number circle */}
              <div className="bg-[#2D6A2D] text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-4 shadow-lg">
                {step.number}
              </div>

              {/* Dotted connector (between steps) */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-0 right-0 border-t-2 border-dashed border-green-300 -z-10" />
              )}

              <h3 className="text-[#2D6A2D] font-semibold text-lg mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm max-w-xs leading-relaxed">{step.desc}</p>
            </div>
          ))}

        </div>
      </div>
    </section>
  )
}