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
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
