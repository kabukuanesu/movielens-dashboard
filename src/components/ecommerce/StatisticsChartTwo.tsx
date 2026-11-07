"use client";

import { ApexOptions } from "apexcharts";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface GenreCoverage {
  name: string;
  movie_count: number;
}

export default function GenreCoverageChart() {
  const t = useTranslations("analytics.genreCoverage");
  
  const [data, setData] = useState<GenreCoverage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCoverage = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/analytics/genres/coverage`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to fetch genre coverage:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoverage();
  }, []);

  // Configure the Bar Chart
  const options: ApexOptions = {
    colors: ["#465FFF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 350,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false, // Vertical bars
        columnWidth: "55%",
        borderRadius: 4,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: data.map((d) => d.name),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { fontSize: "11px" }, // Smaller font to fit all genres
        rotate: -45, // Rotate labels so they don't overlap
        rotateAlways: true,
      },
    },
    yaxis: {
      labels: {
        formatter: (val) => Math.round(val).toLocaleString(),
      },
    },
    grid: {
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: false } },
    },
    tooltip: {
      y: {
        formatter: (val) => `${val.toLocaleString()} movies`,
      },
    },
  };

  const series = [
    {
      name: "Movies",
      data: data.map((d) => d.movie_count),
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-5 sm:px-6 sm:pt-6 dark:border-gray-800 dark:bg-white/3">
      
      {/* Header */}
      <div className="mb-6 flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {t("title") || "Genre-wise Coverage of Movies"}
        </h3>
        <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
          {t("subtitle") || "Total number of movies categorized under each genre."}
        </p>
      </div>

      {/* Chart Area */}
      <div className="custom-scrollbar max-w-full overflow-x-auto">
        {isLoading ? (
          <div className="flex h-[350px] items-center justify-center text-gray-400">
            Loading chart...
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-[350px] items-center justify-center text-gray-400">
            No data available.
          </div>
        ) : (
          <div className="min-w-[700px]">
            <ReactApexChart
              options={options}
              series={series}
              type="bar"
              height={350}
            />
          </div>
        )}
      </div>
    </div>
  );
}
