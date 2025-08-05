import React from 'react';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-poppins">
      {/* Header Section */}
      <header className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">About Our Salon</h1>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto">
            Welcome to Glamour Haven, where beauty meets elegance. We’re passionate about making you look and feel your best!
          </p>
        </div>
      </header>

      {/* About Section */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="bg-white rounded-3xl shadow-xl p-8 max-w-4xl mx-auto">
            <h2 className="text-3xl font-semibold text-pink-700 mb-6 text-center">Our Story</h2>
            <p className="text-gray-700 text-lg mb-4">
              Founded in 2020, Glamour Haven is a premier salon dedicated to providing top-notch beauty services. From luxurious haircuts to rejuvenating spa treatments, our team of skilled professionals uses the latest techniques and high-quality products to ensure you leave feeling fabulous.
            </p>
            <p className="text-gray-700 text-lg">
              Our mission is to create a welcoming environment where every client feels pampered and valued. Whether you’re here for a quick trim or a full makeover, we’re committed to delivering exceptional results tailored to your unique style.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-12 bg-pink-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-semibold text-pink-700 mb-8 text-center">Meet Our Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: 'Emma Johnson', role: 'Lead Stylist', img: 'https://via.placeholder.com/150' },
              { name: 'Sophia Lee', role: 'Spa Therapist', img: 'https://via.placeholder.com/150' },
              { name: 'Liam Carter', role: 'Color Specialist', img: 'https://via.placeholder.com/150' },
            ].map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl shadow-xl p-6 text-center transform hover:scale-105 transition duration-300"
              >
                <img
                  src={member.img}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-semibold text-gray-800">{member.name}</h3>
                <p className="text-pink-500">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="bg-white rounded-3xl shadow-xl p-8 max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-semibold text-pink-700 mb-6">Get in Touch</h2>
            <p className="text-gray-700 text-lg mb-4">
              Have questions or ready to book your appointment? Reach out to us!
            </p>
            <p className="text-gray-700 text-lg mb-4">
              📍 123 Beauty Lane, Colombo, Sri Lanka
            </p>
            <p className="text-gray-700 text-lg mb-4">
              📞 +94 77 567 890
            </p>
            <p className="text-gray-700 text-lg mb-6">
              📧 info@glamourhaven.com
            </p>
            <a
              href="/dashboard"
              className="inline-block bg-pink-500 text-white py-3 px-6 rounded-full font-semibold hover:bg-pink-600 transition duration-300 transform hover:scale-105"
            >
              Book Now
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-6 text-center">
          <p>&copy; 2025 Glamour Haven. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default AboutUs;