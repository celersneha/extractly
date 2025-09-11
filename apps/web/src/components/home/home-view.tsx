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

export function HomeView() {
  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="group relative overflow-hidden border-2 transition-all hover:border-blue-500 hover:shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-3 group-hover:bg-blue-200 transition-colors">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Upload Invoice</CardTitle>
                <CardDescription>
                  Upload PDF invoices and extract data with AI
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Drag & drop your PDF files or browse to upload. Our AI will
              automatically extract all relevant invoice data.
            </p>
            <Button asChild className="w-full">
              <Link href="/invoices/upload">
                <Upload className="mr-2 h-4 w-4" />
                Start Upload
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-2 transition-all hover:border-green-500 hover:shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-3 group-hover:bg-green-200 transition-colors">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-xl">View All Invoices</CardTitle>
                <CardDescription>
                  Browse and manage your uploaded invoices
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Access all your uploaded invoices, view extracted data, edit
              information, and download files.
            </p>
            <Button asChild className="w-full" variant="outline">
              <Link href="/invoices">
                <FileText className="mr-2 h-4 w-4" />
                Browse Invoices
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
