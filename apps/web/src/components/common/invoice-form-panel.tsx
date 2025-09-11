"use client";

import React, { useState, useCallback } from "react";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Save,
  X,
  User,
  MessageCircle,
  FileText,
  Download,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Invoice, LineItem } from "@/types/invoice.types";
import { ToggleSlider } from "react-toggle-slider";

interface CollapsibleSectionProps {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  accentColor?: string;
}

function CollapsibleSection({
  title,
  children,
  defaultExpanded = true,
  accentColor = "bg-blue-500",
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50 focus:outline-none"
      >
        <div className="flex items-center space-x-2">
          <div className={`w-1 h-3 ${accentColor} rounded`} />
          <span className="text-sm font-medium text-gray-900">{title}</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-3 h-3 text-gray-400" />
        ) : (
          <ChevronDown className="w-3 h-3 text-gray-400" />
        )}
      </button>
      {isExpanded && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}

function DisplayField({
  label,
  value,
  isEditMode = false,
  onChange,
  type = "text",
  validation,
  error,
}: {
  label: string;
  value: any;
  isEditMode?: boolean;
  onChange?: (value: string) => void;
  type?: "text" | "number" | "date" | "email";
  validation?: (value: string) => string | null;
  error?: string | null;
}) {
  const [localError, setLocalError] = useState<string | null>(null);

  const handleChange = (newValue: string) => {
    // Clear local error when user starts typing
    setLocalError(null);

    // Apply validation if provided
    if (validation) {
      const validationError = validation(newValue);
      setLocalError(validationError);
    }

    onChange?.(newValue);
  };

  const displayError = error || localError;

  return (
    <div>
      <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </Label>
      {isEditMode ? (
        <div>
          <Input
            type={type}
            defaultValue={value || ""}
            onChange={(e) => handleChange(e.target.value)}
            className={`mt-1 w-full text-xs h-7 ${
              displayError ? "border-red-500 focus:ring-red-500" : ""
            }`}
          />
          {displayError && (
            <p className="mt-1 text-xs text-red-600">{displayError}</p>
          )}
        </div>
      ) : (
        <div className="mt-1 text-xs text-gray-900">
          {value || "Not provided"}
        </div>
      )}
    </div>
  );
}

interface InvoiceFormPanelProps {
  invoiceData: Invoice;
  isEditMode?: boolean;
  showLineItemsTable?: boolean;
  setShowLineItemsTable?: (show: boolean) => void;
  onInvoiceUpdate?: (updatedData: Partial<Invoice>) => void;
}

