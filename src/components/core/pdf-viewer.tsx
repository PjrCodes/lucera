"use client";

import { useState, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import "./pdf-viewer-security.css";
import { SecondaryButton } from "@/components/core/buttons/secondary";
import {
  FiZoomIn,
  FiZoomOut,
  FiMaximize2,
  FiDownload,
  FiSettings,
  FiX,
} from "react-icons/fi";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface PDFViewerProps {
  fileUrl: string;
  readOnly?: boolean;
  onDownload?: () => void;
  className?: string;
  height?: string;
  preventCopy?: boolean;
  downloadDisabled?: boolean;
}

export default function PDFViewer({
  fileUrl,
  readOnly = false,
  onDownload,
  className = "",
  height = "60vh",
  preventCopy = false,
  downloadDisabled = false,
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>();
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState(true);
  const [showControls, setShowControls] = useState(false);

  const onDocumentLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setNumPages(numPages);
      setLoading(false);
    },
    []
  );

  const zoomIn = useCallback(() => {
    setScale((prevScale) => Math.min(prevScale + 0.25, 3.0));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((prevScale) => Math.max(prevScale - 0.25, 0.5));
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1.0);
  }, []);

  const handleDownload = useCallback(() => {
    if (onDownload) {
      onDownload();
    } else {
      window.open(fileUrl, "_blank");
    }
  }, [fileUrl, onDownload]);

  const toggleControls = useCallback(() => {
    setShowControls((prev) => !prev);
  }, []);

  return (
    <div
      className={`border border-gray-300 rounded-lg overflow-hidden bg-gray-100 relative ${className}`}
      style={{ height }}
      data-pdf-viewer="true"
    >
      <Document
        file={fileUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading PDF...</p>
            </div>
          </div>
        }
        error={
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-red-600 mb-2">Failed to load PDF</p>
              {!downloadDisabled && (
                <SecondaryButton size="sm" onClick={handleDownload}>
                  Download PDF
                </SecondaryButton>
              )}
            </div>
          </div>
        }
        className="w-full h-full"
      >
        <div className="relative h-full flex flex-col">
          {/* New Grid Layout Controls */}
          <div
            className={`absolute top-4 right-4 z-20 transition-all duration-300 ease-in-out ${
              showControls
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-2 pointer-events-none"
            }`}
          >
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-3 w-48">
              <div className="grid grid-cols-3 gap-3">
                {/* Top Row: [FULLSCREEN] [DOWNLOAD] [CLOSE] */}
                <SecondaryButton
                  size="sm"
                  onClick={resetZoom}
                  disabled={loading}
                  variant="outline"
                  title="Reset Zoom (Fullscreen)"
                  className="h-10 rounded-lg hover:bg-orange-50 hover:border-orange-200 transition-colors flex items-center justify-center"
                >
                  <FiMaximize2 className="w-4 h-4" />
                </SecondaryButton>

                {!downloadDisabled && (
                  <SecondaryButton
                    size="sm"
                    onClick={handleDownload}
                    variant="outline"
                    title="Download PDF"
                    className="h-10 rounded-lg hover:bg-purple-50 hover:border-purple-200 transition-colors flex items-center justify-center"
                  >
                    <FiDownload className="w-4 h-4" />
                  </SecondaryButton>
                )}

                {downloadDisabled && (
                  <div className="h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center opacity-50">
                    <FiDownload className="w-4 h-4 text-gray-400" />
                  </div>
                )}

                <SecondaryButton
                  size="sm"
                  onClick={toggleControls}
                  variant="outline"
                  title="Close Controls"
                  className="h-10 rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors flex items-center justify-center"
                >
                  <FiX className="w-4 h-4" />
                </SecondaryButton>

                {/* Middle Row: [+] ZOOM [-] */}

                <SecondaryButton
                  size="sm"
                  onClick={zoomOut}
                  disabled={scale <= 0.5 || loading}
                  variant="outline"
                  className="h-10 w-full rounded-lg hover:bg-green-50 hover:border-green-200 transition-colors flex items-center justify-center"
                  title="Zoom Out"
                >
                  <FiZoomOut className="w-4 h-4" />
                </SecondaryButton>

                <div className="bg-gray-50 rounded-lg px-2 py-2 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600 whitespace-nowrap">
                    {Math.round(scale * 100)}%
                  </span>
                </div>
                <SecondaryButton
                  size="sm"
                  onClick={zoomIn}
                  disabled={scale >= 3.0 || loading}
                  variant="outline"
                  className="h-10 w-full rounded-lg hover:bg-green-50 hover:border-green-200 transition-colors flex items-center justify-center"
                  title="Zoom In"
                >
                  <FiZoomIn className="w-4 h-4" />
                </SecondaryButton>

                {/* Bottom Row: [PAGES] */}
                <div className="col-span-3 bg-gray-50 rounded-lg px-3 py-2 flex items-center justify-start">
                  <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                    {loading ? "..." : `${numPages || "?"} pages`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Controls Toggle Button - Always Visible */}
          <button
            onClick={toggleControls}
            className={`absolute top-4 right-4 z-10 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-md border border-gray-200 flex items-center justify-center transition-all duration-200 hover:bg-white hover:shadow-lg ${
              showControls ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
            title="Show Controls"
          >
            <FiSettings className="w-5 h-5 text-gray-600" />
          </button>

          {/* PDF Page - Scrollable Container with Security Features */}
          <div
            className="flex-1 overflow-auto p-4"
            style={{
              userSelect: readOnly || preventCopy ? "none" : "auto",
              WebkitUserSelect: readOnly || preventCopy ? "none" : "auto",
              MozUserSelect: readOnly || preventCopy ? "none" : "auto",
              // @ts-expect-error - msUserSelect is vendor-specific
              msUserSelect: readOnly || preventCopy ? "none" : "auto",
              WebkitTouchCallout: readOnly || preventCopy ? "none" : "default",
              WebkitUserDrag: readOnly || preventCopy ? "none" : "auto",
              KhtmlUserSelect: readOnly || preventCopy ? "none" : "auto",
            }}
            onContextMenu={(e: React.MouseEvent) =>
              (readOnly || preventCopy) && e.preventDefault()
            }
            onDragStart={(e: React.DragEvent) =>
              (readOnly || preventCopy) && e.preventDefault()
            }
          >
            <div className="flex items-start justify-center min-h-full">
              {!loading && numPages && (
                <div className="space-y-4">
                  {Array.from(new Array(numPages), (el, index) => (
                    <div
                      key={`page_${index + 1}`}
                      style={{
                        // Additional copy protection
                        pointerEvents:
                          readOnly || preventCopy ? "none" : "auto",
                      }}
                      onCopy={(e: React.ClipboardEvent) =>
                        (readOnly || preventCopy) && e.preventDefault()
                      }
                      onCut={(e: React.ClipboardEvent) =>
                        (readOnly || preventCopy) && e.preventDefault()
                      }
                    >
                      <Page
                        pageNumber={index + 1}
                        renderTextLayer={!readOnly && !preventCopy}
                        renderAnnotationLayer={!readOnly}
                        className="shadow-lg select-none mb-4"
                        scale={scale}
                        loading={
                          <div className="flex items-center justify-center p-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                          </div>
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Document>
    </div>
  );
}
