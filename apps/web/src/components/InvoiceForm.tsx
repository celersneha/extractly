"use client";

import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Trash2, Plus, Save, Loader2 } from "lucide-react";
import type {
  CreateInvoiceData,
  LineItem,
  Vendor,
  InvoiceData,
} from "@/types/invoice.types";

interface InvoiceFormProps {
  initialData?: Partial<CreateInvoiceData>;
  onSubmit: (data: CreateInvoiceData) => void;
  onExtract?: () => void;
  isLoading?: boolean;
  isExtracting?: boolean;
  className?: string;
}

export function InvoiceForm({
  initialData,
  onSubmit,
  onExtract,
  isLoading = false,
  isExtracting = false,
  className = "",
}: InvoiceFormProps) {
  const defaultInvoiceData: CreateInvoiceData = {
    fileId: "",
    fileName: "",
    vendor: {
      name: "",
      address: "",
      taxId: "",
    },
    invoice: {
      number: "",
      date: "",
      currency: "",
      subtotal: 0,
      taxPercent: 0,
      total: 0,
      poNumber: "",
      poDate: "",
      lineItems: [{ description: "", unitPrice: 0, quantity: 1, total: 0 }],
    },
  };

  const [formState, setFormState] = useState<CreateInvoiceData>({
    ...defaultInvoiceData,
    ...initialData,
    vendor: {
      ...defaultInvoiceData.vendor,
      ...(initialData?.vendor || {}),
    },
    invoice: {
      ...defaultInvoiceData.invoice,
      ...(initialData?.invoice || {}),
      lineItems:
        initialData?.invoice?.lineItems ?? defaultInvoiceData.invoice.lineItems,
    },
  });

  useEffect(() => {
    if (initialData) {
      setFormState({
        ...defaultInvoiceData,
        ...initialData,
        vendor: {
          ...defaultInvoiceData.vendor,
          ...(initialData.vendor || {}),
        },
        invoice: {
          ...defaultInvoiceData.invoice,
          ...(initialData.invoice || {}),
          lineItems:
            initialData.invoice?.lineItems ??
            defaultInvoiceData.invoice.lineItems,
        },
      });
    }
  }, [initialData]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset, // Add reset function
    formState: { errors },
  } = useForm<CreateInvoiceData>({
    defaultValues: {
      fileId: "",
      fileName: "",
      vendor: { name: "", address: "", taxId: "" },
      invoice: {
        number: "",
        date: "",
        currency: "",
        subtotal: 0,
        taxPercent: 0,
        total: 0,
        poNumber: "",
        poDate: "",
        lineItems: [{ description: "", unitPrice: 0, quantity: 1, total: 0 }],
      },
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "invoice.lineItems",
  });

  // Auto-fill form when initialData changes (after extraction)
  useEffect(() => {
    if (initialData) {
      // Reset entire form with new data
      reset({
        fileId: initialData.fileId || "",
        fileName: initialData.fileName || "",
        vendor: {
          name: initialData.vendor?.name || "",
          address: initialData.vendor?.address || "",
          taxId: initialData.vendor?.taxId || "",
        },
        invoice: {
          number: initialData.invoice?.number || "",
          date: initialData.invoice?.date || "",
          currency: initialData.invoice?.currency || "",
          subtotal: initialData.invoice?.subtotal || 0,
          taxPercent: initialData.invoice?.taxPercent || 0,
          total: initialData.invoice?.total || 0,
          poNumber: initialData.invoice?.poNumber || "",
          poDate: initialData.invoice?.poDate || "",
          lineItems: initialData.invoice?.lineItems || [
            { description: "", unitPrice: 0, quantity: 1, total: 0 },
          ],
        },
      });
    }
  }, [initialData, reset]);

  const lineItems = watch("invoice.lineItems");

  // Calculate totals automatically
  React.useEffect(() => {
    if (lineItems) {
      const subtotal = lineItems.reduce((sum, item) => {
        const itemTotal = item.unitPrice * item.quantity;
        // Update individual line item total
        const index = lineItems.indexOf(item);
        if (itemTotal !== item.total) {
          setValue(`invoice.lineItems.${index}.total`, itemTotal);
        }
        return sum + itemTotal;
      }, 0);

      const taxPercent = watch("invoice.taxPercent") || 0;
      const total = subtotal + (subtotal * taxPercent) / 100;

      setValue("invoice.subtotal", subtotal);
      setValue("invoice.total", total);
    }
  }, [lineItems, watch("invoice.taxPercent"), setValue]);

  const addLineItem = () => {
    append({ description: "", unitPrice: 0, quantity: 1, total: 0 });
  };

  const removeLineItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Header with Extract Button */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Invoice Details</CardTitle>
            {onExtract && (
              <Button
                type="button"
                onClick={onExtract}
                disabled={isExtracting || !initialData?.fileId}
                variant="outline"
              >
                {isExtracting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Extract with AI"
                )}
              </Button>
            )}
          </CardHeader>
        </Card>

        {/* Vendor Information */}
        <Card>
          <CardHeader>
            <CardTitle>Vendor Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="vendor.name">Vendor Name *</Label>
              <Input
                id="vendor.name"
                {...register("vendor.name", {
                  required: "Vendor name is required",
                })}
                placeholder="Enter vendor name"
              />
              {errors.vendor?.name && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.vendor.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="vendor.address">Address</Label>
              <Textarea
                id="vendor.address"
                {...register("vendor.address")}
                placeholder="Enter vendor address"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="vendor.taxId">Tax ID</Label>
              <Input
                id="vendor.taxId"
                {...register("vendor.taxId")}
                placeholder="Enter tax ID"
              />
            </div>
          </CardContent>
        </Card>

        {/* Invoice Information */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoice.number">Invoice Number *</Label>
                <Input
                  id="invoice.number"
                  {...register("invoice.number", {
                    required: "Invoice number is required",
                  })}
                  placeholder="Enter invoice number"
                />
                {errors.invoice?.number && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.invoice.number.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="invoice.date">Invoice Date *</Label>
                <Input
                  id="invoice.date"
                  type="date"
                  {...register("invoice.date", {
                    required: "Invoice date is required",
                  })}
                />
                {errors.invoice?.date && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.invoice.date.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="invoice.currency">Currency</Label>
                <Input
                  id="invoice.currency"
                  {...register("invoice.currency")}
                  placeholder="e.g., USD, EUR"
                />
              </div>

              <div>
                <Label htmlFor="invoice.taxPercent">Tax Percentage</Label>
                <Input
                  id="invoice.taxPercent"
                  type="number"
                  step="0.01"
                  {...register("invoice.taxPercent", { valueAsNumber: true })}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="invoice.poNumber">PO Number</Label>
                <Input
                  id="invoice.poNumber"
                  {...register("invoice.poNumber")}
                  placeholder="Enter PO number"
                />
              </div>

              <div>
                <Label htmlFor="invoice.poDate">PO Date</Label>
                <Input
                  id="invoice.poDate"
                  type="date"
                  {...register("invoice.poDate")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Line Items</CardTitle>
            <Button
              type="button"
              onClick={addLineItem}
              variant="outline"
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg"
              >
                <div className="md:col-span-2">
                  <Label htmlFor={`invoice.lineItems.${index}.description`}>
                    Description
                  </Label>
                  <Input
                    {...register(`invoice.lineItems.${index}.description`, {
                      required: "Description is required",
                    })}
                    placeholder="Item description"
                  />
                  {errors.invoice?.lineItems?.[index]?.description && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.invoice.lineItems[index]?.description?.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`invoice.lineItems.${index}.unitPrice`}>
                    Unit Price
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register(`invoice.lineItems.${index}.unitPrice`, {
                      required: "Unit price is required",
                      valueAsNumber: true,
                      min: { value: 0, message: "Price must be positive" },
                    })}
                    placeholder="0.00"
                  />
                  {errors.invoice?.lineItems?.[index]?.unitPrice && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.invoice.lineItems[index]?.unitPrice?.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`invoice.lineItems.${index}.quantity`}>
                    Quantity
                  </Label>
                  <Input
                    type="number"
                    {...register(`invoice.lineItems.${index}.quantity`, {
                      required: "Quantity is required",
                      valueAsNumber: true,
                      min: { value: 1, message: "Quantity must be at least 1" },
                    })}
                    placeholder="1"
                  />
                  {errors.invoice?.lineItems?.[index]?.quantity && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.invoice.lineItems[index]?.quantity?.message}
                    </p>
                  )}
                </div>

                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Label htmlFor={`invoice.lineItems.${index}.total`}>
                      Total
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register(`invoice.lineItems.${index}.total`, {
                        valueAsNumber: true,
                      })}
                      placeholder="0.00"
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={() => removeLineItem(index)}
                    disabled={fields.length <= 1}
                    variant="outline"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Totals */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2 max-w-sm ml-auto">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${watch("invoice.subtotal")?.toFixed(2) || "0.00"}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax ({watch("invoice.taxPercent") || 0}%):</span>
                <span>
                  $
                  {(
                    ((watch("invoice.subtotal") || 0) *
                      (watch("invoice.taxPercent") || 0)) /
                    100
                  ).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>${watch("invoice.total")?.toFixed(2) || "0.00"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Invoice
          </Button>
        </div>
      </form>
    </div>
  );
}

export default InvoiceForm;
