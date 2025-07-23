import "@/app/globals.css";
import { MainFooter } from "@/components/feature/footer";
import HeaderWrapper from "@/components/feature/header/header-wrapper";
import { AppSidebar } from "@/components/feature/sidenav";
import { HeaderProvider } from "@/components/feature/header/header-context";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import React from "react";
import { getSessionAndUserData } from "@/lib/database-service/auth";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  // protect all pages with authentication
  await getSessionAndUserData();

  return (
    <HeaderProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <HeaderWrapper />
          <main>
            {children}
          </main>
          <MainFooter />
        </SidebarInset>
      </SidebarProvider>
    </HeaderProvider>
  );
}
