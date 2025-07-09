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

  const handleAdd = async (url: string) => {
    await fetch(`${API_BASE}/urls`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    })
    await fetchURLs()
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-center">Website Crawler</h1>
      <URLForm onSubmit={handleAdd} />
      <ResultsTable urls={urls} />
    </div>
  )
}
