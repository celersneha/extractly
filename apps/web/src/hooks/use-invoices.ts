import { useState, useEffect } from "react";
import {
  InvoiceService,
  type GetInvoicesParams,
} from "@/services/invoice.service";
import type { Invoice, InvoicesResponse } from "@/types/invoice.types";

interface UseInvoicesState {
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
}

export function useInvoices(params: GetInvoicesParams = {}) {
  const [state, setState] = useState<UseInvoicesState>({
    invoices: [],
    loading: true,
    error: null,
    pagination: null,
  });

  const fetchInvoices = async (newParams?: GetInvoicesParams) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const finalParams = { ...params, ...newParams };
      const response = await InvoiceService.getInvoices(finalParams);

      setState({
        invoices: response.data.invoices,
        loading: false,
        error: null,
        pagination: response.data.pagination,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch invoices",
      }));
    }
  };

  const refetch = (newParams?: GetInvoicesParams) => {
    return fetchInvoices(newParams);
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return {
    ...state,
    refetch,
  };
}
