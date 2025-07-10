import type { Metadata } from "next";
import { Lato, Urbanist } from "next/font/google";
import "@/app/globals.css";
import React from "react";
import ClientProviders from "@/components/core/client-providers";
import { SessionProvider } from "next-auth/react";

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
  weight: "variable",
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
});

export const metadata: Metadata = {
  title: "Lucera",
  description:
    "An AI-First, no-compromise Learning Management System. Built for the future of education.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${urbanist.variable} ${lato.variable} antialiased`}
    >
      <body className="font-body">
        <ClientProviders>
          <SessionProvider>
            <div className="w-full min-h-screen flex flex-col bg-primary-50">
              {children}
            </div>
          </SessionProvider>
        </ClientProviders>
      </body>
    </html>
  );
}
