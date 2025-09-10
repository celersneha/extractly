import mongoose, { Schema } from "mongoose";
import type { LineItem, InvoiceDoc } from "../types/invoice.type";

const lineItemSchema = new Schema<LineItem>({
  description: { type: String, required: true },
  unitPrice: { type: Number, required: true },
  quantity: { type: Number, required: true },
  total: { type: Number, required: true },
});

const invoiceSchema = new Schema<InvoiceDoc>(
  {
    fileId: { type: String, required: true },
    fileName: { type: String, required: true },
    vendor: {
      name: { type: String, required: true },
      address: String,
      taxId: String,
    },
    invoice: {
      number: { type: String, required: true },
      date: { type: String, required: true },
      currency: String,
      subtotal: Number,
      taxPercent: Number,
      total: Number,
      poNumber: String,
      poDate: String,
      lineItems: [lineItemSchema],
    },
  },
  { timestamps: true }
);

export const Invoice =
  mongoose.models.Invoice ||
  mongoose.model<InvoiceDoc>("Invoice", invoiceSchema);
