import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <header className="flex justify-between items-center px-6 py-4 bg-white shadow-sm w-full">
            <h1 className="text-2xl font-semibold text-gray-800 font-poppins">Luxe Salon</h1>
            <div className="space-x-4">
                <Link
                    to="/signin"
                    className="px-4 py-2 text-gray-700 font-medium hover:text-gray-900 transition font-poppins cursor-pointer"
                >
                    Sign In
                </Link>
                <Link
                    to="/signup"
                    className="px-4 py-2 bg-rose-500 text-white font-medium rounded-md hover:bg-rose-600 transition font-poppins cursor-pointer"
                >
                    Sign Up
                </Link>
            </div>

        </header>
    );
};

export default Header