import type { URLInfo } from "../types"
import { useNavigate } from "react-router"

type Props = {
  urls: URLInfo[]
  onStart: (id: string) => void
  onStop: (id: string) => void
}

export default function ResultsTable({ urls, onStart, onStop }: Props) {
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
            <th className="text-left p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {urls.map((url) => (
            <tr
              key={url.id}
              className="border-t hover:bg-gray-50"
            >
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
    </div>
  )
}
