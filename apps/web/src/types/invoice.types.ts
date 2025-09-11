export interface LineItem {
  description: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

export interface Vendor {
  name: string;
  address?: string;
  taxId?: string;
}

export interface InvoiceData {
  number: string;
  date: string;
  currency?: string;
  subtotal?: number;
  taxPercent?: number;
  total?: number;
  poNumber?: string;
  poDate?: string;
  lineItems?: LineItem[]; // Make this optional to match Invoice interface
}

// Update the Invoice interface to match InvoiceData structure
export interface Invoice {
  _id: string;
  invoice: {
    number: string;
    date: string;
    total: number;
    currency: string;
    subtotal?: number;
    taxPercent?: number;
    poNumber?: string;
    poDate?: string;
    lineItems?: LineItem[]; // Add this property
  };
  vendor: {
    name: string;
    address?: string;
    taxId?: string;
  };
  items?: Array<{
    // Make this optional since you have lineItems in invoice
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  fileUrl?: string;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
  fileId?: string;
  fileName?: string;
}

export interface CreateInvoiceData {
  fileId: string;
  fileName: string;
  vendor: Vendor;
  invoice: InvoiceData;
}

export interface UploadResponse {
  success: boolean;
  data: {
    fileId: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
  };
  message: string;
}

export interface ExtractResponse {
  success: boolean;
  data: {
    vendor: Vendor;
    invoice: InvoiceData;
  };
  message: string;
}

export interface InvoicesResponse {
  success: boolean;
  data: {
    invoices: Invoice[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  message: string;
}

export interface InvoiceResponse {
  success: boolean;
  data: Invoice;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  status: number;
  message: string;
  errors?: string[];
}
