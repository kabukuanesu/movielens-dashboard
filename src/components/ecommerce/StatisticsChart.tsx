"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

interface Movie {
  movie_id: number;
  title: string;
  year: number | null;
  avg_rating: number;
  num_ratings: number;
}

// Generate years from 2024 back to 1900
const YEARS = Array.from({ length: 125 }, (_, i) => 2024 - i);

export default function TopMoviesChart() {
  const t = useTranslations("analytics.topMovies");
  
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states: 'overall', 'single', or 'range'
  const [filterType, setFilterType] = useState<"overall" | "single" | "range">("overall");
  const [selectedYear, setSelectedYear] = useState<number>(2023);
  const [startYear, setStartYear] = useState<number>(2010);
  const [endYear, setEndYear] = useState<number>(2015);

  // Fetch data when filters change
  useEffect(() => {
    const fetchTopMovies = async () => {
      setIsLoading(true);
      try {
        let url = `http://127.0.0.1:8000/analytics/movies/top-rated?limit=10`;
        
        // If the user wants a specific year or a range, we need to fetch and filter
        // Note: If your FastAPI endpoint supports `start_year` and `end_year`, you 
        // can pass them as query params here. For now, we fetch overall and filter client-side
        // if we don't want to change the backend, BUT it's better to modify the backend.
        
        // Assuming we update the backend to accept start/end year:
        if (filterType === "single") {
          url += `&year=${selectedYear}`;
        } else if (filterType === "range") {
          url += `&start_year=${startYear}&end_year=${endYear}`;
        }

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setMovies(data);
        }
      } catch (err) {
        console.error("Failed to fetch top movies:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopMovies();
  }, [filterType, selectedYear, startYear, endYear]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-5 sm:px-6 sm:pt-6 dark:border-gray-800 dark:bg-white/3">
      
      {/* Header & Controls */}
      <div className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {t("title") || "Top 10 Movies by Average Rating"}
          </h3>
          <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
            {t("subtitle") || "Requires a minimum of 50 ratings to qualify."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Filter Type Selector */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="h-10 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            <option value="overall">Overall</option>
            <option value="single">Specific Year</option>
            <option value="range">Year Range</option>
          </select>

          {/* Specific Year Dropdown */}
          {filterType === "single" && (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="h-10 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          )}

          {/* Range Dropdowns */}
          {filterType === "range" && (
            <div className="flex items-center gap-2">
              <select
                value={startYear}
                onChange={(e) => setStartYear(Number(e.target.value))}
                className="h-10 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <span className="text-gray-500">to</span>
              <select
                value={endYear}
                onChange={(e) => setEndYear(Number(e.target.value))}
                className="h-10 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="custom-scrollbar max-w-full overflow-x-auto">
        {isLoading ? (
          <div className="flex h-62.5 items-center justify-center text-gray-400">
            Loading movies...
          </div>
        ) : movies.length === 0 ? (
          <div className="flex h-62.5 items-center justify-center text-gray-400">
            No movies found for this criteria.
          </div>
        ) : (
          <table className="w-full text-left text-theme-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400">Rank</th>
                <th className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400">Movie Title</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-500 dark:text-gray-400">Avg Rating</th>
                <th className="px-4 py-3 text-end font-semibold text-gray-500 dark:text-gray-400">Votes</th>
              </tr>
            </thead>
            <tbody>
              {movies.map((movie, index) => (
                <tr key={movie.movie_id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 dark:border-gray-800/50 dark:hover:bg-white/2">
                  <td className="px-4 py-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-500 dark:bg-brand-500/15 dark:text-brand-400">
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-white/90">
                    {movie.title}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 font-semibold text-warning-500">
                      ★ {movie.avg_rating.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-end text-gray-500 dark:text-gray-400">
                    {movie.num_ratings.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
