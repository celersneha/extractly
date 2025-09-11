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
  return children;
}
