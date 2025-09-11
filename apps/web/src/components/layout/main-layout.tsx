"use client";

import { AppSidebar } from "./app-sidebar";
import { AppHeader } from "./app-header";
import {
  BreadcrumbProvider,
  useBreadcrumbs,
} from "@/contexts/breadcrumb-context";

interface MainLayoutProps {
  children: React.ReactNode;
}

function MainLayoutContent({ children }: MainLayoutProps) {
  const { breadcrumbs } = useBreadcrumbs();

  return (
    <div className="min-h-screen bg-gray-50">
      <AppSidebar />
      <div className="ml-16">
        <AppHeader breadcrumbs={breadcrumbs} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <BreadcrumbProvider>
      <MainLayoutContent>{children}</MainLayoutContent>
    </BreadcrumbProvider>
  );
}
