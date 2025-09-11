"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";

interface AppHeaderWrapperProps {
  customBreadcrumbs?: { label: string; href?: string }[];
}

export function AppHeaderWrapper({ customBreadcrumbs }: AppHeaderWrapperProps) {
  const pathname = usePathname();

  const getBreadcrumbs = () => {
    if (customBreadcrumbs) {
      return customBreadcrumbs;
    }

    switch (pathname) {
      case "/":
      case "/home":
        return [{ label: "Home" }];
      case "/invoices":
        return [{ label: "Documents" }];
      case "/invoices/upload":
        return [{ label: "Documents", href: "/invoices" }, { label: "Upload" }];
      case "/invoices/create":
        return [{ label: "Documents", href: "/invoices" }, { label: "Create" }];
      default:
        // For individual invoice pages like /invoices/[id]
        if (
          pathname.startsWith("/invoices/") &&
          !pathname.includes("/upload") &&
          !pathname.includes("/create")
        ) {
          return [
            { label: "Documents", href: "/invoices" },
            { label: "Invoice Details" },
          ];
        }
        return [];
    }
  };

  return <AppHeader breadcrumbs={getBreadcrumbs()} />;
}
