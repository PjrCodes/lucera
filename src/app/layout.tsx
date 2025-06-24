import type { Metadata } from "next";
import {  Raleway, Urbanist } from "next/font/google";
import "@/app/globals.css";
import React from "react";
import ClientProviders from "@/components/core/client-providers";
import { SessionProvider } from "next-auth/react";

const urbanist = Urbanist({
  variable: "--font-header",
  subsets: ["latin"],
});

const raleway = Raleway({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lucera",
  description: "An AI-First, no-compromise Learning Management System. Built for the future of education.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${urbanist.variable} ${raleway.variable} antialiased`}
      >
        <ClientProviders>
          <SessionProvider>
            <div className="font-body w-full min-h-screen flex flex-col bg-primary-50">
              {children}
            </div>
          </SessionProvider>
        </ClientProviders>
      </body>
    </html>
  );
}
