import { useState, useEffect } from "react";
import NannyCard from "../components/NannyCard";
import "../styles/NanniesPage.scss";
import type { Nanny } from "../types";

export default function NanniesPage() {
  const [nannies, setNannies] = useState<Nanny[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNannies = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;

        const response = await fetch(`${apiUrl}/nannies`, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch nannies data");
        }

        const data = await response.json();
        setNannies(data?.nannies);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNannies();
  }, []);

  if (isLoading) {
    return (
      <div className="nannies-page">
        <h2 className="page-title">Loading...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="nannies-page">
        <h2 className="page-title" style={{ color: "red" }}>
          Error loading nannies: {error}
        </h2>
      </div>
    );
  }

  return (
    <div className="nannies-page">
      <h2 className="page-title">Find your perfect nanny</h2>

      <div className="nannies-list">
        {Array.isArray(nannies) && nannies.length > 0 ? (
          nannies.map((nanny) => <NannyCard key={nanny.id} nanny={nanny} />)
        ) : (
          <p>No nannies found or invalid data format.</p>
        )}
      </div>
    </div>
  );
}
