import React, { useState } from 'react'
import DashboardLayout from '../components/dashboard/DashboardLayout.jsx'
import api from '../services/axios.js'

export default function MLPredicitions() {
  // Yield Predictor States
  const [crop, setCrop] = useState('Wheat (HD-2967)')
  const [soil, setSoil] = useState('Alluvial (Loamy)')
  const [fertilizer, setFertilizer] = useState('120')
  const [isPredicting, setIsPredicting] = useState(false)
  const [predictionResult, setPredictionResult] = useState(null)
  const [predictionError, setPredictionError] = useState(null)

  // Disease Detector States
  const [imagePreview, setImagePreview] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isDetecting, setIsDetecting] = useState(false)
  const [detectionResult, setDetectionResult] = useState(null)
  const [detectionError, setDetectionError] = useState(null)

  // ─── Yield Prediction ─────────────────────────────────────────
  // Sends crop, soil, and fertilizer data to the backend, which
  // forwards it to Gemini API and returns a JSON prediction.
  const handlePredict = async (e) => {
    e.preventDefault()
    setIsPredicting(true)
    setPredictionError(null)
    setPredictionResult(null)

    try {
      const response = await api.post('/gemini/predict-yield', {
        crop,
        soilType: soil,
        fertilizer
      })

      if (response.data.success) {
        setPredictionResult({
          yieldPercentage: response.data.prediction.yieldPercentage,
          yieldValue: response.data.prediction.yieldValue,
          unit: response.data.prediction.unit,
          confidence: response.data.prediction.confidence,
          summary: response.data.prediction.summary,
          visible: true
        })
      } else {
        setPredictionError('Prediction failed. Please try again.')
      }
    } catch (error) {
      console.error('Yield prediction error:', error)
      setPredictionError(
        error.response?.data?.message || 'Failed to get prediction. Please try again.'
      )
    } finally {
      setIsPredicting(false)
    }
  }

  // ─── Disease Detection ────────────────────────────────────────
  // When user selects a leaf image, we store it and show preview.
  // Then send it to the backend via FormData, which forwards
  // the base64 image to Gemini Vision for disease analysis.
  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Show preview
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)

    // Store the file and start detection
    setSelectedFile(file)
    setIsDetecting(true)
    setDetectionResult(null)
    setDetectionError(null)

    try {
      const formData = new FormData()
      formData.append('leafImage', file)

      const response = await api.post('/gemini/detect-disease', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (response.data.success) {
        setDetectionResult({
          disease: response.data.detection.diseaseName,
          confidence: response.data.detection.confidence,
          description: response.data.detection.description,
          treatment: response.data.detection.medicine,
          dosage: response.data.detection.dosage,
          prevention: response.data.detection.prevention
        })
      } else {
        setDetectionError('Disease detection failed. Please try again.')
      }
    } catch (error) {
      console.error('Disease detection error:', error)
      setDetectionError(
        error.response?.data?.message || 'Failed to detect disease. Please try again.'
      )
    } finally {
      setIsDetecting(false)
    }
  }

  const triggerFileInput = () => {
    document.getElementById('leaf-upload').click()
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="text-3xl text-green-700">
            {/* Flask/Beaker Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-green-900 flex items-center gap-2">
              Intelligence Center
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Powered by Google Gemini AI — real-time yield prediction and disease detection.
            </p>
          </div>
        </div>

        {/* Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Yield Predictor Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-150/80 overflow-hidden border-l-[5px] border-green-700 p-6 flex flex-col justify-between min-h-[500px]">
            <div>
              {/* Header inside Card */}
              <div className="flex items-center gap-2 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 00-2-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                </svg>
                <h2 className="text-xl font-bold text-gray-800">Yield Predictor</h2>
                <span className="ml-auto text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200">Gemini AI</span>
              </div>

              {/* Form */}
              <form onSubmit={handlePredict} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Select Crop</label>
                  <div className="relative">
                    <select
                      value={crop}
                      onChange={(e) => setCrop(e.target.value)}
                      className="w-full bg-blue-50/30 border border-gray-250 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white appearance-none cursor-pointer"
                    >
                      <option>Wheat (HD-2967)</option>
                      <option>Rice (IR-64)</option>
                      <option>Maize (DHM-117)</option>
                      <option>Cotton (Bt Cotton)</option>
                      <option>Barley (BH-393)</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Soil Type</label>
                  <div className="relative">
                    <select
                      value={soil}
                      onChange={(e) => setSoil(e.target.value)}
                      className="w-full bg-blue-50/30 border border-gray-250 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white appearance-none cursor-pointer"
                    >
                      <option>Alluvial (Loamy)</option>
                      <option>Black Soil (Clayey)</option>
                      <option>Red Soil (Sandy)</option>
                      <option>Laterite (Sandy Loam)</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Fertilizer Used (kg/acre)</label>
                  <input
                    type="number"
                    value={fertilizer}
                    onChange={(e) => setFertilizer(e.target.value)}
                    className="w-full bg-blue-50/30 border border-gray-250 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPredicting}
                  className="w-full bg-[#2D6A2D] hover:bg-[#1B4D1B] disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-sm mt-2"
                >
                  {isPredicting ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Predict Yield
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Prediction Result Section */}
            {predictionError && (
              <div className="mt-6 pt-4 border-t border-red-100">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 font-medium">
                  ⚠️ {predictionError}
                </div>
              </div>
            )}

            {predictionResult && predictionResult.visible && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Yield Performance</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-4xl font-extrabold text-green-800">{predictionResult.yieldPercentage}%</span>
                  <span className="text-sm font-semibold text-gray-500">of ideal yield</span>
                </div>

                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-lg font-bold text-gray-700">{predictionResult.yieldValue}</span>
                  <span className="text-xs font-semibold text-gray-400">{predictionResult.unit}</span>
                </div>

                {predictionResult.summary && (
                  <p className="text-xs text-gray-500 font-medium mt-2 bg-green-50 rounded-lg p-2.5 border border-green-100">
                    💡 {predictionResult.summary}
                  </p>
                )}

                <div className="mt-4">
                  <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                    <span>AI Confidence</span>
                    <span className="text-amber-800 font-extrabold">{predictionResult.confidence}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-700 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${predictionResult.confidence}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Disease Detector Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-150/80 overflow-hidden border-l-[5px] border-[#D97706] p-6 flex flex-col justify-between min-h-[500px]">
            <div>
              {/* Header inside Card */}
              <div className="flex items-center gap-2 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#D97706]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0a8 8 0 11-16 0 8 8 0 0116 0z" />
                </svg>
                <h2 className="text-xl font-bold text-gray-800">Disease Detector</h2>
                <span className="ml-auto text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">Gemini Vision</span>
              </div>

              {/* Upload Leaf Area */}
              <input
                id="leaf-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              
              <div 
                onClick={triggerFileInput}
                className="border-2 border-dashed border-blue-200/80 hover:border-green-600/50 bg-blue-50/5 hover:bg-blue-50/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[200px]"
              >
                {imagePreview ? (
                  <div className="relative w-full max-w-[160px] h-32 rounded-xl overflow-hidden shadow-sm">
                    <img src={imagePreview} alt="Leaf Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-semibold">Change Photo</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-green-600 mb-3 shadow-sm border border-green-100">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p className="text-sm font-bold text-green-700">Drag and Drop leaf photo</p>
                    <p className="text-xs font-semibold text-gray-400 mt-1">or click to browse from device</p>
                  </>
                )}
              </div>
            </div>

            {/* Results Display */}
            <div className="mt-6 flex-1 flex flex-col justify-end">
              {isDetecting && (
                <div className="flex flex-col items-center justify-center py-6">
                  <svg className="animate-spin h-8 w-8 text-[#D97706]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-xs font-bold text-gray-500 mt-2">Gemini AI is analyzing your leaf image...</p>
                </div>
              )}

              {detectionError && !isDetecting && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 font-medium mt-4">
                  ⚠️ {detectionError}
                </div>
              )}

              {!isDetecting && detectionResult && (
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 mt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-extrabold text-gray-800 text-lg leading-tight">{detectionResult.disease}</h3>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">{detectionResult.description}</p>
                      </div>
                    </div>
                    <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap border border-green-200">
                      {detectionResult.confidence}% Match
                    </span>
                  </div>

                  {/* Treatment Card — Medicine Name & Dosage */}
                  <div className="bg-white border-l-4 border-amber-500 rounded-xl p-4 mt-4 shadow-sm">
                    <p className="text-[10px] font-extrabold text-amber-700 uppercase tracking-widest flex items-center gap-1">
                      💊 Recommended Medicine
                    </p>
                    <p className="text-sm font-extrabold text-gray-800 mt-1">
                      {detectionResult.treatment}
                    </p>
                    <p className="text-xs text-gray-500 font-semibold mt-1">
                      {detectionResult.dosage}
                    </p>
                  </div>

                  {/* Prevention Tips */}
                  {detectionResult.prevention && (
                    <div className="bg-green-50 border border-green-100 rounded-xl p-3 mt-3">
                      <p className="text-[10px] font-extrabold text-green-700 uppercase tracking-widest">🛡️ Prevention</p>
                      <p className="text-xs text-gray-600 font-medium mt-1">{detectionResult.prevention}</p>
                    </div>
                  )}
                </div>
              )}

              {!isDetecting && !detectionResult && !detectionError && (
                <div className="border border-dashed border-gray-200 rounded-2xl p-6 text-center text-gray-400 bg-gray-50/50 mt-4">
                  <p className="text-xs font-semibold">Upload a crop leaf photograph to perform AI-powered disease detection.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
