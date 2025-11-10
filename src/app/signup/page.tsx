"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [language] = useState("en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Basic validation
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/sign-up/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();
      if (!res.ok) {
        const code = data?.code || "UNKNOWN_ERROR";
        const message = data?.message || "Failed to create account.";
        setError(`${message} (${code})`);
        return;
      }

      setSuccess("Your account has been created. You can now sign in.");
      setName("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-start justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-2xl font-semibold">Create your account</h1>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label" htmlFor="name">
              <span className="label-text">Username</span>
            </label>
            <input
              id="name"
              type="text"
              className="input input-bordered w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              placeholder="John Doe"
            />
          </div>

          <div className="form-control">
            <label className="label" htmlFor="email">
              <span className="label-text">Email</span>
            </label>
            <input
              id="email"
              type="email"
              className="input input-bordered w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>

          <div className="form-control">
            <label className="label" htmlFor="password">
              <span className="label-text">Password</span>
            </label>
            <input
              id="password"
              type="password"
              className="input input-bordered w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="••••••••"
            />
          </div>

          <div className="form-control">
            <label className="label" htmlFor="language">
              <span className="label-text">Language</span>
            </label>
            <select id="language" className="select select-bordered w-full" value={language} disabled>
              <option value="en">English</option>
            </select>
            <p className="text-xs opacity-70 mt-1">Only English is available for now.</p>
          </div>

          {error && (
            <div role="alert" className="alert alert-error text-sm">{error}</div>
          )}
          {success && (
            <div role="status" className="alert alert-success text-sm">{success}</div>
          )}

          <button type="submit" className={`btn btn-primary w-full ${loading ? "btn-disabled" : ""}`} disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <p className="text-sm text-base-content/70">
          Already have an account? <Link href="/signin" className="link">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
