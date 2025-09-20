import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import HomePage from './pages/index'
import Signup from './pages/Signup'
import Signin from './pages/Signin'
import CustomerDashboard from './pages/customer/Dashboard'
import AdminDashboard from './pages/admin/Dashboard'
import StaffDashboard from './pages/staff/Dashboard'
import GenerateInvoice from './components/admin/GenerateInvoice'  
import AboutUs from './pages/AboutUs'

function App() {
  return (
    <>
      {/* Toast container */}
      <Toaster 
        position="top-right"
        toastOptions={{
          success: {
            style: {
              background: '#d1fae5',
              color: '#065f46',
              borderRadius: '12px',
              padding: '12px 16px',
            },
          },
          error: {
            style: {
              background: '#fee2e2',
              color: '#991b1b',
              borderRadius: '12px',
              padding: '12px 16px',
            },
          },
        }}
      />

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
          <Route path="/admin/generate-invoice" element={<GenerateInvoice />} />
          <Route path="/about-us" element={<AboutUs />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
