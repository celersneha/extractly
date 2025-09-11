"use client";

import { useEffect, useMemo } from "react";
import { useBreadcrumbs } from "@/contexts/breadcrumb-context";

interface Breadcrumb {
  label: string;
  href?: string;
}

/**
 * Hook to set breadcrumbs for a specific page
 * @param breadcrumbs - Array of breadcrumb objects
 * @param deps - Dependencies array for useEffect
 */
export function usePageBreadcrumbs(
  breadcrumbs: Breadcrumb[],
  deps: any[] = []
) {
  const { setCustomBreadcrumbs } = useBreadcrumbs();

  // Memoize the breadcrumbs to avoid re-renders when the array contents are the same
  const memoizedBreadcrumbs = useMemo(
    () => breadcrumbs,
    [JSON.stringify(breadcrumbs)]
  );

  useEffect(() => {
    setCustomBreadcrumbs(memoizedBreadcrumbs);

    // Cleanup: reset to auto-generated breadcrumbs when component unmounts
    return () => {
      setCustomBreadcrumbs(null);
    };
  }, [setCustomBreadcrumbs, memoizedBreadcrumbs, ...deps]);
}

/**
 * Predefined breadcrumb configurations for common pages
 */
export const BREADCRUMB_CONFIGS = {
  home: [{ label: "Home", href: "/home" }],
  documents: [{ label: "Documents", href: "/invoices" }],
  upload: [
    { label: "Documents", href: "/invoices" },
    { label: "Upload", href: "/invoices/upload" },
  ],
  create: [
    { label: "Documents", href: "/invoices" },
    { label: "Create", href: "/invoices/create" },
  ],
};
