"use client";

import { useEffect, useRef, useState } from "react";

// PDF.js CDN URLs
const PDFJS_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.min.js";
const PDFJS_WORKER_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js";

interface PDFViewerProps {
  fileUrl: string;
  className?: string;
}

export function PDFViewer({ fileUrl, className = "" }: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [pdfjsReady, setPdfjsReady] = useState(false);

  // Load PDF.js script dynamically and set ready flag
  useEffect(() => {
    if ((window as any).pdfjsLib) {
      (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
      setPdfjsReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = PDFJS_URL;
    script.async = true;
    script.onload = () => {
      (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
      setPdfjsReady(true);
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Load PDF document only when PDF.js is ready
  useEffect(() => {
    const loadPdf = async () => {
      if (!pdfjsReady || !fileUrl) return;
      const pdfjsLib = (window as any).pdfjsLib;
      try {
        const loadingTask = pdfjsLib.getDocument(fileUrl);
        const doc = await loadingTask.promise;
        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        setCurrentPage(1);
      } catch (err) {
        console.error("PDF load error:", err);
      }
    };
    loadPdf();
  }, [pdfjsReady, fileUrl]);

  // Render current page
  useEffect(() => {
    const renderPage = async () => {
      if (!pdfDoc || !canvasRef.current) return;
      try {
        const page = await pdfDoc.getPage(currentPage);
        const viewport = page.getViewport({ scale: zoom });
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport }).promise;
      } catch (err) {
        console.error("PDF render error:", err);
      }
    };
    renderPage();
  }, [pdfDoc, currentPage, zoom]);

  return (
    <div className={`bg-white ${className}`}>
      {/* PDF Content */}
      <div className="h-full overflow-auto bg-gray-50 flex justify-center">
        <div className="w-full max-w-2xl mx-auto">
          <canvas
            ref={canvasRef}
            className="w-full border shadow-sm bg-white"
            style={{ maxWidth: "100%", height: "auto", display: "block" }}
          />
        </div>
      </div>
    </div>
  );
}

export default PDFViewer;
