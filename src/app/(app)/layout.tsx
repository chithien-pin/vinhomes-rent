import { AppNav } from "@/components/layout/AppNav";
import { requireAppUser } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAppUser();

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900">
      <AppNav />
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-4 md:pb-10 md:pt-6">
        {children}
      </main>
    </div>
  );
}
