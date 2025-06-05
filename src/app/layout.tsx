import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MainFooter from "@/components/footer";
import Header from "@/components/header";
import { AppSidebar } from "@/components/sidenav";
import { SessionProvider } from "next-auth/react";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { auth } from "@/auth";
import Providers from "./providers";

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
  const session = await auth();

  return (
    <html lang="en">
      <SessionProvider>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <Providers>
            <div className="flex flex-col min-h-screen w-full [--header-height:calc(--spacing(14))]">
              <SidebarProvider className="flex flex-col flex-1">
                <Header session={session} />
                <div className="flex flex-1">
                  <AppSidebar />
                  <SidebarInset className="flex flex-col flex-1">
                    <main className="flex-1">
                      <div className="relative bg-white mx-auto px-4 py-8">
                        {children}
                      </div>
                    </main>
                    <MainFooter />
                  </SidebarInset>
                </div>
              </SidebarProvider>
            </div>
          </Providers>
        </body>
      </SessionProvider>
    </html>
  );
}
