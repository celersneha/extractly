import { Router } from "express";
import multer, { FileFilterCallback } from "multer";
import type { Request } from "express";
import {
  uploadPDF,
  extractInvoiceData,
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
} from "../controllers/invoice.controller.js";

const router = Router();

// Configure multer for file uploads
const upload = multer({
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB
  },
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

// File upload route
router.post("/upload", upload.single("pdf"), uploadPDF);

// AI extraction route
router.post("/extract", extractInvoiceData);

// CRUD routes
router.post("/invoices", createInvoice);
router.get("/invoices", getAllInvoices);
router.get("/invoices/:id", getInvoiceById);
router.put("/invoices/:id", updateInvoice);
router.delete("/invoices/:id", deleteInvoice);

export default router;
