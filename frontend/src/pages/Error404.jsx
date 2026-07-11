import React from "react";
import { Link } from "react-router-dom";

const Error404 = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center px-6">
      <div className="text-center max-w-xl">
        {/* 404 Text */}
        <h1 className="text-8xl md:text-9xl font-extrabold text-white animate-pulse">
          404
        </h1>

        {/* Message */}
        <h2 className="mt-4 text-3xl md:text-4xl font-bold text-gray-100">
          Oops! Page Not Found
        </h2>

        <p className="mt-4 text-gray-400 text-lg">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Illustration */}
        <div className="mt-8 flex justify-center">
          <div className="relative">
            <div className="w-40 h-40 rounded-full bg-indigo-500/20 blur-3xl absolute"></div>
            <span className="text-8xl relative z-10">🚀</span>
          </div>
        </div>

        {/* Button */}
        <div className="mt-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:scale-105"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Footer */}
        <p className="mt-8 text-sm text-gray-500">
          Error Code: 404 | Lost in Space 🌌
        </p>
      </div>
    </div>
  );
};

export default Error404;