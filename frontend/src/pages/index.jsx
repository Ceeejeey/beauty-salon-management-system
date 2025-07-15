import React from 'react'
import Header from '../components/index/Header'
import Hero from '../components/index/Hero'
import Footer from '../components/index/Footer'

function index() {
  return (
    <>
    <div className="min-w-full">
        <Header />
        <Hero />
        <Footer />
    </div>
    </>
  )
}

export default index