import React, { useState } from 'react';
import type { ApprovalDocument } from '@/types/approval';
import { Download, X, ZoomIn } from 'lucide-react';

interface DocumentViewerProps {
  documents: ApprovalDocument[];
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ documents }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const getDocumentTypeLabel = (type: ApprovalDocument['type']) => {
    switch (type) {
      case 'id_proof':
        return 'ID Proof';
      case 'certificate':
        return 'Certificate';
      case 'storefront':
        return 'Storefront';
      default:
        return type;
    }
  };

  const handleDownload = (url: string, type: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}_${Date.now()}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No documents uploaded</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((doc, index) => (
          <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-3 bg-gray-50 border-b border-gray-200">
              <h4 className="font-medium text-sm text-gray-900">
                {getDocumentTypeLabel(doc.type)}
              </h4>
              {doc.uploadedAt && (
                <p className="text-xs text-gray-500 mt-1">
                  Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="relative aspect-video bg-gray-100 group">
              <img
                src={doc.url}
                alt={getDocumentTypeLabel(doc.type)}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setSelectedImage(doc.url)}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => setSelectedImage(doc.url)}
                  className="px-3 py-1.5 bg-white rounded text-sm font-medium flex items-center gap-1 hover:bg-gray-50"
                >
                  <ZoomIn className="w-4 h-4" />
                  View
                </button>
                <button
                  onClick={() => handleDownload(doc.url, doc.type)}
                  className="px-3 py-1.5 bg-white rounded text-sm font-medium flex items-center gap-1 hover:bg-gray-50"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Full Screen Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-7xl max-h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 bg-white rounded-full hover:bg-gray-100 z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedImage}
              alt="Document preview"
              className="max-w-full max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
};

