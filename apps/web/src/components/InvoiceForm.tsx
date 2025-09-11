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
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateInvoiceData>({
    defaultValues: {
      fileId: "",
      fileName: "",
      vendor: { name: "", address: "", taxId: "" },
      invoice: {
        number: "",
        date: "",
        currency: "USD",
        subtotal: 0,
        taxPercent: 0,
        total: 0,
        poNumber: "",
        poDate: "",
        lineItems: [{ description: "", unitPrice: 0, quantity: 1, total: 0 }],
      },
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "invoice.lineItems",
  });

  // Watch all the values that affect calculations
  const watchedValues = watch();
  const lineItems = watch("invoice.lineItems") || [];
  const taxPercent = watch("invoice.taxPercent") || 0;

  // Auto-fill form when initialData changes (after extraction)
  useEffect(() => {
    if (initialData) {
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
          currency: initialData.invoice?.currency || "USD",
          subtotal: initialData.invoice?.subtotal || 0,
          taxPercent: initialData.invoice?.taxPercent || 0,
          total: initialData.invoice?.total || 0,
          poNumber: initialData.invoice?.poNumber || "",
          poDate: initialData.invoice?.poDate || "",
          lineItems:
            Array.isArray(initialData.invoice?.lineItems) &&
            initialData.invoice.lineItems.length > 0
              ? initialData.invoice.lineItems
              : [{ description: "", unitPrice: 0, quantity: 1, total: 0 }],
        },
      });
    }
  }, [initialData, reset]);

  // Calculate totals automatically - FIXED VERSION
  useEffect(() => {
    let subtotal = 0;

    // Calculate subtotal from all line items
    if (Array.isArray(lineItems)) {
      lineItems.forEach((item, index) => {
        const unitPrice = Number(item.unitPrice) || 0;
        const quantity = Number(item.quantity) || 0;
        const itemTotal = unitPrice * quantity;

        // Update individual line item total
        setValue(
          `invoice.lineItems.${index}.total`,
          Number(itemTotal.toFixed(2))
        );

        subtotal += itemTotal;
      });
    }

    // Calculate tax and total
    const taxAmount = (subtotal * (Number(taxPercent) || 0)) / 100;
    const total = subtotal + taxAmount;

    // Update form values with proper rounding
    setValue("invoice.subtotal", Number(subtotal.toFixed(2)));
    setValue("invoice.total", Number(total.toFixed(2)));

    // Force a re-render by triggering a state change
    // This ensures the UI updates immediately
  }, [lineItems, taxPercent, setValue, fields.length]); // Added fields.length to dependencies

  const addLineItem = () => {
    append({ description: "", unitPrice: 0, quantity: 1, total: 0 });
  };

  const removeLineItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  // Custom submit handler with additional validation
  const onFormSubmit = (data: CreateInvoiceData) => {
    // Additional validation
    if (!data?.invoice?.lineItems?.length) {
      return;
    }

    // Ensure all calculations are up to date
    let subtotal = 0;
    data.invoice.lineItems.forEach((item) => {
      const itemTotal = Number((item.unitPrice * item.quantity).toFixed(2));
      item.total = itemTotal;
      subtotal += itemTotal;
    });

    const taxPercent = Number(data.invoice.taxPercent) || 0;
    const taxAmount = (subtotal * taxPercent) / 100;
    const total = subtotal + taxAmount;

    data.invoice.subtotal = Number(subtotal.toFixed(2));
    data.invoice.total = Number(total.toFixed(2));

    onSubmit(data);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
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
                  minLength: {
                    value: 2,
                    message: "Vendor name must be at least 2 characters",
                  },
                })}
                placeholder="Enter vendor name"
                className={errors.vendor?.name ? "border-red-500" : ""}
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
                {...register("vendor.address", {
                  maxLength: {
                    value: 500,
                    message: "Address cannot exceed 500 characters",
                  },
                })}
                placeholder="Enter vendor address"
                rows={3}
                className={errors.vendor?.address ? "border-red-500" : ""}
              />
              {errors.vendor?.address && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.vendor.address.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="vendor.taxId">Tax ID</Label>
              <Input
                id="vendor.taxId"
                {...register("vendor.taxId", {
                  pattern: {
                    value: /^[A-Za-z0-9\-]*$/,
                    message:
                      "Tax ID can only contain letters, numbers, and hyphens",
                  },
                })}
                placeholder="Enter tax ID"
                className={errors.vendor?.taxId ? "border-red-500" : ""}
              />
              {errors.vendor?.taxId && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.vendor.taxId.message}
                </p>
              )}
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
                    minLength: {
                      value: 1,
                      message: "Invoice number cannot be empty",
                    },
                  })}
                  placeholder="Enter invoice number"
                  className={errors.invoice?.number ? "border-red-500" : ""}
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
                    validate: (value) => {
                      const selectedDate = new Date(value);
                      const today = new Date();
                      const oneYearAgo = new Date();
                      oneYearAgo.setFullYear(today.getFullYear() - 1);

                      if (selectedDate > today) {
                        return "Invoice date cannot be in the future";
                      }
                      if (selectedDate < oneYearAgo) {
                        return "Invoice date cannot be more than 1 year ago";
                      }
                      return true;
                    },
                  })}
                  className={errors.invoice?.date ? "border-red-500" : ""}
                />
                {errors.invoice?.date && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.invoice.date.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="invoice.currency">Currency *</Label>
                <Input
                  id="invoice.currency"
                  {...register("invoice.currency", {
                    required: "Currency is required",
                    pattern: {
                      value: /^[A-Z]{3}$/,
                      message:
                        "Currency must be a 3-letter code (e.g., USD, EUR)",
                    },
                  })}
                  placeholder="e.g., USD, EUR, INR"
                  className={errors.invoice?.currency ? "border-red-500" : ""}
                  maxLength={3}
                  style={{ textTransform: "uppercase" }}
                />
                {errors.invoice?.currency && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.invoice.currency.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="invoice.taxPercent">Tax Percentage</Label>
                <Input
                  id="invoice.taxPercent"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  {...register("invoice.taxPercent", {
                    valueAsNumber: true,
                    min: {
                      value: 0,
                      message: "Tax percentage cannot be negative",
                    },
                    max: {
                      value: 100,
                      message: "Tax percentage cannot exceed 100%",
                    },
                  })}
                  placeholder="0.00"
                  className={errors.invoice?.taxPercent ? "border-red-500" : ""}
                />
                {errors.invoice?.taxPercent && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.invoice.taxPercent.message}
                  </p>
                )}
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
            {fields.length === 0 && (
              <p className="text-red-600 text-sm">
                At least one line item is required
              </p>
            )}
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg"
              >
                <div className="md:col-span-2">
                  <Label htmlFor={`invoice.lineItems.${index}.description`}>
                    Description *
                  </Label>
                  <Input
                    {...register(`invoice.lineItems.${index}.description`, {
                      required: "Description is required",
                      minLength: {
                        value: 2,
                        message: "Description must be at least 2 characters",
                      },
                    })}
                    placeholder="Item description"
                    className={
                      errors.invoice?.lineItems?.[index]?.description
                        ? "border-red-500"
                        : ""
                    }
                  />
                  {errors.invoice?.lineItems?.[index]?.description && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.invoice.lineItems[index]?.description?.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`invoice.lineItems.${index}.unitPrice`}>
                    Unit Price *
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register(`invoice.lineItems.${index}.unitPrice`, {
                      required: "Unit price is required",
                      valueAsNumber: true,
                      min: {
                        value: 0.01,
                        message: "Unit price must be greater than 0",
                      },
                      max: {
                        value: 999999.99,
                        message: "Unit price cannot exceed 999,999.99",
                      },
                    })}
                    placeholder="0.00"
                    className={
                      errors.invoice?.lineItems?.[index]?.unitPrice
                        ? "border-red-500"
                        : ""
                    }
                  />
                  {errors.invoice?.lineItems?.[index]?.unitPrice && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.invoice.lineItems[index]?.unitPrice?.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`invoice.lineItems.${index}.quantity`}>
                    Quantity *
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    {...register(`invoice.lineItems.${index}.quantity`, {
                      required: "Quantity is required",
                      valueAsNumber: true,
                      min: {
                        value: 1,
                        message: "Quantity must be at least 1",
                      },
                      max: {
                        value: 99999,
                        message: "Quantity cannot exceed 99,999",
                      },
                    })}
                    placeholder="1"
                    className={
                      errors.invoice?.lineItems?.[index]?.quantity
                        ? "border-red-500"
                        : ""
                    }
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
                      type="text"
                      value={`${watchedValues.invoice?.currency || "USD"} ${(
                        (Number(lineItems[index]?.unitPrice) || 0) *
                        (Number(lineItems[index]?.quantity) || 0)
                      ).toFixed(2)}`}
                      readOnly
                      className="bg-muted font-mono"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={() => removeLineItem(index)}
                    disabled={fields.length <= 1}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
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
              {(() => {
                // Calculate totals in real-time for display
                let subtotal = 0;
                if (Array.isArray(lineItems)) {
                  lineItems.forEach((item) => {
                    const unitPrice = Number(item.unitPrice) || 0;
                    const quantity = Number(item.quantity) || 0;
                    subtotal += unitPrice * quantity;
                  });
                }
                const taxAmount = (subtotal * (Number(taxPercent) || 0)) / 100;
                const total = subtotal + taxAmount;
                const currency = watchedValues.invoice?.currency || "USD";

                return (
                  <>
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-mono">
                        {currency} {subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>
                        Tax ({(Number(taxPercent) || 0).toFixed(2)}%):
                      </span>
                      <span className="font-mono">
                        {currency} {taxAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span className="font-mono">
                        {currency} {total.toFixed(2)}
                      </span>
                    </div>
                  </>
                );
              })()}
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isLoading || fields.length === 0}
            className="min-w-[120px]"
          >
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
