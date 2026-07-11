import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        // Already loaded
        if (window.Razorpay) {
            resolve(true)
            return
        }

        // Prevent duplicate script tags
        const existingScript = document.getElementById("razorpay-script")
        if (existingScript) {
            existingScript.onload = () => resolve(true)
            existingScript.onerror = () => resolve(false)
            return
        }

        const script = document.createElement("script")
        script.id = "razorpay-script"
        script.src = "https://checkout.razorpay.com/v1/checkout.js"
        script.async = true

        script.onload = () => resolve(true)
        script.onerror = () => resolve(false)

        document.body.appendChild(script)
    })
}

export default function Register() {
    const [form, setForm] = useState({
        name: "", phoneNumber: "", email: "", password: "",
        pinCode: "", state: ""
    })
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handlePaymentAndRegister = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage("")

        // Load Razorpay only when needed
        const scriptLoaded = await loadRazorpayScript()

        if (!scriptLoaded) {
            setMessage("Unable to load Razorpay. Please try again.")
            setLoading(false)
            return
        }

        try {
            // Step 1 — register first, get userId
            const registerRes = await axios.post(`${API_URL}/api/auth/register`, form)
            const userId = registerRes.data.user.id

            // Step 2 — create Razorpay order
            const orderRes = await axios.post(`${API_URL}/api/payment/create-order`)
            const { order_id, amount } = orderRes.data

            // Step 3 — open Razorpay popup
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount,
                currency: "INR",
                name: "FarmSmart",
                description: "One-time access fee",
                order_id,

                handler: async (paymentResponse) => {
                    try {
                        // Step 4 — verify payment
                        await axios.post(`${API_URL}/api/payment/verify`, {
                            razorpay_order_id: paymentResponse.razorpay_order_id,
                            razorpay_payment_id: paymentResponse.razorpay_payment_id,
                            razorpay_signature: paymentResponse.razorpay_signature,
                            userId
                        })

                        setMessage("Registration successful! Redirecting to login...")
                        setTimeout(() => navigate("/login"), 2000)

                    } catch (err) {
                        setMessage("Payment verification failed. Please contact support.")
                    }
                },

                prefill: {
                    name: form.name,
                    contact: form.phoneNumber
                },

                theme: {
                    color: "#2D6A2D"
                }
            }

            const rzp = new window.Razorpay(options)
            rzp.open()

        } catch (error) {
            setMessage(error.response?.data?.message || "Something went wrong.")
        } finally {
            setLoading(false)
        }
    }
    return (
        <div className="min-h-screen bg-[#f0f4f0] flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">

                {/* Logo */}
                <div className="flex flex-col items-center mb-6">
                    <div className="bg-green-700 text-white rounded-full w-14 h-14 flex items-center justify-center text-2xl font-bold mb-2">
                        🌿
                    </div>
                    <h1 className="text-2xl font-bold text-green-700">FarmSmart</h1>
                    <p className="text-gray-500 text-sm">Empowering Growth, Ensuring Clarity</p>
                </div>

                <h2 className="text-lg font-semibold text-center text-gray-800 mb-6">
                    Create your account
                </h2>

                <form onSubmit={handlePaymentAndRegister} className="space-y-4">

                    {/* Name */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Rajesh Kumar"
                            required
                            className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                        />
                    </div>
                    {/* Email */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="rajesh@gmail.com"
                            required
                            className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">Phone Number</label>
                        <div className="flex mt-1">
                            <span className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-l-lg text-sm text-gray-600">
                                +91
                            </span>
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={form.phoneNumber}
                                onChange={handleChange}
                                placeholder="98765 43210"
                                required
                                className="w-full border border-gray-300 rounded-r-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">Password</label>
                        <div className="relative mt-1">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-2.5 text-gray-400 text-sm"
                            >
                                {showPassword ? "🙈" : "👁️"}
                            </button>
                        </div>
                    </div>

                    {/* Pincode */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">Pincode</label>
                        <input
                            type="text"
                            name="pinCode"
                            value={form.pinCode}
                            onChange={handleChange}
                            placeholder="400001"
                            required
                            className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                        />
                    </div>

                    {/* State */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">State / Union Territory</label>
                        <select
                            name="state"
                            value={form.state}
                            onChange={handleChange}
                            required
                            className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-600"
                        >
                            <option value="" disabled>Select State / UT</option>

                            {/* States */}
                            <option value="Andhra Pradesh">Andhra Pradesh</option>
                            <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                            <option value="Assam">Assam</option>
                            <option value="Bihar">Bihar</option>
                            <option value="Chhattisgarh">Chhattisgarh</option>
                            <option value="Goa">Goa</option>
                            <option value="Gujarat">Gujarat</option>
                            <option value="Haryana">Haryana</option>
                            <option value="Himachal Pradesh">Himachal Pradesh</option>
                            <option value="Jharkhand">Jharkhand</option>
                            <option value="Karnataka">Karnataka</option>
                            <option value="Kerala">Kerala</option>
                            <option value="Madhya Pradesh">Madhya Pradesh</option>
                            <option value="Maharashtra">Maharashtra</option>
                            <option value="Manipur">Manipur</option>
                            <option value="Meghalaya">Meghalaya</option>
                            <option value="Mizoram">Mizoram</option>
                            <option value="Nagaland">Nagaland</option>
                            <option value="Odisha">Odisha</option>
                            <option value="Punjab">Punjab</option>
                            <option value="Rajasthan">Rajasthan</option>
                            <option value="Sikkim">Sikkim</option>
                            <option value="Tamil Nadu">Tamil Nadu</option>
                            <option value="Telangana">Telangana</option>
                            <option value="Tripura">Tripura</option>
                            <option value="Uttar Pradesh">Uttar Pradesh</option>
                            <option value="Uttarakhand">Uttarakhand</option>
                            <option value="West Bengal">West Bengal</option>

                            {/* Union Territories */}
                            <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                            <option value="Chandigarh">Chandigarh</option>
                            <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                            <option value="Delhi">Delhi (NCT)</option>
                            <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                            <option value="Ladakh">Ladakh</option>
                            <option value="Lakshadweep">Lakshadweep</option>
                            <option value="Puducherry">Puducherry</option>
                        </select>
                    </div>


                    {/* Message */}
                    {message && (
                        <p className={`text-sm text-center ${message.includes("successful") ? "text-green-600" : "text-red-500"}`}>
                            {message}
                        </p>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-2.5 rounded-lg transition duration-200 disabled:opacity-50"
                    >
                        {loading ? "Processing..." : "Register & Pay ₹299"}
                    </button>

                    {/* Login link */}
                    <p className="text-center text-sm text-gray-500">
                        Already have an account?{" "}
                        <span
                            onClick={() => navigate("/login")}
                            className="text-green-700 font-medium cursor-pointer hover:underline"
                        >
                            Login
                        </span>
                    </p>

                </form>
            </div>
        </div>
    )
}