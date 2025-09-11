import { InvoiceDetailView } from "@/components/invoices/invoice-detail-view";

export default async function InvoicePage({
  params,
}: {
  params: { id: string };
}) {
  // Await params before using
  const awaitedParams = await params;
  return <InvoiceDetailView invoiceId={awaitedParams.id} />;
}
