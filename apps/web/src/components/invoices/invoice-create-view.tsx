"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceForm } from "@/components/common/invoice-form";
import { PDFViewer } from "@/components/common/pdf-viewer";
import { useUpload } from "@/hooks/use-upload";
import { InvoiceService } from "@/services/invoice.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { CreateInvoiceData } from "@/types/invoice.types";
import {
  usePageBreadcrumbs,
  BREADCRUMB_CONFIGS,
} from "@/hooks/use-page-breadcrumbs";

export function InvoiceCreateView() {
  // Set breadcrumbs for create page
  usePageBreadcrumbs(BREADCRUMB_CONFIGS.create);

  const searchParams = useSearchParams();
  const fileId = searchParams.get("fileId");
  const { extractData, extracting, extractedData } = useUpload();
  const router = useRouter();

  const [fileUrl, setFileUrl] = useState("");

  useEffect(() => {
    if (fileId) {
      // Construct file URL from fileId
      const url = `https://rwiuavssfulb8mj3.public.blob.vercel-storage.com/invoices/${fileId}`;
      setFileUrl(url);
    }
  }, [fileId]);

  const handleExtract = async () => {
    if (fileId) {
      try {
        await extractData(fileId);
      } catch (error) {
        console.error("Extraction failed:", error);
      }
    }
  };

  const handleSubmit = async (data: CreateInvoiceData) => {
    try {
      const response = await InvoiceService.createInvoice(data);
      toast.success("Invoice created successfully");
      router.push(`/invoices/${response.data._id}`);
    } catch (error) {
      toast.error("Failed to create invoice");
    }
  };

  const initialData = extractedData
    ? {
        fileId: fileId || "",
        fileName: fileId || "",
        vendor: extractedData.vendor,
        invoice: extractedData.invoice,
      }
    : {
        fileId: fileId || "",
        fileName: fileId || "",
      };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Create New Invoice
        </h1>
        <p className="text-sm text-muted-foreground">
          Extract data from your PDF and create an invoice record
        </p>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Panel - PDF Viewer */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">PDF Document</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            {fileUrl ? (
              <PDFViewer fileUrl={fileUrl} className="h-[500px]" />
            ) : (
              <div className="flex items-center justify-center h-[500px] bg-gray-100 rounded">
                <p className="text-sm text-gray-500">No PDF uploaded</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Panel - Invoice Form */}
        <div className="space-y-4">
          <InvoiceForm
            initialData={initialData}
            onSubmit={handleSubmit}
            onExtract={fileId ? handleExtract : undefined}
            isExtracting={extracting}
          />
        </div>
      </div>
    </div>
  );
}
