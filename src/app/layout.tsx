import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MainFooter from "@/components/footer";
import MainHeader from "@/components/header";
import Navbar, { AppSidebar } from "@/components/sidenav";
import { SessionProvider } from "next-auth/react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <SessionProvider>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <div className="[--header-height:calc(--spacing(14))]">
            <SidebarProvider className="flex flex-col">
              <MainHeader />
              <div className="flex flex-1">
                <AppSidebar />
                <SidebarInset>
                  <main>
                    <div className="relative min-h-svh bg-white">
                      {children}
                    </div>
                  </main>
                  <MainFooter />
                </SidebarInset>
              </div>
            </SidebarProvider>
          </div>
        </body>
      </SessionProvider>
    </html>
  );
}
