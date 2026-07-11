export default function Footer() {
  return (
    <footer className="bg-[#EEF4EE] border-t border-gray-200 py-12 px-6">
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col md:flex-row justify-between gap-10 mb-10">

          {/* Brand */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🌿</span>
              <span className="text-xl font-bold text-[#1B4D1B]">FarmSmart</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Empowering Growth, Ensuring Clarity. Helping Indian farmers maximize
              their yield with modern technology.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-16">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-4">Company</h4>
              <ul className="space-y-2">
                {['About Us', 'Sustainability', 'Contact Support'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-gray-500 hover:text-[#2D6A2D] transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-4">Legal</h4>
              <ul className="space-y-2">
                {['Privacy Policy', 'Terms of Service'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-gray-500 hover:text-[#2D6A2D] transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-200 pt-6 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-xs text-gray-400">
            © 2024 FarmSmart Agri-Tech Solutions. All rights reserved.
          </p>
          <p className="text-xs text-gray-400">Made for Indian Farmers 🇮🇳</p>
        </div>

      </div>
    </footer>
  )
}