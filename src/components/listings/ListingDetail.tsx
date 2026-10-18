"use client";

import { CostBreakdown } from "@/components/listings/CostBreakdown";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StarRating } from "@/components/ui/StarRating";
import {
  CONTRACT_TYPE_LABELS,
  FURNISHING_LABELS,
  FURNITURE_ITEMS,
  LISTING_STATUS_COLORS,
  LISTING_STATUS_LABELS,
  PHOTO_CATEGORY_LABELS,
  SCORE_CRITERIA,
  STORAGE_BUCKET,
  UNIT_TYPE_LABELS,
} from "@/lib/constants";
import { formatArea, formatDateVi, formatScore, formatVnd } from "@/lib/format";
import type { EnrichedListing } from "@/lib/listings";
import { decimalToNumber } from "@/lib/listings";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Pencil, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 border-b border-slate-100 py-2 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-900">{value || "—"}</span>
    </div>
  );
}

export function ListingDetail({ listing }: { listing: EnrichedListing }) {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [lightbox, setLightbox] = useState(-1);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const entries: Record<string, string> = {};
      for (const p of listing.photos) {
        const { data } = await supabase.storage
          .from(STORAGE_BUCKET)
          .createSignedUrl(p.storagePath, 3600);
        if (data?.signedUrl) entries[p.id] = data.signedUrl;
      }
      if (!cancelled) setUrls(entries);
    })();
    return () => {
      cancelled = true;
    };
  }, [listing.photos]);

  const cover =
    listing.photos.find((p) => p.isCover) ?? listing.photos[0] ?? null;
  const furnitureLabels = FURNITURE_ITEMS.filter((f) =>
    listing.furnitureItems.includes(f.key)
  ).map((f) => f.label);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-slate-600">
          <ArrowLeft className="h-4 w-4" />
          Danh sách
        </Link>
        <Link href={`/listings/${listing.id}/edit`}>
          <Button size="sm">
            <Pencil className="h-3.5 w-3.5" />
            Sửa
          </Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="relative aspect-[16/10] bg-slate-100">
          {cover && urls[cover.id] ? (
            <Image
              src={urls[cover.id]}
              alt={listing.title}
              fill
              className="object-cover"
              sizes="100vw"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center text-5xl text-slate-300">
              🏠
            </div>
          )}
        </div>
        <div className="space-y-2 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={LISTING_STATUS_COLORS[listing.status]}>
              {LISTING_STATUS_LABELS[listing.status]}
            </Badge>
            <span className="inline-flex items-center gap-1 text-sm text-amber-600">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {formatScore(listing.weightedScore)}
            </span>
          </div>
          <h1 className="text-xl font-bold">{listing.title}</h1>
          <p className="text-sm text-slate-500">
            {[listing.project, listing.building, listing.unitNumber]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <div className="flex flex-wrap gap-4 pt-1">
            <div>
              <div className="text-xs text-slate-500">Giá thuê</div>
              <div className="text-lg font-bold text-emerald-700">
                {formatVnd(listing.rentMonthly)}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Tổng ước tính/tháng</div>
              <div className="text-lg font-bold text-slate-900">
                {formatVnd(listing.costs.estimatedMonthly)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {listing.photos.length > 0 && (
        <div>
          <h2 className="mb-2 font-semibold">Hình ảnh</h2>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {listing.photos.map((p, i) => (
              <button
                key={p.id}
                type="button"
                className="relative aspect-square overflow-hidden rounded-xl bg-slate-100"
                onClick={() => setLightbox(i)}
              >
                {urls[p.id] && (
                  <Image
                    src={urls[p.id]}
                    alt={p.caption || PHOTO_CATEGORY_LABELS[p.category]}
                    fill
                    className="object-cover"
                    sizes="120px"
                    unoptimized
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="mb-2 font-semibold">Thông tin căn</h2>
          <Row label="Loại căn" value={UNIT_TYPE_LABELS[listing.unitType]} />
          <Row label="Thông thủy" value={formatArea(decimalToNumber(listing.netAreaM2))} />
          <Row label="Tim tường" value={formatArea(decimalToNumber(listing.grossAreaM2))} />
          <Row label="Tầng" value={listing.floor} />
          <Row label="Hướng cửa" value={listing.doorDirection} />
          <Row label="Hướng ban công" value={listing.balconyDirection} />
          <Row label="View" value={listing.viewNote} />
          <Row label="PN / WC" value={`${listing.bedrooms ?? "—"} / ${listing.bathrooms ?? "—"}`} />
          <Row label="Nội thất" value={FURNISHING_LABELS[listing.furnishing]} />
          <Row label="Đồ có sẵn" value={furnitureLabels.join(", ") || "—"} />
          <Row
            label="Hợp đồng"
            value={
              listing.contractType
                ? CONTRACT_TYPE_LABELS[listing.contractType]
                : "—"
            }
          />
          <Row label="Ngày xem" value={formatDateVi(listing.viewedAt)} />
          <Row label="Liên hệ" value={[listing.contactName, listing.contactPhone].filter(Boolean).join(" · ")} />
          {listing.listingUrl && (
            <Row
              label="Tin đăng"
              value={
                <a
                  href={listing.listingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-700 underline"
                >
                  Mở link
                </a>
              }
            />
          )}
        </div>

        <CostBreakdown costs={listing.costs} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
          <h3 className="mb-2 font-semibold text-emerald-800">Ưu điểm</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
            {listing.points
              .filter((p) => p.kind === "PRO")
              .map((p) => (
                <li key={p.id}>{p.text}</li>
              ))}
            {listing.points.filter((p) => p.kind === "PRO").length === 0 && (
              <li className="list-none text-slate-400">Chưa có</li>
            )}
          </ul>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4">
          <h3 className="mb-2 font-semibold text-rose-800">Nhược điểm</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
            {listing.points
              .filter((p) => p.kind === "CON")
              .map((p) => (
                <li key={p.id}>{p.text}</li>
              ))}
            {listing.points.filter((p) => p.kind === "CON").length === 0 && (
              <li className="list-none text-slate-400">Chưa có</li>
            )}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="mb-3 font-semibold">Điểm số</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {SCORE_CRITERIA.map((c) => (
            <StarRating
              key={c.key}
              label={c.label}
              value={listing[c.key]}
              size="sm"
            />
          ))}
        </div>
        <p className="mt-3 text-sm text-slate-600">
          Điểm tổng (có trọng số):{" "}
          <strong>{formatScore(listing.weightedScore)}</strong>
        </p>
      </div>

      {listing.notes && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="mb-2 font-semibold">Ghi chú</h2>
          <p className="whitespace-pre-wrap text-sm text-slate-700">
            {listing.notes}
          </p>
        </div>
      )}

      <Lightbox
        open={lightbox >= 0}
        close={() => setLightbox(-1)}
        index={lightbox}
        slides={listing.photos
          .filter((p) => urls[p.id])
          .map((p) => ({
            src: urls[p.id],
            title: p.caption || PHOTO_CATEGORY_LABELS[p.category],
          }))}
        plugins={[Zoom]}
      />
    </div>
  );
}
