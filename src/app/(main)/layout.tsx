import "@/app/globals.css";
import MainFooter from "@/components/feature/footer";
import HeaderWrapper from "@/components/feature/header/header-wrapper";
import { AppSidebar } from "@/components/feature/sidenav";
import { HeaderProvider } from "@/components/feature/header/header-context";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import React from "react";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <HeaderProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <HeaderWrapper />
          <main>
            <div>{children}</div>
          </main>
          <MainFooter />
        </SidebarInset>
      </SidebarProvider>
    </HeaderProvider>
  );
}
