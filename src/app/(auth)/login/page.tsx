"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const authError = searchParams.get("error");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState<"email" | "google" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(
    authError ? "Đăng nhập thất bại. Thử lại." : null
  );

  async function sendMagicLink(e: FormEvent) {
    e.preventDefault();
    setLoading("email");
    setError(null);
    setMessage(null);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    setLoading(null);
    if (err) {
      setError(err.message);
      return;
    }
    setMessage("Đã gửi magic link. Kiểm tra email và bấm vào liên kết để đăng nhập.");
  }

  async function signInGoogle() {
    setLoading("google");
    setError(null);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (err) {
      setLoading(null);
      setError(err.message);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-10">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">
            🏠
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            So sánh căn hộ thuê
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Đăng nhập để lưu căn đã xem trên mọi thiết bị
          </p>
        </div>

        <form onSubmit={sendMagicLink} className="space-y-3">
          <Input
            type="email"
            label="Email"
            placeholder="ban@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Button
            type="submit"
            className="w-full"
            loading={loading === "email"}
            disabled={!email}
          >
            Gửi magic link
          </Button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs text-slate-400">
          <div className="h-px flex-1 bg-slate-200" />
          hoặc
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          loading={loading === "google"}
          onClick={signInGoogle}
        >
          Đăng nhập với Google
        </Button>

        {message && (
          <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {message}
          </p>
        )}
        {error && (
          <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Đang tải…</div>}>
      <LoginForm />
    </Suspense>
  );
}
