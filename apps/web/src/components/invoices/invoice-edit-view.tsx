"use client";
import React from "react";
import { useInvoice } from "@/hooks/use-invoice";
import { InvoiceForm } from "@/components/common/invoice-form";
import { PDFViewer } from "@/components/common/pdf-viewer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { InvoiceService } from "@/services/invoice.service";
import { toast } from "sonner";
import type { CreateInvoiceData } from "@/types/invoice.types";

interface InvoiceEditViewProps {
  invoiceId: string;
}

export function InvoiceEditView({ invoiceId }: InvoiceEditViewProps) {
  const { invoice, loading, error, refetch } = useInvoice(invoiceId);
  const router = useRouter();

  const constructFileUrl = (fileId: string): string => {
    if (!fileId) return "";
    return `https://rwiuavssfulb8mj3.public.blob.vercel-storage.com/invoices/${fileId}`;
  };

  const handleSubmit = async (data: CreateInvoiceData) => {
    try {
      await InvoiceService.updateInvoice(invoiceId, data);
      toast.success("Invoice updated successfully");
      router.push(`/invoices/${invoiceId}`);
    } catch (error) {
      toast.error("Failed to update invoice");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[600px] bg-muted animate-pulse rounded" />
          <div className="space-y-4">
            <div className="h-96 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <p>Error loading invoice: {error || "Invoice not found"}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const fileUrl =
    invoice.fileUrl ||
    invoice.pdfUrl ||
    (invoice.fileId ? constructFileUrl(invoice.fileId) : "");

  const initialData = {
    fileId: invoice.fileId || "",
    fileName: invoice.fileName || "",
    vendor: invoice.vendor,
    invoice: {
      ...invoice.invoice,
      lineItems: invoice.invoice.lineItems || [],
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Edit Invoice {invoice.invoice.number}
          </h1>
          <p className="text-muted-foreground">{invoice.vendor.name}</p>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - PDF Viewer */}
        <Card>
          <CardHeader>
            <CardTitle>PDF Document</CardTitle>
          </CardHeader>
          <CardContent>
            {fileUrl ? (
              <PDFViewer fileUrl={fileUrl} className="h-[600px]" />
            ) : (
              <div className="flex items-center justify-center h-[600px] bg-gray-100 rounded">
                <p className="text-gray-500">No PDF available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Panel - Invoice Form */}
        <div className="space-y-6">
          <InvoiceForm initialData={initialData} onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}
