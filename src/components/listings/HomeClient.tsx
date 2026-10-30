"use client";

import { ListingCard } from "@/components/listings/ListingCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  LISTING_STATUS_LABELS,
  UNIT_TYPE_LABELS,
} from "@/lib/constants";
import type { EnrichedListing } from "@/lib/listings";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

type SortKey = "updated" | "rent" | "total" | "score" | "viewed";

export function HomeClient({
  initialListings,
}: {
  initialListings: EnrichedListing[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [unitType, setUnitType] = useState("");
  const [sort, setSort] = useState<SortKey>("updated");
  const [selected, setSelected] = useState<string[]>([]);
  const [seeding, setSeeding] = useState(false);
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    let list = [...initialListings];
    const query = q.trim().toLowerCase();
    if (query) {
      list = list.filter((l) =>
        [l.title, l.project, l.building, l.address, l.unitNumber]
          .filter(Boolean)
          .some((s) => s!.toLowerCase().includes(query))
      );
    }
    if (status) list = list.filter((l) => l.status === status);
    if (unitType) list = list.filter((l) => l.unitType === unitType);

    list.sort((a, b) => {
      switch (sort) {
        case "rent":
          return (a.rentMonthly ?? Infinity) - (b.rentMonthly ?? Infinity);
        case "total":
          return a.costs.estimatedMonthly - b.costs.estimatedMonthly;
        case "score":
          return (b.weightedScore ?? -1) - (a.weightedScore ?? -1);
        case "viewed":
          return (
            (b.viewedAt ? new Date(b.viewedAt).getTime() : 0) -
            (a.viewedAt ? new Date(a.viewedAt).getTime() : 0)
          );
        default:
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
      }
    });
    return list;
  }, [initialListings, q, status, unitType, sort]);

  async function createListing() {
    setCreating(true);
    try {
      const res = await fetch("/api/listings", { method: "POST", body: "{}" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/listings/${data.listing.id}/edit`);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Không tạo được");
    } finally {
      setCreating(false);
    }
  }

  async function seed() {
    if (!confirm("Tải 3 căn mẫu The Rainbow?")) return;
    setSeeding(true);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      startTransition(() => router.refresh());
    } catch (e) {
      alert(e instanceof Error ? e.message : "Lỗi seed");
    } finally {
      setSeeding(false);
    }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 4) {
        alert("Chọn tối đa 4 căn để so sánh");
        return prev;
      }
      return [...prev, id];
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold md:text-2xl">Căn hộ đang xem</h1>
          <p className="text-sm text-slate-500">Dùng cá nhân</p>
        </div>
        <Button onClick={createListing} loading={creating} size="sm">
          <Plus className="h-4 w-4" />
          Thêm
        </Button>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          placeholder="Tìm kiếm…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          placeholder="Mọi trạng thái"
          options={Object.entries(LISTING_STATUS_LABELS).map(([value, label]) => ({
            value,
            label,
          }))}
        />
        <Select
          value={unitType}
          onChange={(e) => setUnitType(e.target.value)}
          placeholder="Mọi loại căn"
          options={Object.entries(UNIT_TYPE_LABELS).map(([value, label]) => ({
            value,
            label,
          }))}
        />
        <Select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          options={[
            { value: "updated", label: "Mới cập nhật" },
            { value: "rent", label: "Giá thuê ↑" },
            { value: "total", label: "Tổng chi phí ↑" },
            { value: "score", label: "Điểm ↓" },
            { value: "viewed", label: "Ngày xem" },
          ]}
        />
      </div>

      {selected.length >= 2 && (
        <div className="sticky top-2 z-30 flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-sm md:top-16">
          <span className="text-sm font-medium text-emerald-900">
            Đã chọn {selected.length} căn
          </span>
          <Button
            size="sm"
            onClick={() =>
              router.push(`/compare?ids=${selected.join(",")}`)
            }
          >
            So sánh
          </Button>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          title={
            initialListings.length === 0
              ? "Chưa có căn nào"
              : "Không khớp bộ lọc"
          }
          description={
            initialListings.length === 0
              ? "Thêm căn vừa xem, hoặc tải 3 căn mẫu The Rainbow để thử ngay."
              : "Thử đổi từ khóa hoặc bộ lọc."
          }
          actionLabel="Thêm căn mới"
          onAction={createListing}
          secondaryLabel={
            initialListings.length === 0 ? "Tải 3 căn mẫu" : undefined
          }
          onSecondary={initialListings.length === 0 ? seed : undefined}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              selected={selected.includes(listing.id)}
              onToggleSelect={() => toggleSelect(listing.id)}
            />
          ))}
        </div>
      )}

      {pending && (
        <p className="text-center text-sm text-slate-400">Đang làm mới…</p>
      )}
      {seeding && (
        <p className="text-center text-sm text-slate-400">Đang tạo mẫu…</p>
      )}
    </div>
  );
}
