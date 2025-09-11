"use client";
import React from "react";
import { useInvoice } from "@/hooks/use-invoice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PDFViewer } from "@/components/common/pdf-viewer";
import { Edit, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface InvoiceDetailViewProps {
  invoiceId: string;
}

export function InvoiceDetailView({ invoiceId }: InvoiceDetailViewProps) {
  const { invoice, loading, error } = useInvoice(invoiceId);
  const router = useRouter();

  const constructFileUrl = (fileId: string): string => {
    if (!fileId) return "";
    return `https://rwiuavssfulb8mj3.public.blob.vercel-storage.com/invoices/${fileId}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[600px] bg-muted animate-pulse rounded" />
          <div className="space-y-4">
            <div className="h-48 bg-muted animate-pulse rounded" />
            <div className="h-48 bg-muted animate-pulse rounded" />
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Invoice {invoice.invoice.number}
            </h1>
            <p className="text-muted-foreground">{invoice.vendor.name}</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/invoices/${invoice._id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Invoice
          </Link>
        </Button>
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

        {/* Right Panel - Invoice Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Invoice Number</label>
                  <p className="text-lg">{invoice.invoice.number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <p className="text-lg">{invoice.invoice.date}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Currency</label>
                  <p className="text-lg">{invoice.invoice.currency}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Total Amount</label>
                  <p className="text-lg font-bold">
                    {invoice.invoice.currency}{" "}
                    {invoice.invoice.total.toFixed(2)}
                  </p>
                </div>
              </div>

              {invoice.invoice.poNumber && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">PO Number</label>
                    <p className="text-lg">{invoice.invoice.poNumber}</p>
                  </div>
                  {invoice.invoice.poDate && (
                    <div>
                      <label className="text-sm font-medium">PO Date</label>
                      <p className="text-lg">{invoice.invoice.poDate}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vendor Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Vendor Name</label>
                <p className="text-lg">{invoice.vendor.name}</p>
              </div>
              {invoice.vendor.address && (
                <div>
                  <label className="text-sm font-medium">Address</label>
                  <p className="text-lg">{invoice.vendor.address}</p>
                </div>
              )}
              {invoice.vendor.taxId && (
                <div>
                  <label className="text-sm font-medium">Tax ID</label>
                  <p className="text-lg">{invoice.vendor.taxId}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {invoice.invoice.lineItems &&
            invoice.invoice.lineItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Line Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {invoice.invoice.lineItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-2 bg-muted rounded"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{item.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} × {invoice.invoice.currency}{" "}
                            {item.unitPrice.toFixed(2)}
                          </p>
                        </div>
                        <p className="font-medium">
                          {invoice.invoice.currency} {item.total.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>
                        {invoice.invoice.currency}{" "}
                        {(invoice.invoice.subtotal || 0).toFixed(2)}
                      </span>
                    </div>
                    {invoice.invoice.taxPercent &&
                      invoice.invoice.taxPercent > 0 && (
                        <div className="flex justify-between">
                          <span>Tax ({invoice.invoice.taxPercent}%):</span>
                          <span>
                            {invoice.invoice.currency}{" "}
                            {(
                              ((invoice.invoice.subtotal || 0) *
                                invoice.invoice.taxPercent) /
                              100
                            ).toFixed(2)}
                          </span>
                        </div>
                      )}
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>
                        {invoice.invoice.currency}{" "}
                        {invoice.invoice.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
        </div>
      </div>
    </div>
  );
}
