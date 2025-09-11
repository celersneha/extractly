"use client";
import React from "react";
import { InvoiceList } from "./invoice-list";
import { useInvoices } from "@/hooks/use-invoices";
import { InvoiceService } from "@/services/invoice.service";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Upload, Plus } from "lucide-react";
import Link from "next/link";

export function InvoiceListView() {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">Manage all your PDF invoices</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/invoices/upload">
              <Upload className="mr-2 h-4 w-4" />
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
