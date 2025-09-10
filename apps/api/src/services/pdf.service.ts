import { put } from "@vercel/blob";
import { ApiError } from "../utils/ApiError.js";
import fetch from "node-fetch";

export interface UploadResult {
  fileId: string;
  fileName: string;
  url: string;
  size: number;
}

export class PDFService {
  private readonly MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
  private readonly ALLOWED_MIME_TYPES = ["application/pdf"];

  async uploadPDF(
    buffer: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<UploadResult> {
    try {
      // Validate file size
      if (buffer.length > this.MAX_FILE_SIZE) {
        throw new ApiError(413, "File size exceeds 25MB limit");
      }

      // Validate mime type
      if (!this.ALLOWED_MIME_TYPES.includes(mimeType)) {
        throw new ApiError(415, "Only PDF files are allowed");
      }

      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
      const uniqueFileName = `invoices/${timestamp}_${sanitizedFileName}`;

      // Upload to Vercel Blob
      const blob = await put(uniqueFileName, buffer, {
        access: "public",
        contentType: mimeType,
        token: process.env.BLOB_READ_WRITE_TOKEN, // <-- Add this line
      });

      return {
        fileId: blob.url.split("/").pop() || timestamp.toString(),
        fileName: fileName,
        url: blob.url,
        size: buffer.length,
      };
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error("PDF upload error:", error);
      throw new ApiError(
        500,
        `File upload failed: ${error.message || "Unknown error"}`
      );
    }
  }

  async deletePDF(fileUrl: string): Promise<void> {
    try {
      // Note: Vercel Blob doesn't have a direct delete method in the current API
      // You might need to use the REST API or manage deletions differently
      console.log(`TODO: Delete file from Vercel Blob: ${fileUrl}`);
    } catch (error: any) {
      console.error("PDF deletion error:", error);
      throw new ApiError(
        500,
        `File deletion failed: ${error.message || "Unknown error"}`
      );
    }
  }

  validatePDFFile(file: any): void {
    if (!file) {
      throw new ApiError(400, "No file provided");
    }

    if (!file.buffer || !file.originalname || !file.mimetype) {
      throw new ApiError(400, "Invalid file format");
    }

    if (file.size > this.MAX_FILE_SIZE) {
      throw new ApiError(413, "File size exceeds 25MB limit");
    }

    if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new ApiError(415, "Only PDF files are allowed");
    }
  }
}

export const pdfService = new PDFService();

export async function fetchPDFBufferFromBlob(fileUrl: string): Promise<Buffer> {
  console.log("Fetching PDF from Blob URL:", fileUrl);
  const response = await fetch(fileUrl);
  if (!response.ok) {
    throw new ApiError(response.status, "Blob Not Found");
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
