"use client";

import { ApexOptions } from "apexcharts";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface GenreResult {
  name: string;
  movie_count: number;
}

const YEARS = Array.from({ length: 125 }, (_, i) => 2023 - i);

export default function TopGenreByYear() {
  const t = useTranslations("analytics.topGenreByYear");
  
  const [selectedYear, setSelectedYear] = useState<number>(2023);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<GenreResult | null>(null);

  useEffect(() => {
    const fetchTopGenre = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE}/analytics/genres/top-genre-by-year/${selectedYear}`);
        if (res.ok) {
          const json = await res.json();
          // If no movies released that year, the backend might return an empty object or null
          if (json && json.name) {
             setData(json);
          } else {
             setData(null);
          }
        }
      } catch (err) {
        console.error("Failed to fetch top genre:", err);
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopGenre();
  }, [selectedYear]);

  // Configure the Donut Chart
  const options: ApexOptions = {
    colors: ["#465FFF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "donut",
      height: 280,
    },
    labels: [data?.name || "No Data"],
    plotOptions: {
      pie: {
        donut: {
          size: "75%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "14px",
              fontWeight: 500,
              color: "#6B7280",
            },
            value: {
              show: true,
              fontSize: "24px",
              fontWeight: 600,
              color: "#1D2939",
              // Explicitly typing the return as string fixes the TypeScript error
              formatter: (val): string => String(val),
            },
            total: {
              show: true,
              showAlways: true,
              label: "Movies",
              fontSize: "14px",
              fontWeight: 500,
              color: "#6B7280",
              // Explicitly typing the return as string fixes the TypeScript error
              formatter: (): string => data?.movie_count.toLocaleString() || "0",
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: false,
    },
    legend: {
      show: false,
    },
  };

  // We use the movie count as the inner value, and 0 as the empty track
  const series = [data?.movie_count || 100, 0];

  return (
    <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/3">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {t("title") || "Top Genre by Year"}
          </h3>
          <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
            {t("subtitle") || "The genre with the highest number of releases in a specific year."}
          </p>
        </div>

        {/* Year Selector */}
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="h-10 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
        >
          {YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-gray-400">
            Loading chart...
          </div>
        ) : data ? (
          <>
            <ReactApexChart
              options={options}
              series={series}
              type="donut"
              height={280}
            />
            <div className="mt-4 text-center">
              <span className="inline-block rounded-full bg-brand-50 px-4 py-1.5 text-sm font-semibold text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                {data.name} ({data.movie_count.toLocaleString()} Movies)
              </span>
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            No genre data available for {selectedYear}.
          </div>
        )}
      </div>
    </div>
  );
}
