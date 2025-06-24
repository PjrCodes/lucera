// import type { Metadata } from "next";
import "@/app/globals.css";
import MainFooter from "@/components/feature/footer";
import HeaderWrapper from "@/components/feature/header/header-wrapper";
import { AppSidebar } from "@/components/feature/sidenav";
// import { SessionProvider } from "next-auth/react";
import { HeaderProvider } from "@/context/header-context";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import React from "react";


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
        // <ClientProviders>
          // <SessionProvider>
            <HeaderProvider>
              {/* <div className="font-sans flex min-h-screen w-full bg-yellow-50"> */}
                <SidebarProvider className="flex flex-1">
                  <AppSidebar />
                  <SidebarInset className="flex flex-col flex-1">
                    <HeaderWrapper />
                    <main className="flex-1">
                      <div className="flex flex-col items-center justify-start w-full h-full">
                        {children}
                      </div>
                    </main>
                    <MainFooter />
                  </SidebarInset>
                </SidebarProvider>
              {/* </div> */}
            </HeaderProvider>
          // </SessionProvider>
        // </ClientProviders>
      // </body>
    // </html>
  );
}
