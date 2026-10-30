import type { CostBreakdown as Costs } from "@/lib/costs";
import { formatVnd } from "@/lib/format";

function Row({
  label,
  value,
  hint,
  strong,
}: {
  label: string;
  value: string;
  hint?: string;
  strong?: boolean;
}) {
  return (
    <div
      className={`flex items-start justify-between gap-3 py-2 ${
        strong ? "border-t border-slate-200 pt-3 font-semibold" : ""
      }`}
    >
      <div>
        <div className={strong ? "text-slate-900" : "text-slate-600"}>
          {label}
        </div>
        {hint && <div className="text-xs text-slate-400">{hint}</div>}
      </div>
      <div className={`shrink-0 tabular-nums ${strong ? "text-emerald-700" : ""}`}>
        {value}
      </div>
    </div>
  );
}

export function CostBreakdown({ costs }: { costs: Costs }) {
  const bill = costs.electricityBill;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm">
      <h3 className="mb-2 font-semibold text-slate-900">Phân tích chi phí</h3>
      <Row label="Giá thuê" value={formatVnd(costs.rent)} />
      <Row
        label="Phí quản lý"
        value={formatVnd(costs.mgmtFee)}
        hint={
          costs.mgmtFeeIncludedInRent
            ? "Đã gồm trong giá thuê"
            : "Cộng thêm vào tổng"
        }
      />
      <Row label="Gửi xe (tổng)" value={formatVnd(costs.parkingTotal)} />
      {(costs.parkingBike > 0 ||
        costs.parkingMotorbike > 0 ||
        costs.parkingCar > 0) && (
        <div className="mb-1 ml-3 space-y-1 border-l-2 border-slate-100 pl-3 text-xs text-slate-500">
          {costs.parkingBike > 0 && (
            <div>Xe đạp: {formatVnd(costs.parkingBike)}</div>
          )}
          {costs.parkingMotorbike > 0 && (
            <div>Xe máy: {formatVnd(costs.parkingMotorbike)}</div>
          )}
          {costs.parkingCar > 0 && (
            <div>Ô tô: {formatVnd(costs.parkingCar)}</div>
          )}
        </div>
      )}
      <Row label="Sạc xe điện" value={formatVnd(costs.evCharge)} />
      <Row label="Internet" value={formatVnd(costs.internet)} />
      <Row label="Truyền hình" value={formatVnd(costs.tv)} />
      {costs.extras.map((e) => (
        <Row key={e.name + e.amount} label={e.name} value={formatVnd(e.amount)} />
      ))}
      <Row
        label="Cố định / tháng"
        value={formatVnd(costs.fixedMonthly)}
        strong
      />
      <Row
        label="Điện (ước tính)"
        value={
          costs.electricityEstimated
            ? formatVnd(costs.electricity)
            : "Chưa ước tính"
        }
        hint={
          !costs.electricityEstimated
            ? "Nhập số kWh/tháng (để trống đơn giá = bậc thang NN)"
            : bill?.method === "tiered"
              ? `${bill.kwh} kWh · bậc thang + VAT 8%`
              : `${bill?.kwh ?? ""} kWh · đơn giá cố định`
        }
      />
      {bill?.method === "tiered" && bill.lines.length > 0 && (
        <div className="mb-2 ml-3 space-y-1 border-l-2 border-emerald-100 pl-3 text-xs text-slate-500">
          {bill.lines.map((line) => (
            <div key={line.label} className="flex justify-between gap-2">
              <span>
                {line.label}: {line.kwh} × {formatVnd(line.rate)}
              </span>
              <span className="tabular-nums">{formatVnd(line.amount)}</span>
            </div>
          ))}
          <div className="flex justify-between gap-2">
            <span>Chưa VAT</span>
            <span className="tabular-nums">{formatVnd(bill.subtotal)}</span>
          </div>
          {bill.includeVat && (
            <div className="flex justify-between gap-2">
              <span>VAT 8%</span>
              <span className="tabular-nums">{formatVnd(bill.vat)}</span>
            </div>
          )}
        </div>
      )}
      <Row
        label="Nước (ước tính)"
        value={
          costs.waterEstimated ? formatVnd(costs.water) : "Chưa ước tính"
        }
        hint={
          costs.waterEstimated
            ? `${formatVnd(costs.waterRate)}/m³`
            : "Nhập số m³/tháng (mặc định 6.700 đ/m³)"
        }
      />
      <Row
        label="Ước tính / tháng"
        value={formatVnd(costs.estimatedMonthly)}
        strong
      />
      <Row label="Tiền cọc" value={formatVnd(costs.deposit)} />
      <Row label="Phí môi giới" value={formatVnd(costs.brokerage)} />
      <Row
        label="Chi phí vào ở"
        value={formatVnd(costs.moveInCost)}
        hint="Cọc + tháng đầu + môi giới"
        strong
      />
      <Row
        label={`Cả HĐ (${costs.leaseMonths} tháng, cố định)`}
        value={formatVnd(costs.contractFixed)}
      />
      <Row
        label={`Cả HĐ (${costs.leaseMonths} tháng, có ĐN)`}
        value={formatVnd(costs.contractEstimated)}
        strong
      />
    </div>
  );
}
