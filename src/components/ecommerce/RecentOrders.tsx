"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import Badge from "../ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

interface GenreTag {
  genre: string;
  tag: string;
  tag_count: number;
}

export default function GenreTagsTable() {
  const t = useTranslations("analytics.genreTags");
  
  const [data, setData] = useState<GenreTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGenreTags = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/analytics/genres/top-tags`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to fetch genre tags:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGenreTags();
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pt-4 pb-3 sm:px-6 dark:border-gray-800 dark:bg-white/3">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {t("title") || "Most Popular Tag per Genre"}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t("subtitle") || "Based on the frequency of user tags applied to movies in each genre."}
          </p>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Table Header */}
          <TableHeader className="border-y border-gray-100 dark:border-gray-800">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
              >
                {t("genre") || "Genre"}
              </TableCell>
              <TableCell
                isHeader
                className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
              >
                {t("topTag") || "Most Popular Tag"}
              </TableCell>
              <TableCell
                isHeader
                className="py-3 text-end text-theme-xs font-medium text-gray-500 dark:text-gray-400"
              >
                {t("applications") || "Applications"}
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="py-10 text-center text-gray-500">
                  Loading genre data...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="py-10 text-center text-gray-500">
                  No tags found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, index) => (
                <TableRow key={index}>
                  {/* Genre Name */}
                  <TableCell className="py-3">
                    <p className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
                      {item.genre}
                    </p>
                  </TableCell>

                  {/* Top Tag (Displayed as a Badge) */}
                  <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                    <Badge size="sm" color="primary">
                      {item.tag}
                    </Badge>
                  </TableCell>

                  {/* Tag Count */}
                  <TableCell className="py-3 text-end text-theme-sm text-gray-500 dark:text-gray-400">
                    {item.tag_count.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
