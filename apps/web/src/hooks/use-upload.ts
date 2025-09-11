import { useState, useCallback } from "react";
import { UploadService } from "@/services/upload.service";
import { toast } from "sonner";

interface UseUploadState {
  uploading: boolean;
  extracting: boolean;
  uploadedFile: {
    fileId: string;
    fileName: string;
    fileUrl: string;
  } | null;
  extractedData: any | null;
}

export function useUpload() {
  const [state, setState] = useState<UseUploadState>({
    uploading: false,
    extracting: false,
    uploadedFile: null,
    extractedData: null,
  });

  const uploadFile = useCallback(async (file: File) => {
    try {
      setState((prev) => ({ ...prev, uploading: true }));

      const response = await UploadService.uploadPDF(file);

      setState((prev) => ({
        ...prev,
        uploading: false,
        uploadedFile: {
          fileId: response.data.fileId,
          fileName: response.data.fileName,
          fileUrl: response.data.fileUrl,
        },
      }));

      toast.success("File uploaded successfully");
      return response;
    } catch (error) {
      setState((prev) => ({ ...prev, uploading: false }));
      const message = error instanceof Error ? error.message : "Upload failed";
      toast.error(message);
      throw error;
    }
  }, []);

  const extractData = useCallback(
    async (fileId: string, model: "gemini" | "groq" = "gemini") => {
      try {
        setState((prev) => ({ ...prev, extracting: true }));

        const response = await UploadService.extractInvoiceData(fileId, model);

        setState((prev) => ({
          ...prev,
          extracting: false,
          extractedData: response.data,
        }));

        toast.success("Data extracted successfully");
        return response;
      } catch (error) {
        setState((prev) => ({ ...prev, extracting: false }));
        const message =
          error instanceof Error ? error.message : "Extraction failed";
        toast.error(message);
        throw error;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({
      uploading: false,
      extracting: false,
      uploadedFile: null,
      extractedData: null,
    });
  }, []);

  return {
    ...state,
    uploadFile,
    extractData,
    reset,
  };
}
