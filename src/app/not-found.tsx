import React from 'react';
import Link from 'next/link';

const NotFoundPage: React.FC = () => (
  <div className="w-full flex flex-col items-center justify-center min-h-screen bg-lucerarose-1 px-4">
    <div className="text-7xl font-extrabold text-lucerarose-4 mb-2 drop-shadow-lg font-mono">404</div>
    <h2 className="text-2xl font-semibold mb-2 text-lucerarose-5">Page Not Found</h2>
    <p className="mb-4 text-center text-gray-600 max-w-md">
      Sorry, the page you are looking for does not exist or has been moved.
    </p>
    <Link href="/" passHref>
      <span className="inline-block p-4 py-2 rounded-md bg-lucerarose-3 text-white font-semibold shadow-md hover:bg-lucerarose-5 transition cursor-pointer">
        Return to Dashboard
      </span>
    </Link>
  </div>
);

export default NotFoundPage;
