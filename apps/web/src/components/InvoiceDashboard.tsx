"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PDFViewer from "@/components/PDFViewer";
import InvoiceForm from "@/components/InvoiceForm";
import InvoiceList from "@/components/InvoiceList";
import { Upload, FileText, Loader2 } from "lucide-react";
import { invoiceApi, ApiError } from "@/lib/api";
import type { Invoice, CreateInvoiceData } from "@/types/invoice.types";
import { toast } from "sonner";

export default function InvoiceDashboard() {
  const [currentView, setCurrentView] = useState<
    "list" | "create" | "edit" | "view"
  >("list");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [uploadedFileId, setUploadedFileId] = useState<string>("");
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [extractedData, setExtractedData] =
    useState<Partial<CreateInvoiceData> | null>(null);

  // Loading states
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);

  // Dialog states
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // Handle PDF file upload
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Please select a PDF file");
        return;
      }
      if (file.size > 25 * 1024 * 1024) {
        toast.error("File size must be less than 25MB");
        return;
      }
      setPdfFile(file);
    }
  };

  const handleUpload = async () => {
    if (!pdfFile) {
      toast.error("Please select a PDF file");
      return;
    }

    try {
      setUploading(true);
      const response = await invoiceApi.uploadPDF(pdfFile);

      setUploadedFileId(response.data.fileId);
      setUploadedFileName(response.data.fileName);
      setPdfUrl(response.data.fileUrl);

      toast.success("PDF uploaded successfully");
      setUploadDialogOpen(false);

      // Reset form data when new file is uploaded
      setExtractedData(null);

      // Switch to create view
      setCurrentView("create");
    } catch (error) {
      console.error("Upload failed:", error);
      const message =
        error instanceof ApiError ? error.message : "Upload failed";
      toast.error("Failed to upload PDF", { description: message });
    } finally {
      setUploading(false);
    }
  };

  // Extraction handler
  const handleExtract = async () => {
    if (!uploadedFileId) {
      toast.error("Please upload a PDF first");
      return;
    }

    try {
      setExtracting(true);
      const response = await invoiceApi.extractInvoiceData(uploadedFileId);

      setExtractedData({
        fileId: uploadedFileId,
        fileName: uploadedFileName,
        vendor: response.data.vendor,
        invoice: response.data.invoice,
      });

      toast.success("Invoice data extracted successfully");
    } catch (error) {
      console.error("Extraction failed:", error);
      const message =
        error instanceof ApiError ? error.message : "Extraction failed";
      toast.error("Failed to extract invoice data", { description: message });
    } finally {
      setExtracting(false);
    }
  };

  // Handle invoice creation/update
  const handleSubmit = async (data: CreateInvoiceData) => {
    try {
      setSaving(true);

      if (selectedInvoice) {
        // Update existing invoice
        const response = await invoiceApi.updateInvoice(
          selectedInvoice._id,
          data
        );
        toast.success("Invoice updated successfully");
        setSelectedInvoice(response.data);
      } else {
        // Create new invoice
        const response = await invoiceApi.createInvoice(data);
        toast.success("Invoice created successfully");
        setSelectedInvoice(response.data);
      }

      // Reset form state
      setExtractedData(null);
      setPdfFile(null);
      setPdfUrl("");
      setUploadedFileId("");
      setUploadedFileName("");

      // Go back to list view
      setCurrentView("list");
    } catch (error) {
      console.error("Save failed:", error);
      const message = error instanceof ApiError ? error.message : "Save failed";
      toast.error("Failed to save invoice", { description: message });
    } finally {
      setSaving(false);
    }
  };

  // Handle view invoice
  const handleViewInvoice = async (invoice: Invoice) => {
    setSelectedInvoice(invoice);

    // Set the PDF URL from the invoice data
    const fileUrl = invoice.fileUrl || invoice.pdfUrl || "";

    if (!fileUrl) {
      toast.error("No PDF file available for this invoice");
      return;
    }

    setPdfUrl(fileUrl);
    setCurrentView("view");
  };

  // Handle edit invoice
  const handleEditInvoice = async (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setExtractedData({
      fileId: invoice.fileId || "",
      fileName: invoice.fileName || "",
      vendor: invoice.vendor,
      invoice: {
        ...invoice.invoice,
        lineItems: invoice.invoice?.lineItems || [],
      },
    });

    // Set the PDF URL from the invoice data
    const fileUrl = invoice.fileUrl || invoice.pdfUrl || "";

    if (!fileUrl) {
      toast.error("No PDF file available for this invoice");
    }

    setPdfUrl(fileUrl);
    setCurrentView("edit");
  };

  // Handle create new invoice
  const handleCreateInvoice = () => {
    setSelectedInvoice(null);
    setExtractedData(null);
    setPdfFile(null);
    setPdfUrl("");
    setUploadedFileId("");
    setUploadedFileName("");
    setUploadDialogOpen(true);
  };

  const resetToList = () => {
    setCurrentView("list");
    setSelectedInvoice(null);
    setExtractedData(null);
    setPdfFile(null);
    setPdfUrl("");
    setUploadedFileId("");
    setUploadedFileName("");
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                PDF Invoice Dashboard
              </h1>
              <p className="text-gray-600">
                Upload, extract, and manage invoice data with AI
              </p>
            </div>

            {currentView !== "list" && (
              <Button variant="outline" onClick={resetToList}>
                Back to List
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {currentView === "list" && (
          <InvoiceList
            onViewInvoice={handleViewInvoice}
            onEditInvoice={handleEditInvoice}
            onCreateInvoice={handleCreateInvoice}
          />
        )}

        {currentView === "view" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel - PDF Viewer */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>PDF Document</CardTitle>
                </CardHeader>
                <CardContent>
                  {pdfUrl ? (
                    <PDFViewer fileUrl={pdfUrl} className="h-[600px]" />
                  ) : (
                    <div className="flex items-center justify-center h-[600px] bg-gray-100 rounded">
                      <p className="text-gray-500">No PDF available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Panel - Invoice Details */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Invoice Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedInvoice && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold">Invoice Information</h3>
                        <p>
                          <strong>Number:</strong>{" "}
                          {selectedInvoice.invoice?.number || "N/A"}
                        </p>
                        <p>
                          <strong>Date:</strong>{" "}
                          {selectedInvoice.invoice?.date || "N/A"}
                        </p>
                        <p>
                          <strong>Total:</strong>{" "}
                          {selectedInvoice.invoice?.total || 0}{" "}
                          {selectedInvoice.invoice?.currency || "USD"}
                        </p>
                      </div>

                      <div>
                        <h3 className="font-semibold">Vendor Information</h3>
                        <p>
                          <strong>Name:</strong>{" "}
                          {selectedInvoice.vendor?.name || "N/A"}
                        </p>
                        {selectedInvoice.vendor?.address && (
                          <p>
                            <strong>Address:</strong>{" "}
                            {selectedInvoice.vendor.address}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEditInvoice(selectedInvoice)}
                        >
                          Edit Invoice
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {(currentView === "create" || currentView === "edit") && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel - PDF Viewer */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>PDF Document</CardTitle>
                </CardHeader>
                <CardContent>
                  {pdfUrl ? (
                    <PDFViewer fileUrl={pdfUrl} className="h-[600px]" />
                  ) : (
                    <div className="flex items-center justify-center h-[600px] bg-gray-100 rounded">
                      <p className="text-gray-500">No PDF uploaded</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Panel - Invoice Form */}
            <div className="space-y-6">
              <InvoiceForm
                initialData={
                  extractedData ||
                  (selectedInvoice
                    ? {
                        fileId: selectedInvoice.fileId || "",
                        fileName: selectedInvoice.fileName || "",
                        vendor: selectedInvoice.vendor,
                        invoice: selectedInvoice.invoice,
                      }
                    : {
                        fileId: uploadedFileId,
                        fileName: uploadedFileName,
                      })
                }
                onSubmit={handleSubmit}
                onExtract={
                  uploadedFileId || selectedInvoice?.fileId
                    ? handleExtract
                    : undefined
                }
                isLoading={saving}
                isExtracting={extracting}
              />
            </div>
          </div>
        )}
      </div>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload PDF Invoice</DialogTitle>
            <DialogDescription>
              Select a PDF file to upload and extract invoice data.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="pdf-upload">PDF File (Max 25MB)</Label>
              <Input
                id="pdf-upload"
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileSelect}
                disabled={uploading}
              />
            </div>

            {pdfFile && (
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-red-600" />
                    <div>
                      <p className="font-medium">{pdfFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setUploadDialogOpen(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!pdfFile || uploading}>
              {uploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Upload
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
