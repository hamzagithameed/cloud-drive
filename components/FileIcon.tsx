"use client";

interface Props {
  mimeType: string;
  size?: number;
}

export function FileIcon({ mimeType, size = 32 }: Props) {
  const s = size;

  if (mimeType.startsWith("image/"))
    return <span style={{ fontSize: s * 0.7 }}>🖼️</span>;
  if (mimeType === "application/pdf")
    return <span style={{ fontSize: s * 0.7 }}>📄</span>;
  if (mimeType.startsWith("video/"))
    return <span style={{ fontSize: s * 0.7 }}>🎬</span>;
  if (mimeType.startsWith("audio/"))
    return <span style={{ fontSize: s * 0.7 }}>🎵</span>;
  if (mimeType.includes("zip") || mimeType.includes("compressed"))
    return <span style={{ fontSize: s * 0.7 }}>🗜️</span>;
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel"))
    return <span style={{ fontSize: s * 0.7 }}>📊</span>;
  if (mimeType.includes("word") || mimeType.includes("document"))
    return <span style={{ fontSize: s * 0.7 }}>📝</span>;

  return <span style={{ fontSize: s * 0.7 }}>📁</span>;
}
