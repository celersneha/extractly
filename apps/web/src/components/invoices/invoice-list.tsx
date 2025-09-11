"use client";
import React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Edit, Trash2, Search } from "lucide-react";
import Link from "next/link";
import type { Invoice } from "@/types/invoice.types";

interface InvoiceListProps {
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
  showPagination?: boolean;
  compact?: boolean;
  onSearch?: (query: string) => void;
  onDelete?: (id: string) => void;
}

export function InvoiceList({
  invoices,
  loading,
  error,
  showPagination = true,
  compact = false,
  onSearch,
  onDelete,
}: InvoiceListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const constructFileUrl = (fileId: string): string => {
    if (!fileId) return "";
    return `https://rwiuavssfulb8mj3.public.blob.vercel-storage.com/invoices/${fileId}`;
  };

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <p>Error loading invoices: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      {onSearch && !compact && (
        <Card>
          <CardHeader>
            <CardTitle>Search Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Search by vendor name or invoice number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="sm">
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Invoices Table */}
      <Card>
        {!compact && (
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
          </CardHeader>
        )}
        <CardContent className={compact ? "pt-6" : ""}>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 w-full bg-muted animate-pulse rounded"
                />
              ))}
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No invoices found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  {!compact && <TableHead>Status</TableHead>}
                  {!compact && <TableHead>Created</TableHead>}
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice._id}>
                    <TableCell className="font-medium">
                      {invoice.invoice.number}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{invoice.vendor.name}</div>
                        {!compact && invoice.vendor.address && (
                          <div className="text-sm text-muted-foreground">
                            {invoice.vendor.address}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{invoice.invoice.date}</TableCell>
                    <TableCell>
                      {invoice.invoice.currency}{" "}
                      {invoice.invoice.total.toFixed(2)}
                    </TableCell>
                    {!compact && (
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            invoice.invoice.poNumber
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {invoice.invoice.poNumber ? "Processed" : "Pending"}
                        </span>
                      </TableCell>
                    )}
                    {!compact && (
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(invoice.createdAt).toLocaleDateString()}
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex gap-1">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/invoices/${invoice._id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/invoices/${invoice._id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(invoice._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
