import { useState, useMemo } from "react";
import type { URLInfo } from "../types";
import ResultsTable from "./ResultsTable";

type Props = {
  urls: URLInfo[];
  onStart: (id: string) => void;
  onStop: (id: string) => void;
  onDelete: (id: string) => void;
};

type SortKey = keyof URLInfo | null;

export default function PaginatedTableWrapper({
  urls,
  onStart,
  onStop,
  onDelete,
}: Props) {
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const handleRowsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, parseInt(e.target.value) || 1);
    setRowsPerPage(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const filteredUrls = useMemo(() => {
    const lower = searchTerm.toLowerCase();
    return urls.filter(
      (url) =>
        url.url?.toLowerCase().includes(lower) ||
        (url.title?.toLowerCase().includes(lower) ?? false)
    );
  }, [urls, searchTerm]);

  const sortedUrls = useMemo(() => {
    if (!sortKey) return filteredUrls;
    return [...filteredUrls].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (typeof valA === "number" && typeof valB === "number") {
        return sortDirection === "asc" ? valA - valB : valB - valA;
      }
      return sortDirection === "asc"
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [filteredUrls, sortKey, sortDirection]);

  const totalPages = Math.ceil(sortedUrls.length / rowsPerPage);

  const paginatedUrls = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedUrls.slice(start, start + rowsPerPage);
  }, [sortedUrls, currentPage, rowsPerPage]);

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-2">
        <label className="text-sm">
          Rows per page:
          <input
            type="number"
            value={rowsPerPage}
            onChange={handleRowsChange}
            className="ml-2 w-16 px-2 py-1 border rounded"
            min={1}
          />
        </label>
        <input
          type="text"
          placeholder="Search URL or Title"
          value={searchTerm}
          onChange={handleSearchChange}
          className="px-2 py-1 border rounded w-full sm:w-64 text-sm"
        />
        <div className="text-sm">
          Page {currentPage} of {totalPages || 1}
        </div>
      </div>

      <ResultsTable
        urls={paginatedUrls}
        onStart={onStart}
        onStop={onStop}
        onSort={handleSort}
        onDelete={onDelete}
        sortKey={sortKey}
        sortDirection={sortDirection}
      />

      <div className="flex items-center justify-between px-2 py-4">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-sm">
          Showing {paginatedUrls.length} of {filteredUrls.length} filtered links
        </span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
