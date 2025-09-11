"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpload } from "@/hooks/use-upload";
import { FileText, Upload, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  usePageBreadcrumbs,
  BREADCRUMB_CONFIGS,
} from "@/hooks/use-page-breadcrumbs";

export function InvoiceUploadView() {
  // Set breadcrumbs for upload page
  usePageBreadcrumbs(BREADCRUMB_CONFIGS.upload);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { uploading, uploadFile } = useUpload();
  const router = useRouter();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        alert("Please select a PDF file");
        return;
      }
      if (file.size > 25 * 1024 * 1024) {
        alert("File size must be less than 25MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      const response = await uploadFile(selectedFile);
      // Redirect to create invoice page with the uploaded file data
      router.push(`/invoices/create?fileId=${response.data.fileId}`);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Upload PDF Invoice
        </h1>
        <p className="text-sm text-muted-foreground">
          Upload your PDF invoice to extract data with AI
        </p>
      </div>

      {/* Upload Form */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Select PDF File</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-2">
          <div>
            <Label htmlFor="pdf-upload" className="text-xs">
              PDF File (Max 25MB)
            </Label>
            <Input
              id="pdf-upload"
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileSelect}
              disabled={uploading}
              className="mt-1 text-xs h-8"
            />
          </div>

          {selectedFile && (
            <Card>
              <CardContent className="pt-3">
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-red-600" />
                  <div>
                    <p className="font-medium text-xs">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-2">
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="min-w-[120px] h-8 text-xs"
              size="sm"
            >
              {uploading ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : (
                <Upload className="mr-1 h-3 w-3" />
              )}
              Upload & Process
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
