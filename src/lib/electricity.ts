/**
 * Biểu giá điện sinh hoạt bậc thang (QĐ 1279/QĐ-BCT, hiệu lực từ 10/5/2025).
 * Đơn giá chưa gồm VAT.
 */
export const ELECTRICITY_TIERS = [
  { upTo: 50, rate: 1984, label: "Bậc 1 (0–50)" },
  { upTo: 100, rate: 2050, label: "Bậc 2 (51–100)" },
  { upTo: 200, rate: 2380, label: "Bậc 3 (101–200)" },
  { upTo: 300, rate: 2998, label: "Bậc 4 (201–300)" },
  { upTo: 400, rate: 3350, label: "Bậc 5 (301–400)" },
  { upTo: Infinity, rate: 3460, label: "Bậc 6 (≥401)" },
] as const;

export const ELECTRICITY_VAT_RATE = 0.08;

export type ElectricityTierLine = {
  label: string;
  kwh: number;
  rate: number;
  amount: number;
};

export type ElectricityBill = {
  kwh: number;
  lines: ElectricityTierLine[];
  subtotal: number;
  vat: number;
  total: number;
  includeVat: boolean;
  method: "tiered" | "flat";
};

/** Tính tiền điện theo bậc thang (làm tròn từng bậc tới đồng). */
export function calculateTieredElectricity(
  kwh: number,
  options?: { includeVat?: boolean }
): ElectricityBill {
  const includeVat = options?.includeVat ?? true;
  const usage = Math.max(0, kwh);
  const lines: ElectricityTierLine[] = [];
  let remaining = usage;
  let prevCap = 0;

  for (const tier of ELECTRICITY_TIERS) {
    if (remaining <= 0) break;
    const bandSize =
      tier.upTo === Infinity ? remaining : Math.min(remaining, tier.upTo - prevCap);
    if (bandSize > 0) {
      const amount = Math.round(bandSize * tier.rate);
      lines.push({
        label: tier.label,
        kwh: Math.round(bandSize * 10) / 10,
        rate: tier.rate,
        amount,
      });
      remaining -= bandSize;
    }
    prevCap = tier.upTo === Infinity ? prevCap : tier.upTo;
  }

  const subtotal = lines.reduce((s, l) => s + l.amount, 0);
  const vat = includeVat ? Math.round(subtotal * ELECTRICITY_VAT_RATE) : 0;

  return {
    kwh: usage,
    lines,
    subtotal,
    vat,
    total: subtotal + vat,
    includeVat,
    method: "tiered",
  };
}

export function calculateFlatElectricity(
  kwh: number,
  ratePerKwh: number
): ElectricityBill {
  const usage = Math.max(0, kwh);
  const subtotal = Math.round(usage * ratePerKwh);
  return {
    kwh: usage,
    lines: [
      {
        label: "Đơn giá cố định",
        kwh: usage,
        rate: ratePerKwh,
        amount: subtotal,
      },
    ],
    subtotal,
    vat: 0,
    total: subtotal,
    includeVat: false,
    method: "flat",
  };
}
