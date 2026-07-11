const reviews = [
  {
    text: '"Using the yield prediction, I managed my resources better. I saw a 30% better yield this season than last year."',
    name: 'Rajesh Kumar',
    location: 'Punjab',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    text: '"The live mandi prices are a game changer. It saves me thousands on mandi prices by letting me know when to sell."',
    name: 'Suresh Patel',
    location: 'Gujarat',
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
  },
  {
    text: '"The AI camera caught a fungal infection early. I saved my entire tomato crop thanks to the instant advice."',
    name: 'Amit Singh',
    location: 'Maharashtra',
    avatar: 'https://randomuser.me/api/portraits/men/68.jpg',
  },
]

export default function Reviews() {
  return (
    <section id="reviews" className="bg-[#EEF4EE] py-20 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#1B4D1B]">
            Trusted by Farmers Across India
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <span key={j} className="text-yellow-400 text-lg">★</span>
                ))}
              </div>

              {/* Review text */}
              <p className="text-gray-600 text-sm leading-relaxed mb-6 italic">
                {r.text}
              </p>

              {/* Farmer info */}
              <div className="flex items-center gap-3">
                <img
                  src={r.avatar}
                  alt={r.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{r.name}</p>
                  <p className="text-gray-400 text-xs">{r.location}</p>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  )
}