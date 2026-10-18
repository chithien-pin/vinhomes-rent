"use client";

import { formatVnd, parseVndInput } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

type Props = {
  label?: string;
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  placeholder?: string;
  error?: string;
  className?: string;
  disabled?: boolean;
};

export function MoneyInput({
  label,
  value,
  onChange,
  placeholder = "0",
  error,
  className,
  disabled,
}: Props) {
  const [text, setText] = useState(
    value != null ? formatVnd(value).replace(" đ", "") : ""
  );

  useEffect(() => {
    const parsed = parseVndInput(text);
    if (parsed !== (value ?? null)) {
      setText(value != null ? formatVnd(value).replace(" đ", "") : "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <label className={cn("flex flex-col gap-1 text-sm", className)}>
      {label && <span className="font-medium text-slate-700">{label}</span>}
      <div className="relative">
        <input
          inputMode="numeric"
          disabled={disabled}
          value={text}
          placeholder={placeholder}
          onChange={(e) => {
            const raw = e.target.value;
            setText(raw);
            onChange(parseVndInput(raw));
          }}
          onBlur={() => {
            if (value != null) {
              setText(formatVnd(value).replace(" đ", ""));
            }
          }}
          className={cn(
            "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 pr-10 text-slate-900 outline-none ring-emerald-500/30 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4",
            error && "border-rose-400"
          )}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
          đ
        </span>
      </div>
      {error && <span className="text-xs text-rose-600">{error}</span>}
    </label>
  );
}
