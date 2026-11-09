import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne from "@/components/tables/BasicTableOne";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Movie Lens | Users",
  description: "View all registered users in the database",
};

export default function BasicTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Registered Users" />
      <div className="space-y-6">
        <ComponentCard title="All Users">
          <BasicTableOne />
        </ComponentCard>
      </div>
    </div>
  );
}
