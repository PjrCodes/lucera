import "@/app/globals.css";
import React from "react";

export default async function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-full min-h-screen">
      {children}
    </div>
  );
}
