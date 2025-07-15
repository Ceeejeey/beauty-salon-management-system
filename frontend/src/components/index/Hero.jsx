import React from "react";

const Hero = () => {
  return (
   <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-gray-100 w-full">
      <div className="text-center max-w-4xl mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-semibold text-gray-800 mb-6 font-poppins">
          Elevate Your Salon Experience
        </h2>
        <p className="text-lg text-gray-600 mb-8 font-poppins">
          Manage appointments, clients, and services with our premium beauty salon system. Designed for elegance and efficiency.
        </p>
        <div className="space-x-4">
          <button className="px-6 py-3 bg-rose-500 text-white font-medium rounded-md hover:bg-rose-600 transition font-poppins cursor-pointer">
            Get Started
          </button>
          <button className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition font-poppins cursor-pointer">
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero