import type { Metadata } from "next";
import { Geist_Mono, Urbanist } from "next/font/google";
import "@/app/globals.css";
import MainFooter from "@/components/feature/footer";
import React from "react";
import ClientProviders from "@/components/core/client-providers";
import { SessionProvider } from "next-auth/react";

const urbanist = Urbanist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lucera",
  description: "An AI-First, no-compromise Learning Management System.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${urbanist.variable} ${geistMono.variable} antialiased`}
      >
        <ClientProviders>
          <SessionProvider>
            <div className="font-sans w-full min-h-screen flex flex-col bg-primary-50">
              {children}
            </div>
          </SessionProvider>
        </ClientProviders>
      </body>
    </html>
  );
}
