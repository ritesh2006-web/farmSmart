import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Register from './pages/Register'
import Login from './pages/Login'
import Home from './pages/Home'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import MyCrops from './pages/MyCrops'
import MandiPrices from './pages/MandiPrices'
import MLPredicitions from './pages/MLPredicitions'
import ProtectedRoute from './components/ProtectedRoute'
import Error404 from './pages/Error404'
import CropHealthLog from './pages/CropHealthLog'

function App() {
  return (
      <Routes>
        {/* //public routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/" element={<Home />} />


        {/* //protected routes */}

        <Route
          path='/dashboard'
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
        <Route
          path='/crop-health-log'
          element={
            <ProtectedRoute>
              <CropHealthLog />
            </ProtectedRoute>
          } />
        <Route
          path='/app/dashboard/my-crops'
          element={
            <ProtectedRoute>
              <MyCrops />
            </ProtectedRoute>
          } />
        <Route
          path='/app/dashboard/mandi-prices'
          element={
            <ProtectedRoute>
              <MandiPrices />
            </ProtectedRoute>
          } />
        <Route
          path='/ml-predictions'
          element={
            <ProtectedRoute>
              <MLPredicitions />
            </ProtectedRoute>
          } />

        <Route path='*' element={<Error404 />} />
      </Routes>
  )
}

export default App