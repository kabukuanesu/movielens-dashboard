import DemographicCard from "@/components/ecommerce/DemographicCard";
import DemographicCardTwo from "@/components/ecommerce/DemographicCardTwo";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import StatisticsChartTwo from "@/components/ecommerce/StatisticsChartTwo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Movie Lens Data Analytics Dashboard",
  description: "This is a demonstration of extracting insights from the Movie Lens dataset using a Next.js admin dashboard template.",
};

export default function Ecommerce() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <EcommerceMetrics />

        <MonthlySalesChart />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <MonthlyTarget />
      </div>

      <div className="col-span-12">
        <StatisticsChart />
      </div>

      <div className="col-span-12 xl:col-span-5 space-y-25">
        <DemographicCard />
        <div>
          <DemographicCardTwo />
        </div>
      </div>

      <div className="col-span-12 xl:col-span-7">
        <RecentOrders />
      </div>

       <div className="col-span-12">
        <StatisticsChartTwo />
      </div>
    </div>
  );
}
