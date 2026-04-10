"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/lib/AuthContext";
import { formatBytes } from "@/utils/formatBytes";

interface Usage {
  used: number;
  limit: number;
  percent: number;
  count: number;
}

export default function StorageUsage() {
  const { token } = useAuth();
  const [usage, setUsage] = useState<Usage | null>(null);

  useEffect(() => {
    if (!token) return;
    axios
      .get("/api/files/usage", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setUsage(res.data))
      .catch(() => {});
  }, [token]);

  if (!usage) return null;

  const color =
    usage.percent > 90
      ? "bg-red-500"
      : usage.percent > 70
      ? "bg-yellow-400"
      : "bg-blue-500";

  return (
    <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
        <span>{formatBytes(usage.used)} used</span>
        <span>{formatBytes(usage.limit)}</span>
      </div>
      <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${usage.percent}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
        {usage.count} file{usage.count !== 1 ? "s" : ""} · {usage.percent.toFixed(1)}% used
      </p>
    </div>
  );
}
