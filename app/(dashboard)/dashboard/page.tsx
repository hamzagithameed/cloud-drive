"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/lib/AuthContext";
import FileCard from "@/components/FileCard";
import FolderCard from "@/components/FolderCard";
import UploadButton from "@/components/UploadButton";
import CreateFolderModal from "@/components/CreateFolderModal";
import StorageUsage from "@/components/StorageUsage";
import DarkModeToggle from "@/components/DarkModeToggle";
import { IFile } from "@/models/File";
import { IFolder } from "@/models/Folder";

type ViewMode = "grid" | "list";

interface BreadcrumbItem {
  id: string | null;
  name: string;
}

export default function DashboardPage() {
  const { user, token, logout, loading } = useAuth();
  const router = useRouter();

  const [files, setFiles] = useState<IFile[]>([]);
  const [folders, setFolders] = useState<IFolder[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState<ViewMode>("grid");
  const [search, setSearch] = useState("");

  // Folder navigation state
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { id: null, name: "My Drive" },
  ]);

  // Modals
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [renamingFolder, setRenamingFolder] = useState<IFolder | null>(null);

  const fetchContents = useCallback(async () => {
    if (!token) return;
    setFetching(true);
    setError("");
    try {
      const [filesRes, foldersRes] = await Promise.all([
        axios.get(`/api/files?folderId=${currentFolderId ?? ""}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`/api/folders?parentId=${currentFolderId ?? ""}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setFiles(filesRes.data.files);
      setFolders(foldersRes.data.folders);
    } catch {
      setError("Failed to load contents. Please try again.");
    } finally {
      setFetching(false);
    }
  }, [token, currentFolderId]);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (token) fetchContents();
  }, [token, fetchContents]);

  // Navigate into a folder
  const openFolder = (folder: IFolder) => {
    setCurrentFolderId(String(folder._id));
    setBreadcrumbs((prev) => [...prev, { id: String(folder._id), name: folder.name }]);
    setSearch("");
  };

  // Navigate via breadcrumb
  const navigateTo = (crumb: BreadcrumbItem, index: number) => {
    setCurrentFolderId(crumb.id);
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
    setSearch("");
  };

  // Create folder
  const handleCreateFolder = async (name: string) => {
    setShowCreateFolder(false);
    try {
      await axios.post(
        "/api/folders",
        { name, parentId: currentFolderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchContents();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create folder");
    }
  };

  // Rename folder
  const handleRenameFolder = async (name: string) => {
    if (!renamingFolder) return;
    setRenamingFolder(null);
    try {
      await axios.patch(
        `/api/folders/${renamingFolder._id}`,
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchContents();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to rename folder");
    }
  };

  // Delete folder
  const handleDeleteFolder = async (id: string) => {
    if (!confirm("Delete this folder and all its contents?")) return;
    try {
      await axios.delete(`/api/folders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFolders((prev) => prev.filter((f) => String(f._id) !== id));
    } catch {
      alert("Failed to delete folder.");
    }
  };

  // Delete file
  const handleDeleteFile = async (id: string) => {
    if (!confirm("Delete this file?")) return;
    try {
      await axios.delete(`/api/files/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFiles((prev) => prev.filter((f) => String(f._id) !== id));
    } catch {
      alert("Failed to delete file.");
    }
  };

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredFolders = folders.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );
  const isEmpty = !fetching && filteredFiles.length === 0 && filteredFolders.length === 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Navbar */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">☁️</span>
          <span className="font-bold text-lg text-gray-800 dark:text-gray-100">CloudDrive</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
            Hello,{" "}
            <span className="font-medium text-gray-700 dark:text-gray-200">{user?.name}</span>
          </span>
          <DarkModeToggle />
          <button
            onClick={logout}
            className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors dark:text-gray-300"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex max-w-6xl mx-auto px-6 py-8 gap-6">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-52 shrink-0">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Storage
              </p>
            </div>
            <StorageUsage />
          </div>
        </aside>

        <main className="flex-1 min-w-0">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-4 flex-wrap">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-gray-300 dark:text-gray-600">/</span>}
              <button
                onClick={() => navigateTo(crumb, i)}
                className={`hover:text-blue-600 transition-colors ${
                  i === breadcrumbs.length - 1
                    ? "text-gray-800 dark:text-gray-100 font-medium pointer-events-none"
                    : "hover:underline"
                }`}
              >
                {crumb.name}
              </button>
            </span>
          ))}
        </nav>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            {breadcrumbs[breadcrumbs.length - 1].name}
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300 w-44"
            />
            <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <button
                onClick={() => setView("grid")}
                className={`px-3 py-2 text-sm transition-colors ${
                  view === "grid"
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >⊞</button>
              <button
                onClick={() => setView("list")}
                className={`px-3 py-2 text-sm transition-colors ${
                  view === "list"
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >☰</button>
            </div>
            <button
              onClick={() => setShowCreateFolder(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              📁 New Folder
            </button>
            <UploadButton folderId={currentFolderId} onUploaded={fetchContents} />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={fetchContents} className="underline text-xs">Retry</button>
          </div>
        )}

        {/* Loading skeleton */}
        {fetching && (
          <div
            className={`grid gap-4 ${
              view === "grid"
                ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                : "grid-cols-1"
            }`}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-200 h-32 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {isEmpty && (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <span className="text-6xl mb-4">📂</span>
            <p className="text-lg font-medium">
              {search ? "No results found" : "This folder is empty"}
            </p>
            <p className="text-sm mt-1">
              {search
                ? "Try a different keyword"
                : "Create a folder or upload files to get started"}
            </p>
          </div>
        )}

        {/* Contents */}
        {!fetching && (filteredFolders.length > 0 || filteredFiles.length > 0) && (
          <div className="space-y-6">
            {/* Folders section */}
            {filteredFolders.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Folders
                </p>
                <div
                  className={`grid gap-4 ${
                    view === "grid"
                      ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                      : "grid-cols-1"
                  }`}
                >
                  {filteredFolders.map((folder) => (
                    <FolderCard
                      key={String(folder._id)}
                      folder={folder}
                      view={view}
                      onOpen={openFolder}
                      onDelete={handleDeleteFolder}
                      onRename={setRenamingFolder}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Files section */}
            {filteredFiles.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Files
                </p>
                <div
                  className={`grid gap-4 ${
                    view === "grid"
                      ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                      : "grid-cols-1"
                  }`}
                >
                  {filteredFiles.map((file) => (
                    <FileCard
                      key={String(file._id)}
                      file={file}
                      view={view}
                      onDelete={handleDeleteFile}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Count */}
        {!fetching && (files.length > 0 || folders.length > 0) && (
          <p className="text-xs text-gray-400 mt-6 text-right">
            {filteredFolders.length} folder{filteredFolders.length !== 1 ? "s" : ""},{" "}
            {filteredFiles.length} file{filteredFiles.length !== 1 ? "s" : ""}
          </p>
        )}
        </main>
      </div>

      {/* Create folder modal */}
      {showCreateFolder && (
        <CreateFolderModal
          onConfirm={handleCreateFolder}
          onClose={() => setShowCreateFolder(false)}
        />
      )}

      {/* Rename folder modal */}
      {renamingFolder && (
        <CreateFolderModal
          title="Rename Folder"
          initialName={renamingFolder.name}
          onConfirm={handleRenameFolder}
          onClose={() => setRenamingFolder(null)}
        />
      )}
    </div>
  );
}
