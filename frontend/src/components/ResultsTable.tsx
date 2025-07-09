import type { URLInfo } from "../types"

export default function ResultsTable({ data }: { data: URLInfo[] }) {
  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow">
      <table className="min-w-full table-auto text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th className="text-left p-2">URL</th>
            <th className="text-left p-2">Title</th>
            <th className="text-left p-2">HTML Version</th>
            <th className="text-left p-2">Internal Links</th>
            <th className="text-left p-2">External Links</th>
            <th className="text-left p-2">Login Form?</th>
            <th className="text-left p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((url) => (
            <tr key={url.id} className="border-t hover:bg-gray-50">
              <td className="p-2">{url.title || <em>(no title)</em>}</td>
              <td className="p-2">{url.url}</td>
              <td className="p-2">{url.html_version}</td>
              <td className="p-2">{url.internal_links}</td>
              <td className="p-2">{url.external_links}</td>
              <td className="p-2">{url.has_login_form ? "Yes" : "No"}</td>
              <td className="p-2 capitalize">{url.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
