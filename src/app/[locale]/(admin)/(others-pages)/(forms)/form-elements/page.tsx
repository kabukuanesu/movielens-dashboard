"use client";

import { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AdminRegisterUser from "@/components/form/AdminRegisterUser";
import UserMovieRating from "@/components/form/UserMovieRating";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function FormElements() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRole() {
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("access_token="))
          ?.split("=")[1];

        if (!token) {
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setRole(data.role.name);
        }
      } catch (err) {
        console.error("Failed to fetch user role", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRole();
  }, []);

  if (loading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Data Input" />
        <div className="flex h-40 items-center justify-center">
          <span className="text-gray-500">Loading user permissions...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Data Input" />
      <div className="mx-auto w-full max-w-xl">
        {role === "admin" ? (
          <AdminRegisterUser />
        ) : role === "user" ? (
          <UserMovieRating />
        ) : (
          <div className="rounded-xl border border-warning-500/20 bg-warning-50 p-6 text-center dark:bg-warning-500/10">
            <p className="text-warning-600 dark:text-warning-400">
              You must be logged in to access this page.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
