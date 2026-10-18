"use client";

import { CompareTable } from "@/components/compare/CompareTable";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatVnd } from "@/lib/format";
import type { EnrichedListing } from "@/lib/listings";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export function CompareClient({
  allListings,
  initialSelected,
  initialIds,
}: {
  allListings: EnrichedListing[];
  initialSelected: EnrichedListing[];
  initialIds: string[];
}) {
  const router = useRouter();
  const [ids, setIds] = useState<string[]>(
    initialIds.length
      ? initialIds
      : initialSelected.map((l) => l.id)
  );

  const selected = useMemo(
    () => allListings.filter((l) => ids.includes(l.id)),
    [allListings, ids]
  );

  function toggle(id: string) {
    setIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 4) {
        alert("Chọn tối đa 4 căn");
        return prev;
      }
      return [...prev, id];
    });
  }

  function apply() {
    router.replace(`/compare?ids=${ids.join(",")}`);
  }

  if (allListings.length < 2) {
    return (
      <EmptyState
        title="Cần ít nhất 2 căn"
        description="Thêm thêm căn hộ rồi quay lại so sánh."
        actionLabel="Về danh sách"
        onAction={() => router.push("/")}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold md:text-2xl">So sánh căn hộ</h1>
        <p className="text-sm text-slate-500">
          Chọn 2–4 căn. Giá trị tốt nhất tô xanh, tệ nhất tô đỏ.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="mb-2 text-sm font-medium">Chọn căn ({ids.length}/4)</p>
        <div className="grid max-h-56 gap-2 overflow-y-auto sm:grid-cols-2">
          {allListings.map((l) => (
            <label
              key={l.id}
              className="flex cursor-pointer items-start gap-2 rounded-xl border border-slate-100 px-3 py-2 text-sm hover:bg-slate-50"
            >
              <input
                type="checkbox"
                checked={ids.includes(l.id)}
                onChange={() => toggle(l.id)}
                className="mt-0.5 accent-emerald-600"
              />
              <span>
                <span className="font-medium">{l.title}</span>
                <span className="block text-xs text-slate-500">
                  {formatVnd(l.rentMonthly)} · tổng{" "}
                  {formatVnd(l.costs.estimatedMonthly)}
                </span>
              </span>
            </label>
          ))}
        </div>
        <Button
          className="mt-3"
          size="sm"
          onClick={apply}
          disabled={ids.length < 2}
        >
          Cập nhật bảng so sánh
        </Button>
      </div>

      {selected.length >= 2 ? (
        <CompareTable listings={selected} />
      ) : (
        <EmptyState
          title="Chọn ít nhất 2 căn"
          description="Tick các căn ở trên rồi bấm cập nhật."
        />
      )}
    </div>
  );
}
