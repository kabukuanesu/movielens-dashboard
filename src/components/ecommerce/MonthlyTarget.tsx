"use client";

import { ApexOptions } from "apexcharts";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Input from "@/components/form/input/InputField";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface MovieResult {
  movie_id: number;
  title: string;
  year: number | null;
}

interface RatingDist {
  rating: number;
  count: number;
}

export default function RatingDistribution() {
  const t = useTranslations("analytics.ratingDistribution");

  // Search State
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MovieResult[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<MovieResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Data State
  const [distribution, setDistribution] = useState<RatingDist[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  // --- 2. Fetch Rating Distribution ---
  useEffect(() => {
    if (!selectedMovie) {
      setDistribution([]);
      return;
    }

    const fetchDistribution = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`http://127.0.0.1:8000/analytics/movies/${selectedMovie.movie_id}/rating-distribution`);
        if (res.ok) {
          const data = await res.json();
          setDistribution(data);
        }
      } catch (err) {
        console.error("Failed to fetch distribution:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDistribution();
  }, [selectedMovie]);

  // --- 3. Calculations for Radial Chart & Footer ---
  let totalVotes = 0;
  let weightedSum = 0;
  
  distribution.forEach((d) => {
    totalVotes += d.count;
    weightedSum += d.rating * d.count;
  });

  const avgRating = totalVotes > 0 ? (weightedSum / totalVotes) : 0;
  // Calculate percentage for radial bar (avgRating out of 5 => percentage)
  const percentage = (avgRating / 5) * 100;

  // Find counts for specific stars to show at the bottom
  const count5 = distribution.find((d) => d.rating === 5)?.count || 0;
  const count4 = distribution.find((d) => d.rating === 4)?.count || 0;
  const count3 = distribution.find((d) => d.rating === 3)?.count || 0;

  // --- 4. Chart Configurations ---
  const radialOptions: ApexOptions = {
    colors: ["#465FFF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 330,
      sparkline: { enabled: true },
    },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        hollow: { size: "80%" },
        track: {
          background: "#E4E7EC",
          strokeWidth: "100%",
          margin: 5,
        },
        dataLabels: {
          name: { show: false },
          value: {
            fontSize: "36px",
            fontWeight: "600",
            offsetY: -35,
            color: "#1D2939",
            formatter: function () {
              return avgRating.toFixed(2);
            },
          },
        },
      },
    },
    fill: { type: "solid", colors: ["#465FFF"] },
    stroke: { lineCap: "round" },
    labels: ["Average"],
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/3">
      <div className="shadow-default rounded-2xl bg-white px-5 pt-5 pb-5 sm:px-6 sm:pt-6 dark:bg-gray-900 relative">
        
        {/* Search Bar Overlay */}
        <div className="relative z-10 mb-4 w-full">
           <Input
            type="text"
            placeholder={t("searchPlaceholder") || "Search movie..."}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {isSearching && (
            <span className="absolute end-4 top-3 text-xs text-gray-400">...</span>
          )}
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

        <div className="flex justify-between items-center mb-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              {selectedMovie ? selectedMovie.title : (t("title") || "Rating Distribution")}
            </h3>
            <p className="mt-1 text-theme-sm font-normal text-gray-500 dark:text-gray-400">
              {selectedMovie ? `Total Votes: ${totalVotes.toLocaleString()}` : "Select a movie to view ratings"}
            </p>
          </div>
        </div>

        <div className="relative flex justify-center">
          {isLoading ? (
             <div className="flex h-[330px] items-center justify-center text-gray-400">Loading chart...</div>
          ) : selectedMovie && totalVotes > 0 ? (
            <div className="max-h-45 overflow-hidden" id="chartDarkStyle">
              <ReactApexChart
                options={radialOptions}
                series={[percentage]}
                type="radialBar"
                height={330}
              />
            </div>
          ) : (
             <div className="flex h-[330px] items-center justify-center text-gray-400">No ratings available.</div>
          )}
        </div>
      </div>

      {/* Footer stats replacing Target/Revenue/Today */}
      <div className="flex items-center justify-center gap-5 px-6 py-3 sm:gap-8 sm:py-5">
        <div>
          <p className="mb-1 text-center text-theme-xs text-gray-500 sm:text-sm dark:text-gray-400">
            {t("fiveStars") || "5 Stars"}
          </p>
          <p className="text-center text-base font-semibold text-gray-800 sm:text-lg dark:text-white/90">
            {count5.toLocaleString()}
          </p>
        </div>

        <div className="h-7 w-px bg-gray-200 dark:bg-gray-800"></div>

        <div>
          <p className="mb-1 text-center text-theme-xs text-gray-500 sm:text-sm dark:text-gray-400">
            {t("fourStars") || "4 Stars"}
          </p>
          <p className="text-center text-base font-semibold text-gray-800 sm:text-lg dark:text-white/90">
            {count4.toLocaleString()}
          </p>
        </div>

        <div className="h-7 w-px bg-gray-200 dark:bg-gray-800"></div>

        <div>
          <p className="mb-1 text-center text-theme-xs text-gray-500 sm:text-sm dark:text-gray-400">
            {t("threeStars") || "3 Stars"}
          </p>
          <p className="text-center text-base font-semibold text-gray-800 sm:text-lg dark:text-white/90">
            {count3.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
