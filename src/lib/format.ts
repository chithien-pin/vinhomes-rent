/** Format integer VND with Vietnamese thousand separators, e.g. 15.400 đ */
export function formatVnd(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  const rounded = Math.round(value);
  const formatted = Math.abs(rounded)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${rounded < 0 ? "-" : ""}${formatted} đ`;
}

/** Format compact VND for cards, e.g. 8,5 triệu */
export function formatVndCompact(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  if (Math.abs(value) >= 1_000_000) {
    const mil = value / 1_000_000;
    const text =
      mil % 1 === 0
        ? mil.toFixed(0)
        : mil.toFixed(1).replace(".", ",");
    return `${text} triệu`;
  }
  return formatVnd(value);
}

export function formatArea(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `${value.toLocaleString("vi-VN")} m²`;
}

export function formatScore(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return value.toFixed(1);
}

/** Parse user-typed money string into integer VND (strips dots/spaces/đ) */
export function parseVndInput(raw: string): number | null {
  const cleaned = raw.replace(/[^\d]/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export function formatDateVi(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("vi-VN");
}
