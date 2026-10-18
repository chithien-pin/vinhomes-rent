"use client";

import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

export function StarRating({
  value,
  onChange,
  label,
  size = "md",
}: {
  value: number | null | undefined;
  onChange?: (value: number | null) => void;
  label?: string;
  size?: "sm" | "md";
}) {
  const iconSize = size === "sm" ? 16 : 22;
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <span className="text-sm font-medium text-slate-700">{label}</span>
      )}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => {
          const active = (value ?? 0) >= n;
          return (
            <button
              key={n}
              type="button"
              disabled={!onChange}
              onClick={() => {
                if (!onChange) return;
                onChange(value === n ? null : n);
              }}
              className={cn(
                "rounded-md p-0.5 transition",
                onChange && "hover:scale-110 active:scale-95"
              )}
              aria-label={`${n} sao`}
            >
              <Star
                size={iconSize}
                className={cn(
                  active
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-300"
                )}
              />
            </button>
          );
        })}
        {value != null && (
          <span className="ml-1 text-xs text-slate-500">{value}/5</span>
        )}
      </div>
    </div>
  );
}
