import { GoogleGenerativeAI } from "@google/generative-ai";
import pdfParse from "pdf-parse";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function extractInvoiceDataWithGemini(
  pdfBuffer: Buffer
): Promise<any> {
  const pdfText = await pdfParse(pdfBuffer);

  const prompt = `
    Extract structured invoice data from this invoice text and return ONLY valid JSON in this exact format:
    {
      "vendor": {
        "name": "vendor name",
        "address": "full address",
        "taxId": "tax id or null"
      },
      "invoice": {
        "number": "invoice number",
        "date": "YYYY-MM-DD format",
        "currency": "ISO 4217 currency code (e.g. INR, USD, EUR, etc)",
        "subtotal": 0,
        "taxPercent": 0,
        "total": 0,
        "poNumber": "po number or null",
        "poDate": "YYYY-MM-DD format or null",
        "lineItems": [
          {
            "description": "item description",
            "unitPrice": 0,
            "quantity": 1,
            "total": 0
          }
        ]
      }
    }
    
    Invoice text:
    ${pdfText.text}
    
    Return only the JSON, no explanation.
  `;

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  // Extract JSON block from Gemini response
  const match = text.match(/```json([\s\S]*?)```|({[\s\S]*})/);
  let jsonString = "";

  if (match) {
    jsonString = match[1] ? match[1].trim() : match[0].trim();
  } else {
    jsonString = text.trim();
  }

  try {
    const extractedData = JSON.parse(jsonString);

    // Ensure lineItems array exists
    if (
      !extractedData.invoice.lineItems ||
      !Array.isArray(extractedData.invoice.lineItems)
    ) {
      extractedData.invoice.lineItems = [
        { description: "", unitPrice: 0, quantity: 1, total: 0 },
      ];
    }

    return extractedData;
  } catch (err) {
    throw new Error("AI extraction failed: Invalid JSON response\n" + text);
  }
}
