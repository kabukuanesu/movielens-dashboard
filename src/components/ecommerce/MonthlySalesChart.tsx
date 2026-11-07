"use client";

import { ApexOptions } from "apexcharts";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Input from "@/components/form/input/InputField";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface TagData {
  tag: string;
  relevance_score: number;
}

interface MovieResult {
  movie_id: number;
  title: string;
  year: number | null;
}

export default function TopTagsChart() {
  // Ideally, you would use a generic translation namespace, 
  // but I'm keeping the structure similar to the original component.
  const t = useTranslations("analytics.topTags");

  // --- State for Movie Search ---
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MovieResult[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<MovieResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // --- State for Chart Data ---
  const [tags, setTags] = useState<TagData[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);

  // --- 1. Handle Movie Search ---
  useEffect(() => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`http://127.0.0.1:8000/movies/?query=${query}&limit=5`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // --- 2. Fetch Tags when a movie is selected ---
  useEffect(() => {
    if (!selectedMovie) {
      setTags([]);
      return;
    }

    const fetchTags = async () => {
      setIsLoadingTags(true);
      try {
        const res = await fetch(`http://127.0.0.1:8000/analytics/movies/${selectedMovie.movie_id}/top-tags`);
        if (res.ok) {
          const data = await res.json();
          setTags(data);
        }
      } catch (err) {
        console.error("Failed to fetch tags:", err);
      } finally {
        setIsLoadingTags(false);
      }
    };

    fetchTags();
  }, [selectedMovie]);

  // --- 3. Chart Configuration (Horizontal Bar) ---
  const options: ApexOptions = {
    colors: ["#465fff"], // brand-500
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 250,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: true, // Make it horizontal for tags
        barHeight: "50%",
        borderRadius: 4,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: true,
      textAnchor: "start",
      style: {
        colors: ["#fff"],
      },
      formatter: function (val: number) {
        return val.toString();
      },
      offsetX: 0,
    },
    stroke: {
      show: true,
      width: 1,
      colors: ["transparent"],
    },
    xaxis: {
      categories: tags.map((t) => t.tag),
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: {
          fontFamily: "Outfit",
          fontSize: "14px",
        },
      },
    },
    grid: {
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val} votes`,
      },
    },
  };

  const series = [
    {
      name: "Votes",
      data: tags.map((t) => t.relevance_score),
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-2 sm:px-6 sm:pt-6 dark:border-gray-800 dark:bg-white/3">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {t("title") || "Top 5 Tags by Relevance"}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {selectedMovie ? selectedMovie.title : "Select a movie to view its tags"}
          </p>
        </div>

        {/* Movie Search Bar */}
        <div className="relative w-full sm:w-72">
          <Input
            type="text"
            placeholder="Search movie..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {isSearching && (
            <span className="absolute end-4 top-3 text-xs text-gray-400">...</span>
          )}
          
          {/* Dropdown Results */}
          {searchResults.length > 0 && query.length >= 2 && (
            <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg dark:bg-gray-900 dark:border-gray-800 max-h-60 overflow-y-auto">
              {searchResults.map((movie) => (
                <li
                  key={movie.movie_id}
                  onClick={() => {
                    setSelectedMovie(movie);
                    setQuery(movie.title);
                    setSearchResults([]);
                  }}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-50 dark:border-gray-800 last:border-0"
                >
                  {movie.title} {movie.year && <span className="text-gray-400">({movie.year})</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Chart Area */}
      <div className="custom-scrollbar max-w-full overflow-x-auto">
        {isLoadingTags ? (
          <div className="flex h-62.5 items-center justify-center text-gray-400">
            Loading tags...
          </div>
        ) : tags.length > 0 ? (
          <div className="min-w-125">
            <ReactApexChart
              options={options}
              series={series}
              type="bar"
              height={250}
            />
          </div>
        ) : selectedMovie ? (
          <div className="flex h-62.5 items-center justify-center text-gray-400">
            No tags found for this movie.
          </div>
        ) : (
          <div className="flex h-62.5 items-center justify-center text-gray-400">
            Please search and select a movie above.
          </div>
        )}
      </div>
    </div>
  );
}
