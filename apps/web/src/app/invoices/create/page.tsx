"use client";
import { Suspense } from "react";
import { InvoiceCreateView } from "@/components/invoices/invoice-create-view";

export default function CreateInvoicePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InvoiceCreateView />
    </Suspense>
  );
}
