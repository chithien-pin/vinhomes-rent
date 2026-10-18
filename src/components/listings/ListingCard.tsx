"use client";

import { Badge } from "@/components/ui/Badge";
import {
  LISTING_STATUS_COLORS,
  LISTING_STATUS_LABELS,
  UNIT_TYPE_LABELS,
} from "@/lib/constants";
import { formatArea, formatScore, formatVnd } from "@/lib/format";
import type { EnrichedListing } from "@/lib/listings";
import { decimalToNumber } from "@/lib/listings";
import { createClient } from "@/lib/supabase/client";
import { STORAGE_BUCKET } from "@/lib/constants";
import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export function ListingCard({
  listing,
  selected,
  onToggleSelect,
}: {
  listing: EnrichedListing;
  selected?: boolean;
  onToggleSelect?: () => void;
}) {
  const cover =
    listing.photos.find((p) => p.isCover) ?? listing.photos[0] ?? null;
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!cover) return;
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(cover.storagePath, 3600);
      if (!cancelled) setUrl(data?.signedUrl ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, [cover]);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative">
        <Link href={`/listings/${listing.id}`}>
          <div className="relative aspect-[16/10] bg-slate-100">
            {url ? (
              <Image
                src={url}
                alt={listing.title}
                fill
                className="object-cover"
                sizes="(max-width:768px) 100vw, 33vw"
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center text-4xl text-slate-300">
                🏠
              </div>
            )}
          </div>
        </Link>
        {onToggleSelect && (
          <label className="absolute left-3 top-3 flex cursor-pointer items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-medium shadow">
            <input
              type="checkbox"
              checked={!!selected}
              onChange={onToggleSelect}
              className="accent-emerald-600"
            />
            So sánh
          </label>
        )}
        <Badge
          className={`absolute right-3 top-3 ${LISTING_STATUS_COLORS[listing.status]}`}
        >
          {LISTING_STATUS_LABELS[listing.status]}
        </Badge>
      </div>

      <Link href={`/listings/${listing.id}`} className="block p-4">
        <h3 className="line-clamp-2 font-semibold text-slate-900">
          {listing.title}
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">
          {[listing.project, listing.building, listing.unitNumber]
            .filter(Boolean)
            .join(" · ") || "—"}
        </p>

        <div className="mt-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <div className="text-lg font-bold text-emerald-700">
              {formatVnd(listing.rentMonthly)}
              <span className="text-xs font-normal text-slate-500">/tháng</span>
            </div>
            <div className="text-xs text-slate-500">
              Tổng ước tính: {formatVnd(listing.costs.estimatedMonthly)}
            </div>
          </div>
          <div className="text-right text-xs text-slate-600">
            <div>
              {UNIT_TYPE_LABELS[listing.unitType]} ·{" "}
              {formatArea(decimalToNumber(listing.netAreaM2))}
            </div>
            <div className="mt-0.5 inline-flex items-center gap-0.5 font-medium text-amber-600">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {formatScore(listing.weightedScore)}
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
