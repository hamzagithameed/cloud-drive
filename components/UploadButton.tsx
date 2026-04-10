"use client";

import { useRef, useState } from "react";
import axios from "axios";
import { useAuth } from "@/lib/AuthContext";

interface Props {
  folderId?: string | null;
  onUploaded: () => void;
}

export default function UploadButton({ folderId = null, onUploaded }: Props) {
  const { token } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError("");
    setUploading(true);
    setProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // 1. Get presigned URL
        const { data } = await axios.post(
          "/api/files/presign",
          { fileName: file.name, fileType: file.type, fileSize: file.size },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // 2. Upload to S3
        await axios.put(data.presignedUrl, file, {
          headers: { "Content-Type": file.type },
          onUploadProgress: (e) => {
            if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
          },
        });

        // 3. Confirm metadata
        await axios.post(
          "/api/files/confirm",
          {
            name: file.name,
            originalName: file.name,
            s3Key: data.s3Key,
            s3Url: data.s3Url,
            mimeType: file.type || "application/octet-stream",
            size: file.size,
            folderId,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      onUploaded();
    } catch (err: any) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors text-sm font-medium"
      >
        {uploading ? `Uploading ${progress}%` : "⬆ Upload Files"}
      </button>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
