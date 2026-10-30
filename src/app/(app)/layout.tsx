import { AppNav } from "@/components/layout/AppNav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900">
      <AppNav />
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-4 md:pb-10 md:pt-6">
        {children}
      </main>
    </div>
  );
}
