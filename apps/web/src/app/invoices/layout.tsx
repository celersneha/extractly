import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Invoices - PDF Invoice Manager",
  description: "View and manage all your invoices",
};

export default function InvoicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className="min-h-screen bg-gray-50 p-4">{children}</main>;
}
