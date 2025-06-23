import React from 'react';
import Link from 'next/link';
import { PrimaryButton } from "@/components/core/buttons/primary";

const NotFoundPage: React.FC = () => (
  <div className="w-full flex flex-col items-center justify-center min-h-screen bg-primary-50 px-4">
    <div className="text-7xl font-extrabold text-primary-600 mb-2 drop-shadow-lg font-mono">404</div>
    <h2 className="text-2xl font-semibold mb-2 text-primary-600">Page Not Found</h2>
    <p className="mb-4 text-center text-gray-600 max-w-md">
      Sorry, the page you are looking for does not exist or has been moved.
    </p>
    <PrimaryButton asChild>
      <Link href="/">
      Return to Dashboard
      </Link>
    </PrimaryButton>
  </div>
);

export default NotFoundPage;
