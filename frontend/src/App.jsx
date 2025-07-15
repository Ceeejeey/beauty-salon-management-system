import { BrowserRouter, Route, Routes } from 'react-router-dom'
import HomePage from './pages/index'
import Signup from './pages/Signup'
import Signin from './pages/Signin'
import './App.css'

function App() {


  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path='/signin' element={<Signin />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
