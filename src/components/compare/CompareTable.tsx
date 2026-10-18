"use client";

import { Button } from "@/components/ui/Button";
import {
  FURNISHING_LABELS,
  LISTING_STATUS_LABELS,
  SCORE_CRITERIA,
  STORAGE_BUCKET,
  UNIT_TYPE_LABELS,
} from "@/lib/constants";
import { formatArea, formatScore, formatVnd } from "@/lib/format";
import type { EnrichedListing } from "@/lib/listings";
import { decimalToNumber } from "@/lib/listings";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { toPng } from "html-to-image";
import { Download, Printer } from "lucide-react";
import Image from "next/image";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";

type RowDef = {
  label: string;
  get: (l: EnrichedListing) => string | number | null;
  better?: "lower" | "higher";
  numeric?: boolean;
};

function highlightClass(
  values: (number | null)[],
  index: number,
  better: "lower" | "higher"
) {
  const nums = values.filter((v): v is number => v != null && !Number.isNaN(v));
  if (nums.length < 2) return "";
  const current = values[index];
  if (current == null) return "";
  const best =
    better === "lower" ? Math.min(...nums) : Math.max(...nums);
  const worst =
    better === "lower" ? Math.max(...nums) : Math.min(...nums);
  if (current === best && best !== worst) return "bg-emerald-50 text-emerald-800";
  if (current === worst && best !== worst) return "bg-rose-50 text-rose-800";
  return "";
}

