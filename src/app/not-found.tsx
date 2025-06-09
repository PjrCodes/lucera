import React from 'react';
import Link from 'next/link';

const NotFoundPage: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 text-gray-800 px-4">
    {/* Icon */}
    <div className="mb-6">
      <svg width="96" height="96" fill="none" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r="46" stroke="#a78bfa" strokeWidth="4" fill="#f3f4f6" />
        <path
          d="M36 60c2.5-4 7.5-4 10 0"
          stroke="#6366f1"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="38" cy="44" r="3" fill="#6366f1" />
        <circle cx="58" cy="44" r="3" fill="#6366f1" />
        <path d="M48 72a24 24 0 1 0 0-48 24 24 0 0 0 0 48z" fill="none" />
      </svg>
    </div>
    <div className="text-7xl font-extrabold text-purple-400 mb-2 drop-shadow-lg">404</div>
    <h2 className="text-2xl font-semibold mb-2 text-gray-700">Page Not Found</h2>
    <p className="mb-6 text-center text-gray-500 max-w-md">
      Sorry, the page you are looking for does not exist or has been moved.
    </p>
    <Link href="/" passHref>
      <span className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 text-white font-semibold shadow-lg hover:from-purple-500 hover:to-blue-500 transition cursor-pointer">
        Return Home
      </span>
    </Link>
  </div>
);

export default NotFoundPage;