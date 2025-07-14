import { useEffect, useState } from "react";
import type { URLInfo } from "../types";
import { PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import { useParams } from "react-router";

const COLORS = ["#4ade80", "#60a5fa"];

export default function Details() {
  const { id } = useParams();
  const [urlInfo, setUrlInfo] = useState<URLInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:8080/urls/${id}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch URL details: ${res.statusText}`);
        }
        const data = await res.json();
        setUrlInfo(data);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError("Unknown error");
      }
    };

    fetchData();
  }, [id]);

  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
  if (!urlInfo) return <div className="p-4">Loading...</div>;

  const pieData = [
    { name: "Internal", value: urlInfo.internal_links },
    { name: "External", value: urlInfo.external_links },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Details for {urlInfo.url}</h1>

      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h2 className="text-xl font-semibold mb-2">Link Distribution</h2>
        <PieChart width={300} height={300}>
          <Pie
            data={pieData}
            cx={150}
            cy={150}
            label
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>

      {urlInfo && urlInfo.broken_links && (
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-2">Broken Links</h2>
          {urlInfo.broken_links.length === 0 ? (
            <p className="text-gray-500">No broken links found.</p>
          ) : (
            <ul className="list-disc pl-6 space-y-1">
              {urlInfo.broken_links.map((link, idx) => (
                <li key={idx}>
                  <span className="text-red-600 font-medium">
                    {link.status}
                  </span>{" "}
                  -{" "}
                  <a
                    href={link.url}
                    className="text-blue-500"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {link.url}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
