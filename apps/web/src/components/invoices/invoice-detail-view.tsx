"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useInvoice } from "@/hooks/use-invoice";
import { PDFViewer } from "@/components/common/pdf-viewer";
import { InvoiceFormPanel } from "@/components/common/invoice-form-panel";
import { Button } from "@/components/ui/button";
import {
  Download,
  Edit3,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { LineItemsTable } from "@/components/common/invoice-form-panel";
import { useBreadcrumbs } from "@/contexts/breadcrumb-context";
import { InvoiceService } from "@/services/invoice.service";
import { toast } from "sonner";
import type { Invoice } from "@/types/invoice.types";

interface InvoiceDetailViewProps {
  invoiceId: string;
}

export function InvoiceDetailView({ invoiceId }: InvoiceDetailViewProps) {
  const { invoice, loading, error } = useInvoice(invoiceId);
  const router = useRouter();
  const { setBreadcrumbs } = useBreadcrumbs();
  const [isEditMode, setIsEditMode] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showLineItemsTable, setShowLineItemsTable] = useState(false);
  const [updatedInvoiceData, setUpdatedInvoiceData] =
    useState<Partial<Invoice> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const constructFileUrl = (fileId: string): string => {
    if (!fileId) return "";
    return `https://rwiuavssfulb8mj3.public.blob.vercel-storage.com/invoices/${fileId}`;
  };

  // Set breadcrumbs when invoice data is loaded
  const breadcrumbs = useMemo(() => {
    if (!invoice) return null;
    const fileName = `${invoice.invoice.number}-${invoice.vendor.name.replace(
      /\s+/g,
      ""
    )} .pdf`;
    return [{ label: "Documents", href: "/invoices" }, { label: fileName }];
  }, [invoice]);

  useEffect(() => {
    if (breadcrumbs) {
      setBreadcrumbs(breadcrumbs);
    }
  }, [breadcrumbs, setBreadcrumbs]);

  // Handle invoice updates from the form panel
  const handleInvoiceUpdate = (updatedData: Partial<Invoice>) => {
    setUpdatedInvoiceData(updatedData);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Loading invoice...</div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-red-600">
          Error loading invoice: {error || "Invoice not found"}
        </div>
      </div>
    );
  }

  const fileUrl =
    invoice.fileUrl ||
    invoice.pdfUrl ||
    (invoice.fileId ? constructFileUrl(invoice.fileId) : "");

  const fileName = `${invoice.invoice.number}-${invoice.vendor.name.replace(
    /\s+/g,
    ""
  )} .pdf`;

  const handleEdit = () => setIsEditMode(true);

  const handleCancel = () => {
    setIsEditMode(false);
    setUpdatedInvoiceData(null);
  };

  const handleSave = async () => {
    if (!updatedInvoiceData) {
      toast.error("No changes to save");
      return;
    }

    setIsSaving(true);
    try {
      // Transform the data to match the CreateInvoiceData format
      const updateData = {
        fileId: updatedInvoiceData.fileId || invoice.fileId,
        fileName: updatedInvoiceData.fileName || invoice.fileName,
        vendor: updatedInvoiceData.vendor || invoice.vendor,
        invoice: updatedInvoiceData.invoice || invoice.invoice,
      };

      await InvoiceService.updateInvoice(invoiceId, updateData);
      toast.success("Invoice updated successfully");
      setIsEditMode(false);
      setUpdatedInvoiceData(null);

      // Optionally refresh the page or refetch data
      window.location.reload();
    } catch (error) {
      console.error("Failed to update invoice:", error);
      toast.error("Failed to update invoice");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    if (fileUrl) window.open(fileUrl, "_blank");
  };
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 25, 50));

  return (
    <div className="flex h-screen">
      {/* Left Panel - PDF Viewer */}
      <div className="flex-1 border-r flex flex-col">
        <div className="flex justify-center items-center space-x-2 border-b p-2">
          <Button variant="ghost" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        <div
          className={`${
            showLineItemsTable ? "flex-1" : "h-full"
          } overflow-auto`}
          style={{ zoom: `${zoomLevel}%` }}
        >
          {fileUrl ? (
            <PDFViewer fileUrl={fileUrl} className="h-full" />
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-50">
              <p className="text-gray-500">No PDF available</p>
            </div>
          )}
        </div>

        {showLineItemsTable && (
          <div className="border-t bg-white">
            <LineItemsTable invoiceData={invoice} show={showLineItemsTable} />
          </div>
        )}
      </div>

      {/* Right Panel - Invoice Details */}
      <div className="w-96 bg-white flex flex-col">
        <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <span className=" text-xs text-gray-900">{fileName}</span>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">soharshri@newtek.com</span>
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
              Needs Review
            </span>
          </div>
        </div>

        <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            {isEditMode ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Approve"}
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleEdit}
              >
                <Edit3 className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <InvoiceFormPanel
            invoiceData={invoice}
            isEditMode={isEditMode}
            showLineItemsTable={showLineItemsTable}
            setShowLineItemsTable={setShowLineItemsTable}
            onInvoiceUpdate={handleInvoiceUpdate}
          />
        </div>
      </div>
    </div>
  );
}
