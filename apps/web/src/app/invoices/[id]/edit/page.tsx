import { InvoiceEditView } from "@/components/invoices/invoice-edit-view";

export default async function EditInvoicePage({
  params,
}: {
  params: { id: string };
}) {
  const awaitedParams = await params;
  return <InvoiceEditView invoiceId={awaitedParams.id} />;
}
