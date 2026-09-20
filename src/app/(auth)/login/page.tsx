"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";

import {
  createClient,
} from "@/lib/supabase/client";

export default function LoginPage() {
  const router =
    useRouter();

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError(null);

    const supabase =
      createClient();

    const {
      error:
        signInError,
    } =
      await supabase.auth.signInWithPassword(
        {
          email:
            email.trim(),
          password,
        }
      );

    if (signInError) {
      setError(
        signInError.message
      );

      setLoading(false);

      return;
    }

    router.replace(
      "/websites"
    );

    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-10">
      <div className="w-full max-w-[420px]">
        <div className="mb-8 text-center">
          <div className="font-[family-name:var(--font-plus-jakarta)] text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            Embernix
          </div>

          <h1 className="mt-8 font-[family-name:var(--font-plus-jakarta)] text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            Welcome back
          </h1>

          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Sign in to manage
            your websites.
          </p>
        </div>

        <form
          onSubmit={
            handleSubmit
          }
          className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6"
        >
          <div>
            <label
              htmlFor="email"
              className="text-sm font-medium text-[var(--foreground)]"
            >
              Email
            </label>

            <div className="relative mt-2">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />

              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={
                  email
                }
                onChange={(
                  event
                ) =>
                  setEmail(
                    event
                      .target
                      .value
                  )
                }
                className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--background)] pl-10 pr-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="mt-5">
            <label
              htmlFor="password"
              className="text-sm font-medium text-[var(--foreground)]"
            >
              Password
            </label>

            <div className="relative mt-2">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />

              <input
                id="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                autoComplete="current-password"
                required
                value={
                  password
                }
                onChange={(
                  event
                ) =>
                  setPassword(
                    event
                      .target
                      .value
                  )
                }
                className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--background)] pl-10 pr-10 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                placeholder="Enter your password"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (
                      current
                    ) =>
                      !current
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-5 rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-500">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={
              loading
            }
            className="mt-6 flex h-10 w-full items-center justify-center rounded-md bg-[var(--primary)] px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Signing in..."
              : "Sign in"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs leading-5 text-[var(--muted-foreground)]">
          Your hosting
          services appear
          automatically after
          they are provisioned
          through Embernix.
        </p>
      </div>
    </main>
  );
}