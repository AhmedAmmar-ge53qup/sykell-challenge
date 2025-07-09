import type { URLInfo } from "../types"
import { useNavigate } from "react-router"

export default function ResultsTable({ urls }: { urls: URLInfo[] }) {
  const navigate = useNavigate()

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow">
      <table className="min-w-full table-auto text-sm">
        <thead>
          <tr className="bg-gray-200 text-gray-700">
            <th className="text-left p-2">URL</th>
            <th className="text-left p-2">Title</th>
            <th className="text-left p-2">HTML Version</th>
            <th className="text-left p-2">Internal</th>
            <th className="text-left p-2">External</th>
            <th className="text-left p-2">Accessible</th>
            <th className="text-left p-2">Login</th>
            <th className="text-left p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {urls.map((url) => (
            <tr
              key={url.id}
              className="border-t hover:bg-gray-50 cursor-pointer"
              onClick={() => navigate(`/details/${url.id}`)}
            >
              <td className="p-2 text-blue-600 hover:underline">{url.url}</td>
              <td className="p-2">{url.title || <em className="text-gray-400">(no title)</em>}</td>
              <td className="p-2">{url.html_version || "–"}</td>
              <td className="p-2">{url.internal_links}</td>
              <td className="p-2">{url.external_links}</td>
              <td className="p-2">{url.accessible_links ?? 0}</td>
              <td className="p-2">{url.has_login_form ? "✔️" : "✖️"}</td>
              <td
                className={`p-2 capitalize ${
                  url.status === "error" ? "text-red-600" : "text-green-600"
                }`}
              >
                {url.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
