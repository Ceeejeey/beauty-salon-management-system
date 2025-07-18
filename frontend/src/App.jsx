import { BrowserRouter, Route, Routes } from 'react-router-dom'
import HomePage from './pages/index'
import Signup from './pages/Signup'
import Signin from './pages/Signin'
import CustomerDashboard from './pages/customer/Dashboard'


function App() {


  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path='/signin' element={<Signin />} />
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
          {/* Add more routes as needed */}
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
