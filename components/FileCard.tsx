"use client";

import { useState } from "react";
import axios from "axios";
import { IFile } from "@/models/File";
import { formatBytes } from "@/utils/formatBytes";
import { FileIcon } from "./FileIcon";
import { useAuth } from "@/lib/AuthContext";
import FilePreviewModal from "./FilePreviewModal";

interface Props {
  file: IFile;
  view: "grid" | "list";
  onDelete: (id: string) => void;
  onShareToggle?: (id: string, isPublic: boolean) => void;
}

export default function FileCard({ file, view, onDelete, onShareToggle }: Props) {
  const { token } = useAuth();
  const isGrid = view === "grid";
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPublic, setIsPublic] = useState(file.isPublic);
  const [previewing, setPreviewing] = useState(false);

  const handleShare = async () => {
    setSharing(true);
    try {
      const { data } = await axios.post(
        `/api/share/${file._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShareUrl(data.shareUrl);
      setIsPublic(true);
      onShareToggle?.(String(file._id), true);
    } catch {
      alert("Failed to generate share link");
    } finally {
      setSharing(false);
    }
  };

  const handleRevoke = async () => {
    setSharing(true);
    try {
      await axios.delete(`/api/share/${file._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShareUrl(null);
      setIsPublic(false);
      onShareToggle?.(String(file._id), false);
    } catch {
      alert("Failed to revoke share link");
    } finally {
      setSharing(false);
    }
  };

  const copyToClipboard = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow ${
        isGrid ? "p-4 flex flex-col gap-3" : "p-3 flex items-center gap-4"
      }`}
    >
      <div className={isGrid ? "flex justify-center" : ""}>
        <FileIcon mimeType={file.mimeType} size={isGrid ? 48 : 32} />
      </div>

      <div className={`flex-1 min-w-0 ${isGrid ? "text-center" : ""}`}>
        <p className="font-medium text-sm truncate" title={file.name}>
          {file.name}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {formatBytes(file.size)} · {new Date(file.createdAt).toLocaleDateString()}
        </p>
        {isPublic && (
          <span className="inline-block mt-1 text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
            Shared
          </span>
        )}
      </div>

      {/* Share URL copy bar */}
      {shareUrl && (
        <div className={`flex items-center gap-2 ${isGrid ? "w-full" : ""}`}>
          <input
            readOnly
            value={shareUrl}
            className="flex-1 text-xs px-2 py-1.5 rounded-lg border border-gray-200 bg-gray-50 truncate min-w-0"
          />
          <button
            onClick={copyToClipboard}
            className="text-xs px-2 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 whitespace-nowrap transition-colors"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      )}

      {/* Actions */}
      <div className={`flex gap-2 flex-wrap ${isGrid ? "justify-center" : "ml-auto"}`}>
        <button
          onClick={() => setPreviewing(true)}
          className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Preview
        </button>
        <a
          href={file.s3Url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
        >
          Open
        </a>

        {isPublic ? (
          <button
            onClick={handleRevoke}
            disabled={sharing}
            className="text-xs px-3 py-1.5 rounded-lg bg-orange-50 text-orange-500 hover:bg-orange-100 disabled:opacity-50 transition-colors"
          >
            {sharing ? "..." : "Revoke"}
          </button>
        ) : (
          <button
            onClick={handleShare}
            disabled={sharing}
            className="text-xs px-3 py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 disabled:opacity-50 transition-colors"
          >
            {sharing ? "..." : "Share"}
          </button>
        )}

        <button
          onClick={() => onDelete(String(file._id))}
          className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
        >
          Delete
        </button>
      </div>

      {previewing && (
        <FilePreviewModal file={file} onClose={() => setPreviewing(false)} />
      )}
    </div>
  );
}
