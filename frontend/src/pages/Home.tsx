import { useEffect, useState } from "react"
import type { URLInfo } from "../types"
import URLForm from "../components/URLForm"
import ResultsTable from "../components/ResultsTable"

const API_BASE = "http://localhost:8080"

export default function Home() {
  const [urls, setUrls] = useState<URLInfo[]>([])

  const fetchURLs = async () => {
    const res = await fetch(`${API_BASE}/urls`)
    const data = await res.json()
    setUrls(data)
  }

  useEffect(() => {
    fetchURLs()
  }, [])

  // Poll 1 URL's status updates every 2 seconds until done/error
  const pollForStatusUpdate = (id: string) => {
    const interval = setInterval(async () => {
      const res = await fetch(`${API_BASE}/urls`)
      const data: URLInfo[] = await res.json()
      const updated = data.find((u) => u.id === id)
      if (!updated) return
      setUrls((prev) => prev.map((u) => (u.id === id ? updated : u)))

      if (updated.status === "done" || updated.status === "error") {
        clearInterval(interval)
      }
    }, 2000)
  }

  const handleAdd = async (url: string) => {
    try {
      const res = await fetch(`${API_BASE}/urls`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })

      if (!res.ok) {
        console.log(res.json());
        return
      }

      const newURL: URLInfo = await res.json()

      // Add newly queued URL immediately to the list
      setUrls((prev) => [...prev, newURL])

      // Start polling for this URL's status updates
      pollForStatusUpdate(newURL.id)
    } catch (error) {
      console.error("Failed to add URL:", error)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-center">Website Crawler</h1>
      <URLForm onSubmit={handleAdd} />
      <ResultsTable urls={urls} />
    </div>
  )
}
