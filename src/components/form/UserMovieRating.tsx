"use client";

import { useState, useEffect } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import ComponentCard from "@/components/common/ComponentCard";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface Movie {
  movie_id: number;
  title: string;
  year: number | null;
}

export default function UserMovieRating() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovieId, setSelectedMovieId] = useState<string>("");
  const [rating, setRating] = useState<string>("4.0");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (!query) {
        setMovies([]);
        return;
      }
      setSearching(true);
      try {
        const res = await fetch(`${API_BASE}/movies/?query=${encodeURIComponent(query)}&limit=10`);
        if (res.ok) {
          const data = await res.json();
          setMovies(data);
        }
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setSearching(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const movieOptions = movies.map((m) => ({
    value: m.movie_id.toString(),
    label: `${m.title} ${m.year ? `(${m.year})` : ""}`,
  }));

  const ratingOptions = [
    { value: "0.5", label: "0.5 Stars" },
    { value: "1.0", label: "1.0 Stars" },
    { value: "1.5", label: "1.5 Stars" },
    { value: "2.0", label: "2.0 Stars" },
    { value: "2.5", label: "2.5 Stars" },
    { value: "3.0", label: "3.0 Stars" },
    { value: "3.5", label: "3.5 Stars" },
    { value: "4.0", label: "4.0 Stars" },
    { value: "4.5", label: "4.5 Stars" },
    { value: "5.0", label: "5.0 Stars" },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedMovieId) {
      setMessage({ type: "error", text: "Please select a movie first." });
      return;
    }

    setMessage(null);
    setLoading(true);

    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("access_token="))
        ?.split("=")[1];

      const res = await fetch(`${API_BASE}/movies/${selectedMovieId}/rating`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: parseFloat(rating) }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail ?? "Failed to submit rating.");
      }

      setMessage({ type: "success", text: "Rating submitted successfully!" });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <ComponentCard title="Rate a Movie">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label htmlFor="search">Search Movie</Label>
          <Input
            id="search"
            placeholder="Type to search (e.g. Toy Story)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {searching && <span className="text-xs text-gray-500 mt-1 block">Searching...</span>}
        </div>

        {movies.length > 0 && (
          <div>
            <Label>Select Movie <span className="text-error-500">*</span></Label>
            <Select
              options={movieOptions}
              placeholder="Choose a movie"
              onChange={(val) => setSelectedMovieId(val)}
            />
          </div>
        )}

        <div>
          <Label>Rating <span className="text-error-500">*</span></Label>
          <Select
            options={ratingOptions}
            defaultValue={rating}
            onChange={(val) => setRating(val)}
          />
        </div>

        {message && (
          <div
            className={`rounded-lg px-4 py-3 text-sm ${
              message.type === "success"
                ? "bg-success-50 text-success-600 dark:bg-success-500/10"
                : "bg-error-50 text-error-600 dark:bg-error-500/10"
            }`}
          >
            {message.text}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading || !selectedMovieId}>
          {loading ? "Submitting..." : "Submit Rating"}
        </Button>
      </form>
    </ComponentCard>
  );
}
