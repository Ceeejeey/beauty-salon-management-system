import { BrowserRouter, Route, Routes } from 'react-router-dom'
import HomePage from './pages/index'
import Signup from './pages/Signup'
import Signin from './pages/Signin'
import CustomerDashboard from './pages/customer/Dashboard'
import AdminDashboard from './pages/admin/Dashboard'
import StaffDashboard from './pages/staff/Dashboard'
import GenerateInvoice from './components/admin/GenerateInvoice'  


function App() {


  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path='/signin' element={<Signin />} />
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
          <Route path="/admin/generate-invoice" element={<GenerateInvoice />} />
          {/* Add more routes as needed */}
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
