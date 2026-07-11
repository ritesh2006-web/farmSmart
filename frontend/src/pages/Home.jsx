import Navbar from '../components/landing/Navbar'
import Hero from '../components/landing/Hero'
import Features from '../components/landing/Features'
import HowItWorks from '../components/landing/HowItWorks'
import Reviews from '../components/landing/Reviews'
import Pricing from '../components/landing/Pricing'
import Footer from '../components/landing/Footer'

export default function Home() {
  return (
    <div className="font-sans">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Reviews />
      <Pricing />
      <Footer />
    </div>
  )
}