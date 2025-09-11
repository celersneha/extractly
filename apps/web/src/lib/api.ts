// Re-export services for backward compatibility
export {
  UploadService,
  ApiError as UploadApiError,
} from "../services/upload.service";
export {
  InvoiceService,
  ApiError,
  type GetInvoicesParams,
} from "../services/invoice.service";

import { UploadService } from "../services/upload.service";
import { InvoiceService } from "../services/invoice.service";

// Legacy API object for backward compatibility
export const invoiceApi = {
  uploadPDF: UploadService.uploadPDF,
  extractInvoiceData: UploadService.extractInvoiceData,
  createInvoice: InvoiceService.createInvoice,
  getInvoices: InvoiceService.getInvoices,
  getInvoice: InvoiceService.getInvoice,
  updateInvoice: InvoiceService.updateInvoice,
  deleteInvoice: InvoiceService.deleteInvoice,
};
