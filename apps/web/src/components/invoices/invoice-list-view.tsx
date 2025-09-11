"use client";
import React from "react";
import { InvoiceList } from "./invoice-list";
import { useInvoices } from "@/hooks/use-invoices";
import { InvoiceService } from "@/services/invoice.service";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Upload, Plus } from "lucide-react";
import Link from "next/link";
import {
  usePageBreadcrumbs,
  BREADCRUMB_CONFIGS,
} from "@/hooks/use-page-breadcrumbs";

export function InvoiceListView() {
  // Set breadcrumbs for documents/invoice list page
  usePageBreadcrumbs(BREADCRUMB_CONFIGS.documents);

  const { invoices, loading, error, pagination, refetch } = useInvoices();

  const handleSearch = (query: string) => {
    refetch({ q: query });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      try {
        await InvoiceService.deleteInvoice(id);
        toast.success("Invoice deleted successfully");
        refetch();
      } catch (error) {
        toast.error("Failed to delete invoice");
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
          <p className="text-sm text-muted-foreground">
            Manage all your PDF invoices
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/invoices/upload">
              <Upload className="mr-1 h-3 w-3" />
              Upload PDF
            </Link>
          </Button>
        </div>
      </div>

      {/* Invoice List */}
      <InvoiceList
        invoices={invoices}
        loading={loading}
        error={error}
        onSearch={handleSearch}
        onDelete={handleDelete}
      />
    </div>
  );
}