export function InvoiceFormPanel({
  invoiceData,
  isEditMode = false,
  showLineItemsTable = false,
  setShowLineItemsTable,
  onInvoiceUpdate,
}: InvoiceFormPanelProps) {
  // Get line items from either location in the API response
  const [lineItems, setLineItems] = useState<LineItem[]>(
    invoiceData.invoice.lineItems || invoiceData.items || []
  );
  const [localInvoiceData, setLocalInvoiceData] = useState(invoiceData);

  // Validation functions
  const validateEmail = (email: string): string | null => {
    if (!email) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? null : "Please enter a valid email address";
  };

  const validateTaxPercent = (value: string): string | null => {
    if (!value) return null;
    const num = parseFloat(value);
    if (isNaN(num)) return "Please enter a valid number";
    if (num < 0 || num > 100) return "Tax percentage must be between 0 and 100";
    return null;
  };

  const validateCurrency = (value: string): string | null => {
    if (!value) return null;
    const num = parseFloat(value);
    if (isNaN(num)) return "Please enter a valid amount";
    if (num < 0) return "Amount cannot be negative";
    return null;
  };

  const validateRequired = (value: string): string | null => {
    return !value ? "This field is required" : null;
  };

  // Handle field updates
  const handleFieldUpdate = useCallback(
    (field: string, value: string, section: "vendor" | "invoice") => {
      const updatedData = { ...localInvoiceData };
      if (section === "vendor") {
        (updatedData.vendor as any)[field] = value;
      } else if (section === "invoice") {
        if (field === "taxPercent") {
          (updatedData.invoice as any)[field] = parseFloat(value) || 0;
          // Recalculate total if subtotal exists
          if (updatedData.invoice.subtotal) {
            const taxAmount =
              (updatedData.invoice.subtotal * parseFloat(value)) / 100;
            updatedData.invoice.total =
              updatedData.invoice.subtotal + taxAmount;
          }
        } else {
          (updatedData.invoice as any)[field] = value;
        }
      }
      setLocalInvoiceData(updatedData);
      onInvoiceUpdate?.(updatedData);
    },
    [localInvoiceData, onInvoiceUpdate]
  );

  // Handle line item updates
  const handleLineItemUpdate = useCallback(
    (index: number, field: keyof LineItem, value: string) => {
      const updatedItems = [...lineItems];
      const item = { ...updatedItems[index] };

      if (field === "quantity" || field === "unitPrice") {
        const numValue = parseFloat(value) || 0;
        (item as any)[field] = numValue;
        // Recalculate total
        item.total = (item.quantity || 0) * (item.unitPrice || 0);
      } else {
        (item as any)[field] = value;
      }

      updatedItems[index] = item;
      setLineItems(updatedItems);

      // Update the invoice data with new line items
      const updatedData = { ...localInvoiceData };
      updatedData.invoice.lineItems = updatedItems;

      // Recalculate subtotal and total
      const subtotal = updatedItems.reduce(
        (sum, item) => sum + (item.total || 0),
        0
      );
      updatedData.invoice.subtotal = subtotal;
      const taxAmount =
        (subtotal * (updatedData.invoice.taxPercent || 0)) / 100;
      updatedData.invoice.total = subtotal + taxAmount;

      setLocalInvoiceData(updatedData);
      onInvoiceUpdate?.(updatedData);
    },
    [lineItems, localInvoiceData, onInvoiceUpdate]
  );

  const addLineItem = () => {
    const newItem: LineItem = {
      description: "",
      quantity: 0,
      unitPrice: 0,
      total: 0,
    };
    setLineItems([...lineItems, newItem]);
  };

  const removeLineItem = (index: number) => {
    const updatedItems = lineItems.filter((_, i) => i !== index);
    setLineItems(updatedItems);

    // Update the invoice data
    const updatedData = { ...localInvoiceData };
    updatedData.invoice.lineItems = updatedItems;

    // Recalculate subtotal and total
    const subtotal = updatedItems.reduce(
      (sum, item) => sum + (item.total || 0),
      0
    );
    updatedData.invoice.subtotal = subtotal;
    const taxAmount = (subtotal * (updatedData.invoice.taxPercent || 0)) / 100;
    updatedData.invoice.total = subtotal + taxAmount;

    setLocalInvoiceData(updatedData);
    onInvoiceUpdate?.(updatedData);
  };

  return (
    <div className="h-full">
      {/* Vendor Information - Direct from API */}
      <CollapsibleSection
        title={
          <span className="flex items-center gap-2">
            <User className="w-4 h-4 text-orange-500" />
            Vendor Information
          </span>
        }
        accentColor="bg-orange-500"
      >
        <div className="space-y-2">
          <DisplayField
            label="Vendor Name"
            value={localInvoiceData.vendor.name}
            isEditMode={isEditMode}
            validation={validateRequired}
            onChange={(value) => handleFieldUpdate("name", value, "vendor")}
          />
          <DisplayField
            label="Vendor Address"
            value={localInvoiceData.vendor.address}
            isEditMode={isEditMode}
            onChange={(value) => handleFieldUpdate("address", value, "vendor")}
          />
          <DisplayField
            label="Tax ID"
            value={localInvoiceData.vendor.taxId}
            isEditMode={isEditMode}
            onChange={(value) => handleFieldUpdate("taxId", value, "vendor")}
          />
        </div>
      </CollapsibleSection>

      {/* Invoice Details - Direct from API */}
      <CollapsibleSection
        title={
          <span className="flex items-center gap-2">
            <Save className="w-4 h-4 text-blue-500" />
            Invoice Details
          </span>
        }
        accentColor="bg-blue-500"
      >
        <div className="space-y-2">
          <DisplayField
            label="Invoice Number"
            value={localInvoiceData.invoice.number}
            isEditMode={isEditMode}
            validation={validateRequired}
            onChange={(value) => handleFieldUpdate("number", value, "invoice")}
          />
          <DisplayField
            label="Invoice Date"
            value={localInvoiceData.invoice.date}
            isEditMode={isEditMode}
            type="date"
            onChange={(value) => handleFieldUpdate("date", value, "invoice")}
          />
          <DisplayField
            label="Currency"
            value={localInvoiceData.invoice.currency}
            isEditMode={isEditMode}
            onChange={(value) =>
              handleFieldUpdate("currency", value, "invoice")
            }
          />
          <DisplayField
            label="PO Number"
            value={localInvoiceData.invoice.poNumber}
            isEditMode={isEditMode}
            onChange={(value) =>
              handleFieldUpdate("poNumber", value, "invoice")
            }
          />
          <DisplayField
            label="PO Date"
            value={localInvoiceData.invoice.poDate}
            isEditMode={isEditMode}
            type="date"
            onChange={(value) => handleFieldUpdate("poDate", value, "invoice")}
          />
        </div>
      </CollapsibleSection>

      {/* Financial Summary - Direct from API */}
      <CollapsibleSection
        title={
          <span className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-purple-500" />
            Financial Summary
          </span>
        }
        accentColor="bg-purple-500"
      >
        <div className="space-y-2">
          <DisplayField
            label="Subtotal"
            value={
              localInvoiceData.invoice.subtotal
                ? `${
                    localInvoiceData.invoice.currency || ""
                  } ${localInvoiceData.invoice.subtotal.toFixed(2)}`
                : null
            }
            isEditMode={isEditMode}
            type="number"
            validation={validateCurrency}
            onChange={(value) => {
              const numValue = parseFloat(value) || 0;
              const updatedData = { ...localInvoiceData };
              updatedData.invoice.subtotal = numValue;
              const taxAmount =
                (numValue * (updatedData.invoice.taxPercent || 0)) / 100;
              updatedData.invoice.total = numValue + taxAmount;
              setLocalInvoiceData(updatedData);
              onInvoiceUpdate?.(updatedData);
            }}
          />
          <DisplayField
            label="Tax Percentage"
            value={localInvoiceData.invoice.taxPercent?.toString()}
            isEditMode={isEditMode}
            type="number"
            validation={validateTaxPercent}
            onChange={(value) =>
              handleFieldUpdate("taxPercent", value, "invoice")
            }
          />
          <DisplayField
            label="Total Amount"
            value={`${
              localInvoiceData.invoice.currency || ""
            } ${localInvoiceData.invoice.total.toFixed(2)}`}
            isEditMode={false} // Total is always calculated
          />
        </div>
      </CollapsibleSection>

      {/* Line Items with Toggle - Direct from API */}
      <CollapsibleSection
        title={
          <span className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-green-500" />
            Line Items
          </span>
        }
        accentColor="bg-green-500"
      >
        <div className="space-y-2">
          {lineItems.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-600">
                  Total Items: {lineItems.length}
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="table-toggle" className="text-xs font-medium">
                    Table View
                  </Label>
                  <ToggleSlider
                    active={showLineItemsTable}
                    onToggle={setShowLineItemsTable}
                    barBackgroundColor="#2563eb"
                    barBorderRadius={16}
                    barWidth={40}
                    barHeight={20}
                    handleBackgroundColor="#fff"
                    handleBorderRadius={16}
                    handleSize={18}
                  />
                </div>
              </div>

              {isEditMode && (
                <div className="space-y-2">
                  {lineItems.map((item, index) => (
                    <div key={index} className="border rounded p-2 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-700">
                          Item #{index + 1}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLineItem(index)}
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        <div>
                          <Label className="text-xs text-gray-500">
                            Description
                          </Label>
                          <Input
                            value={item.description}
                            onChange={(e) =>
                              handleLineItemUpdate(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                            placeholder="Item description"
                            className="mt-1 text-xs h-7"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label className="text-xs text-gray-500">Qty</Label>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                handleLineItemUpdate(
                                  index,
                                  "quantity",
                                  e.target.value
                                )
                              }
                              className="mt-1 text-xs h-7"
                              min="0"
                              step="1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">
                              Unit Price
                            </Label>
                            <Input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) =>
                                handleLineItemUpdate(
                                  index,
                                  "unitPrice",
                                  e.target.value
                                )
                              }
                              className="mt-1 text-xs h-7"
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">
                              Total
                            </Label>
                            <Input
                              type="number"
                              value={item.total?.toFixed(2)}
                              readOnly
                              className="mt-1 text-xs h-7 bg-gray-100"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addLineItem}
                    className="w-full h-7 text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Line Item
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-gray-500">No line items available</div>
          )}
        </div>
      </CollapsibleSection>

      {/* File Information - Direct from API */}
      <CollapsibleSection
        title={
          <span className="flex items-center gap-2">
            <Download className="w-4 h-4 text-gray-500" />
            File Information
          </span>
        }
        accentColor="bg-gray-500"
      >
        <div className="space-y-4">
          <DisplayField label="File ID" value={localInvoiceData.fileId} />
          <DisplayField label="File Name" value={localInvoiceData.fileName} />
          <DisplayField
            label="Created At"
            value={new Date(localInvoiceData.createdAt).toLocaleString()}
          />
          <DisplayField
            label="Updated At"
            value={new Date(localInvoiceData.updatedAt).toLocaleString()}
          />
        </div>
      </CollapsibleSection>
    </div>
  );
}

export function LineItemsTable({
  invoiceData,
  show = false,
}: {
  invoiceData: Invoice;
  show?: boolean;
}) {
  const lineItems = invoiceData.invoice.lineItems || invoiceData.items || [];

  if (!show) return null;

  return (
    <div className="w-full bg-white/95 backdrop-blur-sm border-t border-gray-300 shadow-lg pt-4 pb-8 px-4">
      {/* Summary Row */}
      <div className="flex gap-4 mb-2 justify-end">
        <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded">
          <span className="font-semibold text-gray-700">Subtotal</span>
          <span className="text-red-600">
            {invoiceData.invoice.currency || ""}{" "}
            {invoiceData.invoice.subtotal?.toFixed(2) || "-"}
          </span>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded">
          <span className="font-semibold text-gray-700">Tax</span>
          <span className="text-red-600">
            {invoiceData.invoice.taxPercent
              ? `${invoiceData.invoice.taxPercent}%`
              : "-"}
          </span>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded">
          <span className="font-semibold text-gray-700">Total</span>
          <span className="text-red-600">
            {invoiceData.invoice.currency || ""}{" "}
            {invoiceData.invoice.total?.toFixed(2) || "-"}
          </span>
        </div>
      </div>
      <div className="border rounded-md overflow-x-auto bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">#</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-center">Qty</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lineItems.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="text-center">{index + 1}</TableCell>
                <TableCell className="font-medium">
                  {item.description}
                </TableCell>
                <TableCell className="text-center">{item.quantity}</TableCell>
                <TableCell className="text-right">
                  {invoiceData.invoice.currency || ""}{" "}
                  {item.unitPrice?.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  {invoiceData.invoice.currency || ""} {item.total?.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
