import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { Invoice } from "../models/invoice.model";
import { pdfService } from "../services/pdf.service";
import { fetchPDFBufferFromBlob } from "../services/pdf.service";
import { extractInvoiceDataWithGemini } from "../services/ai.service";

export const uploadPDF = asyncHandler(async (req: Request, res: Response) => {
  const file = req.file;

  if (!file) {
    throw new ApiError(400, "PDF file is required");
  }

  // Validate PDF file
  pdfService.validatePDFFile(file);

  // Upload to Vercel Blob
  const uploadResult = await pdfService.uploadPDF(
    file.buffer,
    file.originalname,
    file.mimetype
  );

  res.status(201).json(
    new ApiResponse(
      201,
      {
        fileId: uploadResult.fileId,
        fileName: uploadResult.fileName,
        fileUrl: uploadResult.url,
        fileSize: uploadResult.size,
      },
      "PDF uploaded successfully"
    )
  );
});

export const extractInvoiceData = asyncHandler(async (req, res) => {
  const { fileId, fileName, model } = req.body;
  if (!fileId || !model) throw new ApiError(400, "fileId and model required");

  // Vercel Blob base URL
  const baseUrl =
    "https://rwiuavssfulb8mj3.public.blob.vercel-storage.com/invoices";
  const fileUrl = `${baseUrl}/${fileId}`;

  // Fetch PDF buffer from Blob
  const pdfBuffer = await fetchPDFBufferFromBlob(fileUrl);

  let extractedData;
  if (model === "gemini") {
    extractedData = await extractInvoiceDataWithGemini(pdfBuffer);

    // Add fileId and fileName to response
    extractedData.fileId = fileId;
    extractedData.fileName = fileName || fileId.split("/").pop();
  } else {
    throw new ApiError(400, "Only Gemini model supported");
  }

  res.json({
    success: true,
    data: extractedData,
  });
});

export const createInvoice = asyncHandler(async (req, res) => {
  const invoiceData = req.body;

  // Validate required fields
  if (!invoiceData.vendor?.name) {
    throw new ApiError(400, "Vendor name is required");
  }
  if (!invoiceData.invoice?.number) {
    throw new ApiError(400, "Invoice number is required");
  }
  if (!invoiceData.invoice?.date) {
    throw new ApiError(400, "Invoice date is required");
  }

  // Create invoice in MongoDB
  const invoice = await Invoice.create(invoiceData);

  res.status(201).json({
    success: true,
    data: invoice,
    message: "Invoice created successfully",
  });
});

export const getAllInvoices = asyncHandler(
  async (req: Request, res: Response) => {
    const { q, page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build search query
    let searchQuery: any = {};
    if (q) {
      searchQuery = {
        $or: [
          { "vendor.name": { $regex: q, $options: "i" } },
          { "invoice.number": { $regex: q, $options: "i" } },
        ],
      };
    }

    // Get invoices with pagination
    const [invoices, total] = await Promise.all([
      Invoice.find(searchQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Invoice.countDocuments(searchQuery),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    // Vercel Blob base URL
    const baseUrl =
      "https://rwiuavssfulb8mj3.public.blob.vercel-storage.com/invoices";

    // Add fileUrl to each invoice
    const invoicesWithFileUrl = invoices.map((invoice) => ({
      ...invoice,
      fileUrl:
        invoice.fileUrl ||
        invoice.pdfUrl ||
        (invoice.fileId ? `${baseUrl}/${invoice.fileId}` : null),
    }));

    res.status(200).json(
      new ApiResponse(
        200,
        {
          invoices: invoicesWithFileUrl,
          pagination: {
            currentPage: pageNum,
            totalPages,
            totalItems: total,
            hasNext: pageNum < totalPages,
            hasPrev: pageNum > 1,
          },
        },
        "Invoices retrieved successfully"
      )
    );
  }
);

export const getInvoiceById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw new ApiError(400, "Invoice ID is required");
    }

    const invoice = await Invoice.findById(id);

    if (!invoice) {
      throw new ApiError(404, "Invoice not found");
    }

    res
      .status(200)
      .json(new ApiResponse(200, invoice, "Invoice retrieved successfully"));
  }
);

export const updateInvoice = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      throw new ApiError(400, "Invoice ID is required");
    }

    // Remove fields that shouldn't be updated
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.__v;

    const invoice = await Invoice.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!invoice) {
      throw new ApiError(404, "Invoice not found");
    }

    res
      .status(200)
      .json(new ApiResponse(200, invoice, "Invoice updated successfully"));
  }
);

export const deleteInvoice = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw new ApiError(400, "Invoice ID is required");
    }

    const invoice = await Invoice.findByIdAndDelete(id);

    if (!invoice) {
      throw new ApiError(404, "Invoice not found");
    }

    // TODO: Delete associated PDF file from Vercel Blob
    // await pdfService.deletePDF(invoice.fileUrl);

    res
      .status(200)
      .json(
        new ApiResponse(200, { deletedId: id }, "Invoice deleted successfully")
      );
  }
);

export const getInvoices = asyncHandler(async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const invoices = await Invoice.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Invoice.countDocuments();

    // Vercel Blob base URL
    const baseUrl =
      "https://rwiuavssfulb8mj3.public.blob.vercel-storage.com/invoices";

    // Make sure each invoice includes the fileUrl
    const invoicesWithFileUrl = invoices.map((invoice) => {
      const invoiceObj = invoice.toObject();
      return {
        ...invoiceObj,
        fileUrl:
          invoiceObj.fileUrl ||
          invoiceObj.pdfUrl ||
          (invoiceObj.fileId ? `${baseUrl}/${invoiceObj.fileId}` : null),
      };
    });

    res.json({
      success: true,
      data: {
        invoices: invoicesWithFileUrl,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          limit,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch invoices",
    });
  }
});
