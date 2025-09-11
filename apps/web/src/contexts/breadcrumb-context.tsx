"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { usePathname } from "next/navigation";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface BreadcrumbContextType {
  breadcrumbs: Breadcrumb[];
  setBreadcrumbs: (breadcrumbs: Breadcrumb[]) => void;
  setCustomBreadcrumbs: (breadcrumbs: Breadcrumb[] | null) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(
  undefined
);

// Route mapping for breadcrumb generation
const routeMapping: Record<string, string> = {
  "/home": "Home",
  "/invoices": "Documents",
  "/invoices/upload": "Upload",
  "/invoices/create": "Create",
};

function generateBreadcrumbsFromPath(pathname: string): Breadcrumb[] {
  // Handle root path
  if (pathname === "/" || pathname === "/home") {
    return [{ label: "Home", href: "/home" }];
  }

  // Handle specific routes
  if (routeMapping[pathname]) {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs: Breadcrumb[] = [];

    // Build breadcrumbs progressively
    let currentPath = "";
    for (const segment of segments) {
      currentPath += `/${segment}`;
      const label = routeMapping[currentPath];
      if (label) {
        breadcrumbs.push({
          label,
          href: currentPath,
        });
      }
    }

    // Special case for upload - add Documents parent
    if (pathname === "/invoices/upload" || pathname === "/invoices/create") {
      return [
        { label: "Documents", href: "/invoices" },
        { label: routeMapping[pathname], href: pathname },
      ];
    }

    return breadcrumbs;
  }

  // Handle dynamic routes like /invoices/[id]
  if (
    pathname.startsWith("/invoices/") &&
    pathname !== "/invoices/upload" &&
    pathname !== "/invoices/create"
  ) {
    return [
      { label: "Documents", href: "/invoices" },
      { label: "Loading...", href: undefined }, // Will be updated by the component
    ];
  }

  // Default fallback
  return [{ label: "Home", href: "/home" }];
}

export function BreadcrumbProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);
  const [customBreadcrumbs, setCustomBreadcrumbs] = useState<
    Breadcrumb[] | null
  >(null);
  const pathname = usePathname();

  useEffect(() => {
    if (customBreadcrumbs && customBreadcrumbs.length > 0) {
      // Use custom breadcrumbs when they are set
      setBreadcrumbs(customBreadcrumbs);
    } else {
      // Auto-generate breadcrumbs from pathname when no custom breadcrumbs
      const autoBreadcrumbs = generateBreadcrumbsFromPath(pathname);
      setBreadcrumbs(autoBreadcrumbs);
    }
  }, [pathname, customBreadcrumbs]);

  const handleSetCustomBreadcrumbs = useCallback(
    (newBreadcrumbs: Breadcrumb[] | null) => {
      setCustomBreadcrumbs(newBreadcrumbs);
      // Don't call setBreadcrumbs here - let the useEffect handle it
    },
    []
  );

  const handleSetBreadcrumbs = useCallback((newBreadcrumbs: Breadcrumb[]) => {
    setBreadcrumbs(newBreadcrumbs);
  }, []);

  return (
    <BreadcrumbContext.Provider
      value={{
        breadcrumbs,
        setBreadcrumbs: handleSetBreadcrumbs,
        setCustomBreadcrumbs: handleSetCustomBreadcrumbs,
      }}
    >
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumbs() {
  const context = useContext(BreadcrumbContext);
  if (context === undefined) {
    throw new Error("useBreadcrumbs must be used within a BreadcrumbProvider");
  }
  return context;
}
