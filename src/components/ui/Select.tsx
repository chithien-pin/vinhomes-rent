import { cn } from "@/lib/utils";
import { SelectHTMLAttributes, forwardRef } from "react";

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
    placeholder?: string;
  }
>(function Select(
  { className, label, error, options, placeholder, id, ...props },
  ref
) {
  const inputId = id || props.name;
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label && <span className="font-medium text-slate-700">{label}</span>}
      <select
        ref={ref}
        id={inputId}
        className={cn(
          "h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-900 outline-none ring-emerald-500/30 focus:border-emerald-500 focus:ring-4",
          error && "border-rose-400",
          className
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-rose-600">{error}</span>}
    </label>
  );
});
