import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MainFooter from "@/components/footer";
import Header from "@/components/header";
import { AppSidebar } from "@/components/sidenav";
import { SessionProvider } from "next-auth/react";
import { HeaderProvider } from "@/context/HeaderContext";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "@/auth";
import ClientProviders from "./providers";
import React from "react";
import { getUserData } from "@/lib/databaseService";

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
  let userData = {};
  if (session?.user) {
    const userDataDoc = await getUserData(session?.user?.id || "");
    userData = {
      role: userDataDoc?.role || "norole", // Default to 'user' if role is not defined
      dashboardLayout: userDataDoc?.dashboardLayout || "default",
    };
  } else {
    userData = {
      role: "norole", // Default to 'norole' if no user is logged in
      dashboardLayout: "default",
    };
  }

  const childrenNodeProps = { session: session, userData: userData };
  // If you need to pass session to children components, you can do so here
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, childrenNodeProps);
    }
    return child;
  });

  console.log(childrenWithProps);

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientProviders>
          <SessionProvider>
            <HeaderProvider>
              <div className="flex flex-col min-h-screen w-full [--header-height:calc(--spacing(14))] bg-bgcolor">
                <SidebarProvider className="flex flex-col flex-1">
                  <Header session={session} userData={userData} />
                  <div className="flex flex-1">
                    <AppSidebar />
                    <SidebarInset className="flex flex-col flex-1">
                      <main className="flex-1">
                        <div className="flex flex-col items-center justify-start w-full h-full">
                          {childrenWithProps}
                        </div>
                      </main>
                      <MainFooter />
                    </SidebarInset>
                  </div>
                </SidebarProvider>
              </div>
            </HeaderProvider>
          </SessionProvider>
        </ClientProviders>
      </body>
    </html>
  );
}
