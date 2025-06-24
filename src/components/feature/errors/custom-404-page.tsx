import { PrimaryButton } from "@/components/core/buttons/primary";
import Link from "next/link";

export default function Custom404Page() {
  return (
    <main>
      <div className="w-full min-h-screen flex flex-col items-center justify-center">
        <div className="font-mono text-7xl font-extrabold text-primary-600 mb-2 drop-shadow-xl">
          404
        </div>
        <h2 className="text-2xl font-semibold mb-2 text-primary-600">
          Page Not Found
        </h2>
        <p className="mb-4 text-center text-gray-500 max-w-md">
          Sorry, the page you are looking for does not exist or has been moved.
        </p>
        <PrimaryButton asChild>
          <Link href="/">Return to Dashboard</Link>
        </PrimaryButton>
      </div>
    </main>
  );
}
