import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Extractly",
  description: "Manage your PDF invoices with AI-powered extraction",
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className="min-h-screen bg-gray-50 p-4">{children}</main>;
}