export function CompareTable({ listings }: { listings: EnrichedListing[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [coverUrls, setCoverUrls] = useState<Record<string, string>>({});
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const map: Record<string, string> = {};
      for (const l of listings) {
        const cover = l.photos.find((p) => p.isCover) ?? l.photos[0];
        if (!cover) continue;
        const { data } = await supabase.storage
          .from(STORAGE_BUCKET)
          .createSignedUrl(cover.storagePath, 3600);
        if (data?.signedUrl) map[l.id] = data.signedUrl;
      }
      if (!cancelled) setCoverUrls(map);
    })();
    return () => {
      cancelled = true;
    };
  }, [listings]);

  const groups = useMemo(() => {
    const costRows: RowDef[] = [
      {
        label: "Giá thuê/tháng",
        get: (l) => l.rentMonthly,
        better: "lower",
        numeric: true,
      },
      {
        label: "Phí quản lý",
        get: (l) => l.costs.mgmtFee,
        better: "lower",
        numeric: true,
      },
      {
        label: "Gửi xe",
        get: (l) => l.costs.parkingTotal,
        better: "lower",
        numeric: true,
      },
      {
        label: "Cố định/tháng",
        get: (l) => l.costs.fixedMonthly,
        better: "lower",
        numeric: true,
      },
      {
        label: "Ước tính/tháng",
        get: (l) => l.costs.estimatedMonthly,
        better: "lower",
        numeric: true,
      },
      {
        label: "Vào ở ban đầu",
        get: (l) => l.costs.moveInCost,
        better: "lower",
        numeric: true,
      },
      {
        label: "Cả HĐ (cố định)",
        get: (l) => l.costs.contractFixed,
        better: "lower",
        numeric: true,
      },
    ];

    const infoRows: RowDef[] = [
      { label: "Loại căn", get: (l) => UNIT_TYPE_LABELS[l.unitType] },
      {
        label: "Diện tích TT",
        get: (l) => decimalToNumber(l.netAreaM2),
        better: "higher",
        numeric: true,
      },
      { label: "Tầng", get: (l) => l.floor, better: "higher", numeric: true },
      { label: "Hướng cửa", get: (l) => l.doorDirection },
      { label: "Hướng ban công", get: (l) => l.balconyDirection },
      { label: "View", get: (l) => l.viewNote },
      { label: "Nội thất", get: (l) => FURNISHING_LABELS[l.furnishing] },
      { label: "Trạng thái", get: (l) => LISTING_STATUS_LABELS[l.status] },
    ];

    const scoreRows: RowDef[] = [
      ...SCORE_CRITERIA.map((c) => ({
        label: c.label,
        get: (l: EnrichedListing) => l[c.key],
        better: "higher" as const,
        numeric: true,
      })),
      {
        label: "Điểm tổng",
        get: (l) => l.weightedScore,
        better: "higher",
        numeric: true,
      },
    ];

    const pointRows: RowDef[] = [
      {
        label: "Ưu điểm",
        get: (l) =>
          l.points
            .filter((p) => p.kind === "PRO")
            .map((p) => `• ${p.text}`)
            .join("\n") || "—",
      },
      {
        label: "Nhược điểm",
        get: (l) =>
          l.points
            .filter((p) => p.kind === "CON")
            .map((p) => `• ${p.text}`)
            .join("\n") || "—",
      },
    ];

    return [
      { title: "Giá & chi phí", rows: costRows },
      { title: "Thông tin căn", rows: infoRows },
      { title: "Điểm số", rows: scoreRows },
      { title: "Ưu / nhược", rows: pointRows },
    ];
  }, []);

  function formatCell(row: RowDef, listing: EnrichedListing) {
    const raw = row.get(listing);
    if (raw == null || raw === "") return "—";
    if (typeof raw === "number") {
      if (
        row.label.includes("Giá") ||
        row.label.includes("Phí") ||
        row.label.includes("chi") ||
        row.label.includes("Cố định") ||
        row.label.includes("Ước tính") ||
        row.label.includes("Vào ở") ||
        row.label.includes("HĐ") ||
        row.label.includes("Gửi")
      ) {
        return formatVnd(raw);
      }
      if (row.label.includes("Diện tích")) return formatArea(raw);
      if (row.label.includes("Điểm") || SCORE_CRITERIA.some((c) => c.label === row.label)) {
        return formatScore(raw);
      }
      return String(raw);
    }
    return String(raw);
  }

  async function exportPng() {
    if (!ref.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(ref.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `so-sanh-can-ho-${Date.now()}.png`;
      a.click();
    } catch {
      alert("Không xuất được ảnh. Thử In / PDF.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 print:hidden">
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="h-4 w-4" />
          In / PDF
        </Button>
        <Button variant="outline" size="sm" loading={exporting} onClick={exportPng}>
          <Download className="h-4 w-4" />
          Tải ảnh PNG
        </Button>
      </div>

      <div
        ref={ref}
        className="overflow-x-auto rounded-2xl border border-slate-200 bg-white"
      >
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-20 min-w-[140px] bg-slate-50 px-3 py-3 text-left font-semibold text-slate-700 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]">
                Tiêu chí
              </th>
              {listings.map((l) => (
                <th
                  key={l.id}
                  className="min-w-[180px] max-w-[220px] border-l border-slate-100 bg-slate-50 px-3 py-3 text-left align-top"
                >
                  <div className="relative mb-2 aspect-video overflow-hidden rounded-lg bg-slate-100">
                    {coverUrls[l.id] ? (
                      <Image
                        src={coverUrls[l.id]}
                        alt={l.title}
                        fill
                        className="object-cover"
                        sizes="200px"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-2xl text-slate-300">
                        🏠
                      </div>
                    )}
                  </div>
                  <div className="line-clamp-2 font-semibold text-slate-900">
                    {l.title}
                  </div>
                  <div className="mt-1 flex gap-1 overflow-x-auto">
                    {l.photos.slice(0, 4).map((p) => (
                      <div
                        key={p.id}
                        className="h-8 w-8 shrink-0 rounded bg-slate-200"
                        title={p.caption || undefined}
                      />
                    ))}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <Fragment key={group.title}>
                <tr>
                  <td
                    colSpan={listings.length + 1}
                    className="sticky left-0 bg-emerald-50 px-3 py-2 text-xs font-bold uppercase tracking-wide text-emerald-800"
                  >
                    {group.title}
                  </td>
                </tr>
                {group.rows.map((row) => {
                  const numericValues = listings.map((l) => {
                    const v = row.get(l);
                    return typeof v === "number" ? v : null;
                  });
                  return (
                    <tr key={row.label} className="border-t border-slate-100">
                      <td className="sticky left-0 z-10 bg-white px-3 py-2.5 font-medium text-slate-600 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">
                        {row.label}
                      </td>
                      {listings.map((l, i) => (
                        <td
                          key={l.id}
                          className={cn(
                            "border-l border-slate-50 px-3 py-2.5 whitespace-pre-wrap align-top",
                            row.better &&
                              row.numeric &&
                              highlightClass(numericValues, i, row.better)
                          )}
                        >
                          {formatCell(row, l)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
