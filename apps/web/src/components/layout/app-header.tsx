"use client";

import Image from "next/image";
import { ChevronDown, Plus } from "lucide-react";
import Link from "next/link";

interface AppHeaderProps {
  breadcrumbs?: {
    label: string;
    href?: string;
  }[];
}

export function AppHeader({ breadcrumbs }: AppHeaderProps) {
  return (
    <header className="border-b bg-white shadow-sm">
      <div className="pl-4 pr-4 py-2 flex items-center justify-between">
        <div className="flex-1">
          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <div className="flex items-center space-x-1">
              <div className="text-blue-600">
                <Plus className="w-4 h-4" />
              </div>
              {breadcrumbs.map((breadcrumb, index) => (
                <div key={index} className="flex items-center space-x-1">
                  {breadcrumb.href ? (
                    <Link
                      href={breadcrumb.href}
                      className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {breadcrumb.label}
                    </Link>
                  ) : (
                    <span className="text-xs font-medium text-gray-900">
                      {breadcrumb.label}
                    </span>
                  )}
                  {index < breadcrumbs.length - 1 && (
                    <span className="text-xs text-gray-400">›</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Avatar and Info */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
              <Image
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="Amit Jadhav"
                width={32}
                height={32}
                className="w-8 h-8 object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">
                Amit Jadhav
              </span>
              <span className="text-xs text-gray-500">DeptAdmin</span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
