"use client";

import { IFolder } from "@/models/Folder";

interface Props {
  folder: IFolder;
  view: "grid" | "list";
  onOpen: (folder: IFolder) => void;
  onDelete: (id: string) => void;
  onRename: (folder: IFolder) => void;
}

export default function FolderCard({ folder, view, onOpen, onDelete, onRename }: Props) {
  const isGrid = view === "grid";

  return (
    <div
      className={`bg-yellow-50 border border-yellow-200 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
        isGrid ? "p-4 flex flex-col gap-3" : "p-3 flex items-center gap-4"
      }`}
      onDoubleClick={() => onOpen(folder)}
    >
      <div className={isGrid ? "flex justify-center" : ""}>
        <span style={{ fontSize: isGrid ? 36 : 24 }}>📁</span>
      </div>

      <div className={`flex-1 min-w-0 ${isGrid ? "text-center" : ""}`}>
        <p className="font-medium text-sm truncate text-gray-800" title={folder.name}>
          {folder.name}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">Folder · double-click to open</p>
      </div>

      <div
        className={`flex gap-2 ${isGrid ? "justify-center" : "ml-auto"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onOpen(folder)}
          className="text-xs px-3 py-1.5 rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors"
        >
          Open
        </button>
        <button
          onClick={() => onRename(folder)}
          className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
        >
          Rename
        </button>
        <button
          onClick={() => onDelete(String(folder._id))}
          className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
