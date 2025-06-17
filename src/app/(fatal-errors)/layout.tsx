import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import MainFooter from "@/components/footer";
import React from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* <ClientProviders> */}
        {/* <SessionProvider> */}
        {/* <HeaderProvider> */}
        <div className="flex flex-col min-h-screen w-full [--header-height:calc(--spacing(14))] bg-bgcolor">
          {/* <SidebarProvider className="flex flex-col flex-1"> */}
          {/* <HeaderWrapper /> */}
          <div className="flex flex-1 flex-col justify-center items-center">
            {/* <AppSidebar /> */}
            {/* <SidebarInset className="flex flex-col flex-1">
                      <main className="flex-1">
                        <div className="flex flex-col items-center justify-start w-full h-full">

                        </div>
                      </main> */}
            <main className="flex-1 w-full h-full flex items-center justify-center">
              <div className="flex flex-col">{children}</div>
            </main>
            <MainFooter />
            {/* </SidebarInset> */}
          </div>
          {/* </SidebarProvider> */}
        </div>
        {/* </HeaderProvider> */}
        {/* </SessionProvider> */}
        {/* </ClientProviders> */}
      </body>
    </html>
  );
}
