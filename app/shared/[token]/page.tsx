"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { FileIcon } from "@/components/FileIcon";
import { formatBytes } from "@/utils/formatBytes";

interface SharedFile {
  _id: string;
  name: string;
  mimeType: string;
  size: number;
  s3Url: string;
  createdAt: string;
}

export default function SharedFilePage() {
  const { token } = useParams<{ token: string }>();
  const [file, setFile] = useState<SharedFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`/api/shared/${token}`)
      .then((res) => setFile(res.data.file))
      .catch((err) =>
        setError(err.response?.data?.message || "File not found or link has expired")
      )
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <span className="text-6xl">🔗</span>
          <p className="mt-4 text-lg font-medium text-gray-700">Link unavailable</p>
          <p className="text-sm text-gray-400 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const isImage = file.mimeType.startsWith("image/");
  const isVideo = file.mimeType.startsWith("video/");
  const isAudio = file.mimeType.startsWith("audio/");
  const isPdf = file.mimeType === "application/pdf";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-lg p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <FileIcon mimeType={file.mimeType} size={48} />
          <div className="min-w-0">
            <h1 className="font-semibold text-gray-800 truncate text-lg" title={file.name}>
              {file.name}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {formatBytes(file.size)} ·{" "}
              {new Date(file.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Preview */}
        {isImage && (
          <div className="mb-6 rounded-xl overflow-hidden border border-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={file.s3Url} alt={file.name} className="w-full object-contain max-h-80" />
          </div>
        )}

        {isVideo && (
          <div className="mb-6 rounded-xl overflow-hidden border border-gray-100">
            <video controls className="w-full max-h-80">
              <source src={file.s3Url} type={file.mimeType} />
            </video>
          </div>
        )}

        {isAudio && (
          <div className="mb-6">
            <audio controls className="w-full">
              <source src={file.s3Url} type={file.mimeType} />
            </audio>
          </div>
        )}

        {isPdf && (
          <div className="mb-6 rounded-xl overflow-hidden border border-gray-100">
            <iframe src={file.s3Url} className="w-full h-64" title={file.name} />
          </div>
        )}

        {/* Download button */}
        <a
          href={file.s3Url}
          download={file.name}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          ⬇ Download File
        </a>

        <p className="text-center text-xs text-gray-400 mt-4">
          Shared via ☁️ CloudDrive
        </p>
      </div>
    </div>
  );
}
