import { useEffect, useState } from "react";
import type { URLInfo } from "../types";
import URLForm from "../components/URLForm";
import PaginatedTableWrapper from "../components/PaginatedTableWrapper";

const API_BASE = "http://localhost:8080";
const SECRET_KEY = import.meta.env.VITE_SECRET_KEY; // In a real application, this will be handled differently !!

export default function Home() {
  const [urls, setUrls] = useState<URLInfo[]>([]);

  useEffect(() => {
    const fetchURLs = async () => {
      const res = await fetch(`${API_BASE}/urls`, {
        headers: { "X-API-SECRET": SECRET_KEY },
      });
      const data = await res.json();
      data?.sort((a: URLInfo, b: URLInfo) => a.id.localeCompare(b.id)); // Making sure URLs appear in the same order every re-fetch
      setUrls(data || []);
    };
    fetchURLs(); // Initial fetch
    const interval = setInterval(fetchURLs, 2000); // Global polling every 2 seconds
    return () => clearInterval(interval);
  }, []);

  const handleAdd = async (url: string) => {
    try {
      const res = await fetch(`${API_BASE}/urls`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-SECRET": SECRET_KEY,
        },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        console.log(await res.json());
        return;
      }

      const newURL: URLInfo = await res.json();
      setUrls((prev) => [...prev, newURL]);
    } catch (error) {
      console.error("Failed to add URL:", error);
    }
  };

  const handleStart = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/urls/${id}/reanalyze`, {
        method: "POST",
        headers: { "X-API-SECRET": SECRET_KEY },
      });
      if (!res.ok) {
        console.log(await res.json());
        return;
      }

      const updatedURL: URLInfo = await res.json();
      setUrls((prev) => prev.map((u) => (u.id === id ? updatedURL : u)));
    } catch (error) {
      console.error("Failed to start reanalyze", error);
    }
  };

  const handleStop = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/urls/${id}/stop`, {
        method: "POST",
        headers: { "X-API-SECRET": SECRET_KEY },
      });
      if (!res.ok) {
        console.log(await res.json());
        return;
      }

      const updatedURL: URLInfo = await res.json();
      setUrls((prev) => prev.map((u) => (u.id === id ? updatedURL : u)));
    } catch (error) {
      console.error("Failed to stop", error);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`${API_BASE}/urls/${id}`, {
      method: "DELETE",
      headers: { "X-API-SECRET": SECRET_KEY },
    });
    if (res.ok) setUrls((prev) => prev.filter((url) => url.id !== id));
    else alert("Failed to delete URL");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-center">Website Crawler</h1>
      <URLForm onSubmit={handleAdd} />
      <PaginatedTableWrapper
        urls={urls}
        onStart={handleStart}
        onStop={handleStop}
        onDelete={handleDelete}
      />
    </div>
  );
}
