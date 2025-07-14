import type { URLInfo } from "../types"
import { useNavigate } from "react-router"
import { useState, useMemo } from "react"

type Props = {
  urls: URLInfo[]
  onStart: (id: string) => void
  onStop: (id: string) => void
}

type SortKey = keyof URLInfo | null

export default function ResultsTable({ urls, onStart, onStop }: Props) {
  const navigate = useNavigate()

  const [sortKey, setSortKey] = useState<SortKey>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDirection("asc")
    }
    setCurrentPage(1) // reset to page 1 on sort
  }

  const sortedUrls = useMemo(() => {
    if (!sortKey) return urls

    return [...urls].sort((a, b) => {
      const valA = a[sortKey]
      const valB = b[sortKey]

      if (typeof valA === "number" && typeof valB === "number") {
        return sortDirection === "asc" ? valA - valB : valB - valA
      }

      return sortDirection === "asc"
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA))
    })
  }, [urls, sortKey, sortDirection])

  const totalPages = Math.ceil(sortedUrls.length / rowsPerPage)

  const paginatedUrls = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage
    return sortedUrls.slice(start, start + rowsPerPage)
  }, [sortedUrls, currentPage, rowsPerPage])

  const renderSortIndicator = (key: SortKey) =>
    sortKey === key ? (sortDirection === "asc" ? " ▲" : " ▼") : ""

  const handleRowsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, parseInt(e.target.value) || 1)
    setRowsPerPage(value)
    setCurrentPage(1)
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow space-y-4">
      <div className="flex items-center justify-between p-2">
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
        <div className="text-sm">
          Page {currentPage} of {totalPages}
        </div>
      </div>

      <table className="min-w-full table-auto text-sm">
        <thead>
          <tr className="bg-gray-200 text-gray-700">
            <th className="text-left p-2 cursor-pointer" onClick={() => handleSort("url")}>
              URL{renderSortIndicator("url")}
            </th>
            <th className="text-left p-2 cursor-pointer" onClick={() => handleSort("title")}>
              Title{renderSortIndicator("title")}
            </th>
            <th className="text-left p-2 cursor-pointer" onClick={() => handleSort("html_version")}>
              HTML Version{renderSortIndicator("html_version")}
            </th>
            <th className="text-left p-2 cursor-pointer" onClick={() => handleSort("internal_links")}>
              Internal{renderSortIndicator("internal_links")}
            </th>
            <th className="text-left p-2 cursor-pointer" onClick={() => handleSort("external_links")}>
              External{renderSortIndicator("external_links")}
            </th>
            <th className="text-left p-2 cursor-pointer" onClick={() => handleSort("accessible_links")}>
              Accessible{renderSortIndicator("accessible_links")}
            </th>
            <th className="text-left p-2 cursor-pointer" onClick={() => handleSort("has_login_form")}>
              Login{renderSortIndicator("has_login_form")}
            </th>
            <th className="text-left p-2 cursor-pointer" onClick={() => handleSort("status")}>
              Status{renderSortIndicator("status")}
            </th>
            <th className="text-left p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedUrls.map((url) => (
            <tr key={url.id} className="border-t hover:bg-gray-50">
              <td
                className="p-2 text-blue-600 hover:underline cursor-pointer"
                onClick={() => navigate(`/details/${url.id}`)}
              >
                {url.url}
              </td>
              <td>{url.title || <em className="text-gray-400">(no title)</em>}</td>
              <td>{url.html_version || "–"}</td>
              <td>{url.internal_links}</td>
              <td>{url.external_links}</td>
              <td>{url.accessible_links ?? 0}</td>
              <td>{url.has_login_form ? "✔️" : "✖️"}</td>
              <td
                className={`p-2 capitalize ${
                  url.status === "error" ? "text-red-600" : "text-green-600"
                }`}
              >
                {url.status}
              </td>
              <td className="p-2 space-x-2">
                {(url.status === "done" || url.status === "error") && (
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => onStart(url.id)}
                  >
                    Start
                  </button>
                )}
                {url.status === "running" && (
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => onStop(url.id)}
                  >
                    Stop
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-2 py-4">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-sm">
          Showing {paginatedUrls.length} of {urls.length} links
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
  )
}
