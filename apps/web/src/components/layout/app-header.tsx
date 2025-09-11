"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { FileText, Home, Upload } from "lucide-react";

const navigation = [
  { name: "Home", href: "/home", icon: Home },
  { name: "All Invoices", href: "/invoices", icon: FileText },
  { name: "Upload PDF", href: "/invoices/upload", icon: Upload },
];

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-primary">
          Extractly
        </Link>
        <nav className="flex space-x-8">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:border-gray-300 hover:text-gray-700"
                )}
              >
                <Icon className="mr-2 h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

export default AppHeader;
