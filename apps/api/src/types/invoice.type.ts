import { Document } from "mongoose";

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

export interface InvoiceDoc extends Document {
  fileId: string;
  fileName: string;
  vendor: Vendor;
  invoice: {
    number: string;
    date: string;
    currency?: string;
    subtotal?: number;
    taxPercent?: number;
    total?: number;
    poNumber?: string;
    poDate?: string;
    lineItems: LineItem[];
  };
  createdAt: Date;
  updatedAt?: Date;
}
