"use client";

import { ArrowUpIcon, BoxIconLine, BoxCubeIcon } from "@/icons";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import Badge from "../ui/badge/Badge";

export const EcommerceMetrics = () => {
  const t = useTranslations("ecommerce.metrics");
  
  const [counts, setCounts] = useState<{ total_movies: number; total_genres: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/analytics/total-counts`);
        if (res.ok) {
          const data = await res.json();
          setCounts(data);
        }
      } catch (err) {
        console.error("Failed to fetch total counts:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCounts();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* <!-- Total Movies Metric --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 dark:text-white/90" />
        </div>

        <div className="mt-5 flex items-end justify-between">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {t("totalMovies") || "Total Movies"}
            </span>
            <h4 className="mt-2 text-title-sm font-bold text-gray-800 dark:text-white/90">
              {isLoading ? "..." : counts?.total_movies.toLocaleString()}
            </h4>
          </div>
          <Badge color="success">
            <ArrowUpIcon />
            Live
          </Badge>
        </div>
      </div>

      {/* <!-- Total Genres Metric --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
          <BoxCubeIcon className="size-6 text-gray-800 dark:text-white/90" />
        </div>
        <div className="mt-5 flex items-end justify-between">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {t("totalGenres") || "Total Genres"}
            </span>
            <h4 className="mt-2 text-title-sm font-bold text-gray-800 dark:text-white/90">
              {isLoading ? "..." : counts?.total_genres.toLocaleString()}
            </h4>
          </div>

          <Badge color="success">
            <ArrowUpIcon className="text-success-500" />
            Live
          </Badge>
        </div>
      </div>
    </div>
  );
};
