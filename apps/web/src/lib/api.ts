import axios, { AxiosError } from "axios";
import type {
  Invoice,
  CreateInvoiceData,
  UploadResponse,
  ExtractResponse,
  InvoicesResponse,
  InvoiceResponse,
  ApiErrorResponse,
} from "@/types/invoice.types";

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
    const err = error as AxiosError<ApiErrorResponse>;
    const status = err.response?.status || 500;
    const message =
      err.response?.data?.message || err.message || "An error occurred";
    const errors = err.response?.data?.errors;
    throw new ApiError(status, message, errors);
  }
  throw error;
}

export const invoiceApi = {
  // Upload PDF file
  async uploadPDF(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("pdf", file);
    try {
      const { data } = await axios.post<UploadResponse>(
        `${API_BASE_URL}/upload`,
        formData
      );
      return data;
    } catch (error) {
      handleAxiosError(error);
    }
  },

  // Extract data using AI
  async extractInvoiceData(
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
  },

  // Create new invoice
  async createInvoice(data: CreateInvoiceData): Promise<InvoiceResponse> {
    try {
      const { data: res } = await axios.post<InvoiceResponse>(
        `${API_BASE_URL}/invoices`,
        data
      );
      return res;
    } catch (error) {
      handleAxiosError(error);
    }
  },

  // Get all invoices with search and pagination
  async getInvoices(
    params: { page?: number; limit?: number; q?: string } = {}
  ): Promise<InvoicesResponse> {
    try {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set("page", params.page.toString());
      if (params.limit) searchParams.set("limit", params.limit.toString());
      if (params.q) searchParams.set("q", params.q);
      const { data } = await axios.get<InvoicesResponse>(
        `${API_BASE_URL}/invoices?${searchParams}`
      );
      return data;
    } catch (error) {
      handleAxiosError(error);
    }
  },

  // Get invoice by ID
  async getInvoice(id: string): Promise<InvoiceResponse> {
    try {
      const { data } = await axios.get<InvoiceResponse>(
        `${API_BASE_URL}/invoices/${id}`
      );
      return data;
    } catch (error) {
      handleAxiosError(error);
    }
  },

  // Update invoice
  async updateInvoice(
    id: string,
    data: Partial<CreateInvoiceData>
  ): Promise<InvoiceResponse> {
    try {
      const { data: res } = await axios.put<InvoiceResponse>(
        `${API_BASE_URL}/invoices/${id}`,
        data
      );
      return res;
    } catch (error) {
      handleAxiosError(error);
    }
  },

  // Delete invoice
  async deleteInvoice(id: string): Promise<{
    success: boolean;
    data: { deletedId: string };
    message: string;
  }> {
    try {
      const { data } = await axios.delete<{
        success: boolean;
        data: { deletedId: string };
        message: string;
      }>(`${API_BASE_URL}/invoices/${id}`);
      return data;
    } catch (error) {
      handleAxiosError(error);
    }
  },
};

export { ApiError };
