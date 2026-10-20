"use client";

import { Select } from "@/components/ui/Select";
import {
  MAX_PHOTOS_PER_LISTING,
  PHOTO_CATEGORY_LABELS,
} from "@/lib/constants";
import {
  compressImage,
  fetchSignedUrls,
  uploadListingPhotoFile,
  uploadWithRetry,
} from "@/lib/photos";
import { cn } from "@/lib/utils";
import type { ListingPhoto, PhotoCategory } from "@prisma/client";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Camera, ImagePlus, Star, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

type PhotoWithUrl = ListingPhoto & { url?: string | null };

function SortablePhoto({
  photo,
  onOpen,
  onDelete,
  onSetCover,
  onUpdate,
}: {
  photo: PhotoWithUrl;
  onOpen: () => void;
  onDelete: () => void;
  onSetCover: () => void;
  onUpdate: (patch: Partial<ListingPhoto>) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: photo.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className="overflow-hidden rounded-xl border border-slate-200 bg-white"
    >
      <div
        className="relative aspect-square cursor-grab bg-slate-100 active:cursor-grabbing"
        {...attributes}
        {...listeners}
        onDoubleClick={onOpen}
      >
        {photo.url ? (
          <Image
            src={photo.url}
            alt={photo.caption || "Ảnh căn"}
            fill
            className="object-cover"
            sizes="150px"
            unoptimized
            onClick={onOpen}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-300">
            …
          </div>
        )}
        {photo.isCover && (
          <span className="absolute left-1 top-1 rounded bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-white">
            Đại diện
          </span>
        )}
      </div>
      <div className="space-y-1.5 p-2">
        <Select
          value={photo.category}
          onChange={(e) =>
            onUpdate({ category: e.target.value as PhotoCategory })
          }
          options={Object.entries(PHOTO_CATEGORY_LABELS).map(
            ([value, label]) => ({ value, label })
          )}
          className="h-8 text-xs"
        />
        <input
          className="h-8 w-full rounded-lg border border-slate-200 px-2 text-xs"
          placeholder="Chú thích"
          defaultValue={photo.caption ?? ""}
          onBlur={(e) => onUpdate({ caption: e.target.value || null })}
        />
        <div className="flex gap-1">
          <button
            type="button"
            onClick={onSetCover}
            className={cn(
              "flex h-8 flex-1 items-center justify-center rounded-lg text-xs",
              photo.isCover ? "bg-amber-50 text-amber-700" : "bg-slate-50"
            )}
            title="Đặt làm đại diện"
          >
            <Star className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex h-8 flex-1 items-center justify-center rounded-lg bg-rose-50 text-rose-600"
            title="Xóa"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function PhotoManager({
  listingId,
  initialPhotos,
}: {
  listingId: string;
  userId?: string;
  initialPhotos: ListingPhoto[];
}) {
  const [photos, setPhotos] = useState<PhotoWithUrl[]>(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const loadUrls = useCallback(async (list: ListingPhoto[]) => {
    const urls = await fetchSignedUrls(list.map((p) => p.storagePath));
    setPhotos(
      list.map((p) => ({ ...p, url: urls[p.storagePath] ?? null }))
    );
  }, []);

  useEffect(() => {
    loadUrls(initialPhotos);
  }, [initialPhotos, loadUrls]);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    const remaining = MAX_PHOTOS_PER_LISTING - photos.length;
    if (remaining <= 0) {
      alert(`Tối đa ${MAX_PHOTOS_PER_LISTING} ảnh`);
      return;
    }
    const selected = Array.from(files).slice(0, remaining);
    setUploading(true);

    try {
      for (let i = 0; i < selected.length; i++) {
        const file = selected[i];
        setProgress(`Nén & tải ${i + 1}/${selected.length}…`);
        const compressed = await compressImage(file);
        await uploadWithRetry(() =>
          uploadListingPhotoFile({
            listingId,
            file: compressed,
            onProgress: (pct) =>
              setProgress(`Tải ${i + 1}/${selected.length}: ${pct}%`),
          })
        );
      }
      const refreshed = await fetch(`/api/listings/${listingId}`);
      const data = await refreshed.json();
      await loadUrls(data.listing.photos);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Upload lỗi — thử lại");
    } finally {
      setUploading(false);
      setProgress(null);
    }
  }

  async function patchPhoto(photoId: string, patch: Partial<ListingPhoto>) {
    const res = await fetch(`/api/listings/${listingId}/photos`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoId, patch }),
    });
    const data = await res.json();
    if (res.ok) await loadUrls(data.photos);
  }

  async function deletePhoto(photoId: string) {
    if (!confirm("Xóa ảnh này?")) return;
    const res = await fetch(`/api/listings/${listingId}/photos/${photoId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    }
  }

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = photos.findIndex((p) => p.id === active.id);
    const newIndex = photos.findIndex((p) => p.id === over.id);
    const next = arrayMove(photos, oldIndex, newIndex);
    setPhotos(next);
    await fetch(`/api/listings/${listingId}/photos`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order: next.map((p, i) => ({ id: p.id, sortOrder: i })),
      }),
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <label className="inline-flex cursor-pointer">
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={uploading}
            onChange={(e) => handleFiles(e.target.files)}
          />
          <span className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium">
            <ImagePlus className="h-4 w-4" />
            Chọn ảnh
          </span>
        </label>
        <label className="inline-flex cursor-pointer">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            disabled={uploading}
            onChange={(e) => handleFiles(e.target.files)}
          />
          <span className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium">
            <Camera className="h-4 w-4" />
            Chụp ảnh
          </span>
        </label>
      </div>
      {progress && (
        <p className="text-sm text-emerald-700">{progress}</p>
      )}
      <p className="text-xs text-slate-500">
        Tối đa {MAX_PHOTOS_PER_LISTING} ảnh · nén ~1600px · kéo để sắp xếp ·
        chạm đúp để xem lớn
      </p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={photos.map((p) => p.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {photos.map((photo, index) => (
              <SortablePhoto
                key={photo.id}
                photo={photo}
                onOpen={() => setLightboxIndex(index)}
                onDelete={() => deletePhoto(photo.id)}
                onSetCover={() => patchPhoto(photo.id, { isCover: true })}
                onUpdate={(patch) => patchPhoto(photo.id, patch)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {photos.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-400">
          Chưa có ảnh
        </div>
      )}

      <Lightbox
        open={lightboxIndex >= 0}
        close={() => setLightboxIndex(-1)}
        index={lightboxIndex}
        slides={photos
          .filter((p) => p.url)
          .map((p) => ({ src: p.url!, title: p.caption || undefined }))}
        plugins={[Zoom]}
        on={{ view: ({ index }) => setLightboxIndex(index) }}
        render={{
          buttonPrev: photos.length <= 1 ? () => null : undefined,
          buttonNext: photos.length <= 1 ? () => null : undefined,
        }}
      />

      {lightboxIndex >= 0 && (
        <button
          type="button"
          className="fixed right-4 top-4 z-[10000] rounded-full bg-black/50 p-2 text-white md:hidden"
          onClick={() => setLightboxIndex(-1)}
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
