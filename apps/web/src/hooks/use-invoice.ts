import { useState, useEffect } from "react";
import { InvoiceService } from "@/services/invoice.service";
import type { Invoice } from "@/types/invoice.types";

interface UseInvoiceState {
  invoice: Invoice | null;
  loading: boolean;
  error: string | null;
}

export function useInvoice(id: string) {
  const [state, setState] = useState<UseInvoiceState>({
    invoice: null,
    loading: true,
    error: null,
  });

  const fetchInvoice = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await InvoiceService.getInvoice(id);

      setState({
        invoice: response.data,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch invoice",
      }));
    }
  };

  const refetch = () => {
    return fetchInvoice();
  };

  useEffect(() => {
    if (id) {
      fetchInvoice();
    }
  }, [id]);

  return {
    ...state,
    refetch,
  };
}
