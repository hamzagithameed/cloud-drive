"use client";

import { useEffect } from "react";
import { IFile } from "@/models/File";
import { formatBytes } from "@/utils/formatBytes";

interface Props {
  file: IFile;
  onClose: () => void;
}

export default function FilePreviewModal({ file, onClose }: Props) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const isImage = file.mimeType.startsWith("image/");
  const isVideo = file.mimeType.startsWith("video/");
  const isAudio = file.mimeType.startsWith("audio/");
  const isPdf = file.mimeType === "application/pdf";
  const isText = file.mimeType.startsWith("text/");
  const canPreview = isImage || isVideo || isAudio || isPdf || isText;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="min-w-0">
            <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">
              {file.name}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {formatBytes(file.size)} · {file.mimeType}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-4 shrink-0">
            <a
              href={file.s3Url}
              download={file.name}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors"
            >
              ⬇ Download
            </a>
            <button
              onClick={onClose}
              className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Preview area */}
        <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-gray-50 dark:bg-gray-950">
          {isImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={file.s3Url}
              alt={file.name}
              className="max-w-full max-h-[65vh] object-contain rounded-lg shadow"
            />
          )}

          {isVideo && (
            <video controls autoPlay className="max-w-full max-h-[65vh] rounded-lg shadow">
              <source src={file.s3Url} type={file.mimeType} />
              Your browser does not support video playback.
            </video>
          )}

          {isAudio && (
            <div className="flex flex-col items-center gap-4">
              <span className="text-7xl">🎵</span>
              <audio controls autoPlay className="w-72">
                <source src={file.s3Url} type={file.mimeType} />
              </audio>
            </div>
          )}

          {isPdf && (
            <iframe
              src={file.s3Url}
              title={file.name}
              className="w-full h-[65vh] rounded-lg border border-gray-200 dark:border-gray-700"
            />
          )}

          {isText && (
            <iframe
              src={file.s3Url}
              title={file.name}
              className="w-full h-[65vh] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
            />
          )}

          {!canPreview && (
            <div className="flex flex-col items-center gap-3 text-gray-400">
              <span className="text-7xl">📁</span>
              <p className="text-sm">No preview available for this file type.</p>
              <a
                href={file.s3Url}
                download={file.name}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Download to view
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
