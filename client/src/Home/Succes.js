// src/pages/Success.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Success = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/'); // Navigate back to the home page or another route
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-green-50">
      <div className="bg-white p-10 rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">
          Payment Successful 🎉
        </h1>
        <p className="text-gray-600 mb-6">
          Thank you for your payment! Your transaction was completed successfully.
        </p>
        <button
          onClick={handleGoBack}
          className="px-6 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition"
        >
          Go Back to Home
        </button>
      </div>
    </div>
  );
};

export default Success;
