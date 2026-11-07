"use client";

import { ApexOptions } from "apexcharts";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface RawDist {
  num_ratings: number;
  frequency: number; // Number of movies that have this many ratings
}

export default function RatingsDistributionChart() {
  const t = useTranslations("analytics.ratingsDistribution");
  
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<{ label: string; count: number }[]>([]);

  useEffect(() => {
    const fetchDistribution = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/analytics/movies/rating-counts-distribution`);
        if (res.ok) {
          const rawData: RawDist[] = await res.json();
          
          // Bucket the data so we don't have 1000 bars
          let buckets = {
            "1 rating": 0,
            "2 ratings": 0,
            "3-5 ratings": 0,
            "6-10 ratings": 0,
            "11-50 ratings": 0,
            "51-100 ratings": 0,
            "101-500 ratings": 0,
            "500+ ratings": 0,
          };

          rawData.forEach((row) => {
            const n = row.num_ratings;
            if (n === 1) buckets["1 rating"] += row.frequency;
            else if (n === 2) buckets["2 ratings"] += row.frequency;
            else if (n >= 3 && n <= 5) buckets["3-5 ratings"] += row.frequency;
            else if (n >= 6 && n <= 10) buckets["6-10 ratings"] += row.frequency;
            else if (n >= 11 && n <= 50) buckets["11-50 ratings"] += row.frequency;
            else if (n >= 51 && n <= 100) buckets["51-100 ratings"] += row.frequency;
            else if (n >= 101 && n <= 500) buckets["101-500 ratings"] += row.frequency;
            else buckets["500+ ratings"] += row.frequency;
          });

          // Convert to array for chart
          const formattedData = Object.entries(buckets).map(([label, count]) => ({
            label,
            count,
          }));
          
          setChartData(formattedData);
        }
      } catch (err) {
        console.error("Failed to fetch distribution:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDistribution();
  }, []);

  // Configure the Horizontal Bar Chart
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
        horizontal: true,
        barHeight: "60%",
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: chartData.map((d) => d.label),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        formatter: (val) => Number(val).toLocaleString(),
      },
    },
    yaxis: {
      labels: {
        style: { fontSize: "13px", fontWeight: 500 },
      },
    },
    grid: {
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
    },
    tooltip: {
      y: {
        formatter: (val) => `${val.toLocaleString()} movies`,
      },
    },
  };

  const series = [
    {
      name: "Number of Movies",
      data: chartData.map((d) => d.count),
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/3">
      <div className="shadow-default rounded-2xl bg-white px-5 pt-5 pb-5 sm:px-6 sm:pt-6 dark:bg-gray-900 relative">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {t("title") || "Distribution of Total Ratings"}
          </h3>
          <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
            {t("subtitle") || "How many movies fall into each rating volume bucket."}
          </p>
        </div>
      </div>

      <div className="flex-1 w-full relative">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-gray-400">
            Loading chart...
          </div>
        ) : (
          <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={350}
          />
        )}
      </div>
    </div>
  );
}
