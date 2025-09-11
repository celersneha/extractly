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
    <div className="space-y-3">
      {/* Search */}
      {onSearch && !compact && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Search Invoices</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Search by vendor name or invoice number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 text-xs h-8"
              />
              <Button type="submit" size="sm" className="h-8 px-3">
                <Search className="h-3 w-3" />
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Invoices Table */}
      <Card>
        {!compact && (
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Invoices</CardTitle>
          </CardHeader>
        )}
        <CardContent className={compact ? "pt-4" : "pt-2"}>
          {loading ? (
            <div className="space-y-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 w-full bg-muted animate-pulse rounded"
                />
              ))}
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p className="text-sm">No invoices found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Invoice #</TableHead>
                  <TableHead className="text-xs">Vendor</TableHead>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Amount</TableHead>
                  {!compact && (
                    <TableHead className="text-xs">Status</TableHead>
                  )}
                  {!compact && (
                    <TableHead className="text-xs">Created</TableHead>
                  )}
                  <TableHead className="text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice._id}>
                    <TableCell className="font-medium text-xs">
                      {invoice.invoice.number}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-xs">
                          {invoice.vendor.name}
                        </div>
                        {!compact && invoice.vendor.address && (
                          <div className="text-xs text-muted-foreground">
                            {invoice.vendor.address}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      {invoice.invoice.date}
                    </TableCell>
                    <TableCell className="text-xs">
                      {invoice.invoice.currency}{" "}
                      {invoice.invoice.total.toFixed(2)}
                    </TableCell>
                    {!compact && (
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
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
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(invoice.createdAt).toLocaleDateString()}
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                        >
                          <Link href={`/invoices/${invoice._id}`}>
                            <Eye className="h-3 w-3" />
                          </Link>
                        </Button>

                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(invoice._id)}
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
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
