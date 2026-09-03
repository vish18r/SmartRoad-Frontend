"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordInput } from "@/components/auth/password-input";
import { authApi } from "@/lib/api/auth-api";
import type { ApiError } from "@/types/api";

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    countryCode: "+91",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    const cleanPhoneNumber = form.phoneNumber.replace(/\D/g, "");

    if (
      !form.firstName.trim() ||
      !/^\S+@\S+\.\S+$/.test(form.email) ||
      !/^\d{10,15}$/.test(cleanPhoneNumber) ||
      !/^\+[1-9]\d{0,2}$/.test(form.countryCode)
    ) {
      return setError("Enter a first name, valid email, country code, and 10–15 digit phone number.");
    }

    if (!passwordPattern.test(form.password)) {
      return setError(
        "Password must have 8+ characters with upper/lowercase, a number, and a special character."
      );
    }

    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match.");
    }

    setLoading(true);
    setError("");

    try {
      await authApi.signup({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phoneNumber: cleanPhoneNumber,
        countryCode: form.countryCode,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });

      router.push(
        `/verify-otp?phoneNumber=${encodeURIComponent(cleanPhoneNumber)}&flow=SIGNUP_VERIFICATION`
      );
    } catch (reason) {
      setError((reason as ApiError).message || "Unable to create the account.");
    } finally {
      setLoading(false);
    }
  };

  const field = (label: string, key: keyof typeof form, type = "text") => (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <input
        required
        disabled={loading}
        type={type}
        value={form[key]}
        onChange={(e) => set(key)(e.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-orange-500"
      />
    </label>
  );

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start organizing your construction operations."
    >
      <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
        {field("First name", "firstName")}
        {field("Last name", "lastName")}

        <div className="sm:col-span-2">{field("Email", "email", "email")}</div>

        <div>{field("Country code", "countryCode")}</div>
        <div>{field("Phone number", "phoneNumber", "tel")}</div>

        <div className="sm:col-span-2">
          <PasswordInput
            label="Password"
            value={form.password}
            onChange={set("password")}
            disabled={loading}
            autoComplete="new-password"
          />
        </div>

        <div className="sm:col-span-2">
          <PasswordInput
            label="Confirm password"
            value={form.confirmPassword}
            onChange={set("confirmPassword")}
            disabled={loading}
            autoComplete="new-password"
          />
        </div>

        {error && (
          <p role="alert" className="sm:col-span-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          disabled={loading}
          className="sm:col-span-2 w-full rounded-lg bg-slate-900 py-2.5 font-medium text-white disabled:opacity-60"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-orange-600">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
