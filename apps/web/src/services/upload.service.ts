import axios, { AxiosError } from "axios";
import type { UploadResponse, ExtractResponse } from "@/types/invoice.types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors?: string[]
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function handleAxiosError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<any>;
    const status = err.response?.status || 500;
    const message =
      err.response?.data?.message || err.message || "An error occurred";
    const errors = err.response?.data?.errors;
    throw new ApiError(status, message, errors);
  }
  throw error;
}

export class UploadService {
  // Upload PDF file
  static async uploadPDF(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("pdf", file);
    try {
      const { data } = await axios.post<UploadResponse>(
        `${API_BASE_URL}/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return data;
    } catch (error) {
      handleAxiosError(error);
    }
  }

  // Extract data using AI
  static async extractInvoiceData(
    fileId: string,
    model: "gemini" | "groq" = "gemini"
  ): Promise<ExtractResponse> {
    try {
      const { data } = await axios.post<ExtractResponse>(
        `${API_BASE_URL}/extract`,
        { fileId, model }
      );
      return data;
    } catch (error) {
      handleAxiosError(error);
    }
  }
}

export { ApiError };
