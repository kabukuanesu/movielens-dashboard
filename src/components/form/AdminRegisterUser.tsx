"use client";

import { useState } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import ComponentCard from "@/components/common/ComponentCard";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function AdminRegisterUser() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const roleOptions = [
    { value: "user", label: "User (Can rate movies)" },
    { value: "admin", label: "Admin (Full access)" },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("access_token="))
        ?.split("=")[1];

      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username,
          email,
          password,
          role_name: role,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail ?? "Failed to register user.");
      }

      setMessage({ type: "success", text: `Successfully registered ${role} "${username}".` });
      setUsername("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <ComponentCard title="Register New Account (Admin Only)">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label htmlFor="username">Username <span className="text-error-500">*</span></Label>
          <Input
            id="username"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="password">Password <span className="text-error-500">*</span></Label>
          <Input
            type="password"
            id="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <Label>Role <span className="text-error-500">*</span></Label>
          <Select
            options={roleOptions}
            defaultValue={role}
            onChange={(val) => setRole(val)}
          />
        </div>

        {message && (
          <div
            className={`rounded-lg px-4 py-3 text-sm ${
              message.type === "success"
                ? "bg-success-50 text-success-600 dark:bg-success-500/10"
                : "bg-error-50 text-error-600 dark:bg-error-500/10"
            }`}
          >
            {message.text}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Registering..." : "Register User"}
        </Button>
      </form>
    </ComponentCard>
  );
}
