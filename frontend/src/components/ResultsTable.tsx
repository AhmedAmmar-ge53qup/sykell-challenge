// ResultsTable.tsx
import type { URLInfo } from "../types";
import { useNavigate } from "react-router";

type Props = {
  urls: URLInfo[];
  onStart: (id: string) => void;
  onStop: (id: string) => void;
  onSort: (key: keyof URLInfo) => void;
  onDelete: (id: string) => void;
  sortKey: keyof URLInfo | null;
  sortDirection: "asc" | "desc";
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  allSelected: boolean;
};

export default function ResultsTable({
  urls,
  onStart,
  onStop,
  onSort,
  onDelete,
  sortKey,
  sortDirection,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  allSelected,
}: Props) {
  const navigate = useNavigate();

  const renderSortIndicator = (key: keyof URLInfo) =>
    sortKey === key ? (sortDirection === "asc" ? " ▲" : " ▼") : "";

  return (
    <table className="min-w-full table-auto text-sm">
      <thead>
        <tr className="bg-gray-200 text-gray-700">
          <th className="p-2">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={onToggleSelectAll}
            />
          </th>
          <th
            className="text-left p-2 cursor-pointer"
            onClick={() => onSort("url")}
          >
            URL{renderSortIndicator("url")}
          </th>
          <th
            className="text-left p-2 cursor-pointer"
            onClick={() => onSort("title")}
          >
            Title{renderSortIndicator("title")}
          </th>
          <th
            className="text-left p-2 cursor-pointer"
            onClick={() => onSort("html_version")}
          >
            HTML Version{renderSortIndicator("html_version")}
          </th>
          <th
            className="text-left p-2 cursor-pointer"
            onClick={() => onSort("internal_links")}
          >
            Internal{renderSortIndicator("internal_links")}
          </th>
          <th
            className="text-left p-2 cursor-pointer"
            onClick={() => onSort("external_links")}
          >
            External{renderSortIndicator("external_links")}
          </th>
          <th
            className="text-left p-2 cursor-pointer"
            onClick={() => onSort("accessible_links")}
          >
            Accessible{renderSortIndicator("accessible_links")}
          </th>
          <th
            className="text-left p-2 cursor-pointer"
            onClick={() => onSort("has_login_form")}
          >
            Login{renderSortIndicator("has_login_form")}
          </th>
          <th
            className="text-left p-2 cursor-pointer"
            onClick={() => onSort("status")}
          >
            Status{renderSortIndicator("status")}
          </th>
          <th className="text-left p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {urls.map((url) => (
          <tr key={url.id} className="border-t hover:bg-gray-50">
            <td className="p-2">
              <input
                type="checkbox"
                checked={selectedIds.has(url.id)}
                onChange={() => onToggleSelect(url.id)}
              />
            </td>
            <td
              className="p-2 text-blue-600 hover:underline cursor-pointer"
              onClick={() => navigate(`/details/${url.id}`)}
            >
              {url.url}
            </td>
            <td>
              {url.title || <em className="text-gray-400">(no title)</em>}
            </td>
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
              <button
                className="text-red-700 hover:underline"
                onClick={() => onDelete(url.id)}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
