"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Zap, Shield, Clock } from "lucide-react";
import Link from "next/link";
import {
  usePageBreadcrumbs,
  BREADCRUMB_CONFIGS,
} from "@/hooks/use-page-breadcrumbs";

export function HomeView() {
  // Set breadcrumbs for home page
  usePageBreadcrumbs(BREADCRUMB_CONFIGS.home);
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="group relative overflow-hidden border transition-all hover:border-blue-500 hover:shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="rounded bg-blue-100 p-2 group-hover:bg-blue-200 transition-colors">
                <Upload className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-sm">Upload Invoice</CardTitle>
                <CardDescription className="text-xs">
                  Upload PDF invoices and extract data with AI
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground mb-3">
              Drag & drop your PDF files or browse to upload. Our AI will
              automatically extract all relevant invoice data.
            </p>
            <Button asChild className="w-full" size="sm">
              <Link href="/invoices/upload">
                <Upload className="mr-2 h-3 w-3" />
                Start Upload
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border transition-all hover:border-green-500 hover:shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="rounded bg-green-100 p-2 group-hover:bg-green-200 transition-colors">
                <FileText className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-sm">View All Invoices</CardTitle>
                <CardDescription className="text-xs">
                  Browse and manage your uploaded invoices
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground mb-3">
              Access all your uploaded invoices, view extracted data, edit
              information, and download files.
            </p>
            <Button asChild className="w-full" variant="outline" size="sm">
              <Link href="/invoices">
                <FileText className="mr-2 h-3 w-3" />
                Browse Invoices
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
