"use client";

import { PhotoManager } from "@/components/photos/PhotoManager";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { Select } from "@/components/ui/Select";
import { StarRating } from "@/components/ui/StarRating";
import { Textarea } from "@/components/ui/Textarea";
import { CostBreakdown } from "@/components/listings/CostBreakdown";
import {
  AREA_BASIS_LABELS,
  CONTRACT_TYPE_LABELS,
  DIRECTIONS,
  FURNISHING_LABELS,
  FURNITURE_ITEMS,
  LISTING_STATUS_LABELS,
  MGMT_ZONES,
  PAYMENT_CYCLE_LABELS,
  SCORE_CRITERIA,
  UNIT_TYPE_LABELS,
  mgmtZoneById,
  mgmtZoneOptionLabel,
} from "@/lib/constants";
import { calculateCosts } from "@/lib/costs";
import { formatVnd } from "@/lib/format";
import { listingFormSchema, type ListingFormValues } from "@/lib/validators";
import type { ListingPhoto, UserSettings } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Copy, Plus, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";

const UNIT_BEDROOMS: Record<ListingFormValues["unitType"], number> = {
  STUDIO: 0,
  ONE_BR: 1,
  ONE_BR_PLUS: 1,
  TWO_BR: 2,
  TWO_BR_PLUS: 2,
  THREE_BR: 3,
  OTHER: 0,
};

const QUICK_FURNITURE = ["stove", "curtains", "aircon", "bed", "waterHeater"];

export function ListingForm({
  listingId,
  userId,
  defaultValues,
  settings,
  photos,
}: {
  listingId: string;
  userId: string;
  defaultValues: ListingFormValues;
  settings: UserSettings;
  photos: ListingPhoto[];
}) {
  const router = useRouter();
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "error" | "invalid"
  >("idle");
  const [deleting, setDeleting] = useState(false);
  const [editRate, setEditRate] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors, isDirty },
  } = useForm<ListingFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(listingFormSchema) as any,
    defaultValues,
  });

  const points = useFieldArray({ control, name: "points" });
  const extras = useFieldArray({ control, name: "extras" });
  const values = watch();

  const costs = useMemo(
    () =>
      calculateCosts(
        {
          rentMonthly: values.rentMonthly ?? null,
          depositMonths: values.depositMonths ?? null,
          depositAmount: values.depositAmount ?? null,
          brokerageFee: values.brokerageFee ?? null,
          rentIncludesMgmt: values.rentIncludesMgmt ?? false,
          mgmtFeePerM2: values.mgmtFeePerM2 ?? null,
          mgmtFeeBasis: values.mgmtFeeBasis ?? "NET",
          netAreaM2: values.netAreaM2 ?? null,
          grossAreaM2: values.grossAreaM2 ?? null,
          bikeCount: values.bikeCount ?? 0,
          bikeFee: values.bikeFee ?? null,
          motorbikeCount: values.motorbikeCount ?? 0,
          motorbikeFee: values.motorbikeFee ?? null,
          carCount: values.carCount ?? 0,
          carFee: values.carFee ?? null,
          evChargeCount: values.evChargeCount ?? 0,
          evChargeFee: values.evChargeFee ?? null,
          electricityPerKwh: values.electricityPerKwh ?? null,
          electricityKwhMonth: values.electricityKwhMonth ?? null,
          waterPerM3: values.waterPerM3 ?? null,
          waterM3Month: values.waterM3Month ?? null,
          internetFee: values.internetFee ?? null,
          tvFee: values.tvFee ?? null,
          leaseMonths: values.leaseMonths ?? null,
          extras: (values.extras ?? []).map((e) => ({
            name: e.name,
            amount: e.amount,
          })),
        },
        settings
      ),
    [values, settings]
  );

  async function save(data: ListingFormValues) {
    setSaveState("saving");
    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Lỗi lưu");
      reset(data);
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    } catch {
      setSaveState("error");
    }
  }

  async function duplicate() {
    const res = await fetch(`/api/listings/${listingId}/duplicate`, {
      method: "POST",
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error);
      return;
    }
    router.push(`/listings/${data.listing.id}/edit`);
  }

  async function remove() {
    if (!confirm("Xóa căn này? Không hoàn tác được.")) return;
    setDeleting(true);
    const res = await fetch(`/api/listings/${listingId}`, { method: "DELETE" });
    if (res.ok) router.push("/");
    else {
      setDeleting(false);
      alert("Không xóa được");
    }
  }

  const furniture = values.furnitureItems ?? [];
  const mgmtZone = mgmtZoneById(values.mgmtZone);
  const tableRate = mgmtZone?.perM2 ?? null;
  const savedRate = values.mgmtFeePerM2 ?? null;
  const rateDiffers = tableRate != null && savedRate !== tableRate;
  const showRateInput = mgmtZone != null && (tableRate == null || rateDiffers || editRate);
  const areaBasisLabel = values.mgmtFeeBasis === "GROSS" ? "tim tường" : "thông thủy";

  function selectZone(id: string) {
    setEditRate(false);
    if (!id) {
      setValue("mgmtZone", null, { shouldDirty: true });
      return;
    }
    setValue("mgmtZone", id, { shouldDirty: true });
    const zone = mgmtZoneById(id);
    if (zone?.perM2 != null) {
      setValue("mgmtFeePerM2", zone.perM2, { shouldDirty: true });
    }
    const project = getValues("project")?.trim() ?? "";
    const knownNames = new Set([
      ...MGMT_ZONES.map((item) => item.label),
      "Masteri",
      "Bevery Solari",
      "Beverly Solari",
    ]);
    if (!project || knownNames.has(project)) {
      const next =
        id === "mas" ? "Masteri" : id === "custom" ? "" : (zone?.label ?? "");
      if (next !== project) setValue("project", next, { shouldDirty: true });
    }
    const title = getValues("title")?.trim() ?? "";
    if (!title || title === "Căn mới") {
      const nextTitle = id === "mas" ? "Masteri" : zone?.label;
      if (nextTitle && id !== "custom") {
        setValue("title", nextTitle, { shouldDirty: true });
      }
    }
  }

  function selectUnitType(unitType: ListingFormValues["unitType"]) {
    setValue("unitType", unitType, { shouldDirty: true });
    const beds = UNIT_BEDROOMS[unitType];
    if (unitType !== "OTHER") setValue("bedrooms", beds, { shouldDirty: true });
  }

  function toggleFurniture(key: string) {
    const checked = furniture.includes(key);
    const next = checked
      ? furniture.filter((item) => item !== key)
      : [...furniture, key];
    setValue("furnitureItems", next, { shouldDirty: true });
    if (!checked && getValues("furnishing") === "NONE") {
      setValue("furnishing", "BASIC", { shouldDirty: true });
    }
  }

  return (
    <form
      onSubmit={handleSubmit(save, () => setSaveState("invalid"))}
      className="space-y-3 pb-28"
    >
      <div className="flex items-center justify-between gap-2">
        <Link
          href={`/listings/${listingId}`}
          className="inline-flex items-center gap-1 text-sm text-slate-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Chi tiết
        </Link>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          {saveState === "saving" && "Đang lưu…"}
          {saveState === "saved" && (
            <span className="text-emerald-600">Đã lưu</span>
          )}
          {saveState === "error" && (
            <span className="text-rose-600">Không lưu được</span>
          )}
          {saveState === "invalid" && (
            <span className="text-rose-600">Kiểm tra ô bắt buộc</span>
          )}
          {saveState === "idle" && isDirty && (
            <span className="text-amber-700">Chưa lưu</span>
          )}
          <Button type="button" variant="outline" size="sm" onClick={duplicate}>
            <Copy className="h-3.5 w-3.5" />
            Nhân bản
          </Button>
        </div>
      </div>

      <h1 className="text-xl font-bold">Sửa căn hộ</h1>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
        <Input label="Tên gọi *" {...register("title")} error={errors.title?.message} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Select
            label="Khu — phí quản lý (đã gồm VAT)"
            options={[
              { value: "", label: "Chọn khu" },
              ...MGMT_ZONES.map((zone) => ({
                value: zone.id,
                label: mgmtZoneOptionLabel(zone),
              })),
            ]}
            value={values.mgmtZone ?? ""}
            onChange={(e) => selectZone(e.target.value)}
          />
          <Select
            label="Trạng thái"
            options={Object.entries(LISTING_STATUS_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
            {...register("status")}
          />
          <Input label="Tòa / block" {...register("building")} />
          <Controller
            control={control}
            name="floor"
            render={({ field }) => (
              <Input
                label="Tầng"
                type="number"
                value={field.value ?? ""}
                onChange={(e) =>
                  field.onChange(e.target.value === "" ? null : Number(e.target.value))
                }
              />
            )}
          />
          <Select
            label="Loại căn"
            options={Object.entries(UNIT_TYPE_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
            value={values.unitType}
            onChange={(e) =>
              selectUnitType(e.target.value as ListingFormValues["unitType"])
            }
          />
          <Controller
            control={control}
            name="netAreaM2"
            render={({ field }) => (
              <Input
                label="Diện tích thông thủy (m²)"
                type="number"
                step="0.01"
                value={field.value ?? ""}
                onChange={(e) =>
                  field.onChange(e.target.value === "" ? null : Number(e.target.value))
                }
              />
            )}
          />
        </div>
        {!mgmtZone && (
          <p className="-mt-2 text-xs text-slate-500">
            Chọn khu để điền phí quản lý. Masteri nhập đơn giá của căn.
          </p>
        )}
        {mgmtZone?.note && <p className="-mt-2 text-xs text-slate-500">{mgmtZone.note}</p>}
        {tableRate != null && !rateDiffers && !editRate && (
          <div className="-mt-2 flex items-center justify-between gap-2 text-xs text-slate-500">
            <span>
              {formatVnd(tableRate)}/m² × {areaBasisLabel} · đã gồm VAT
            </span>
            <button
              type="button"
              className="font-medium text-emerald-700"
              onClick={() => setEditRate(true)}
            >
              Nhập đơn giá khác
            </button>
          </div>
        )}
        {rateDiffers && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">
            <span>
              Bảng {mgmtZone?.label} là {formatVnd(tableRate)}/m². Căn này đang để{" "}
              {formatVnd(savedRate)}/m².
            </span>
            <button
              type="button"
              className="font-medium text-emerald-700"
              onClick={() => {
                if (tableRate == null) return;
                setEditRate(false);
                setValue("mgmtFeePerM2", tableRate, { shouldDirty: true });
              }}
            >
              Dùng {formatVnd(tableRate)}
            </button>
          </div>
        )}
        {showRateInput && (
          <Controller
            control={control}
            name="mgmtFeePerM2"
            render={({ field }) => (
              <MoneyInput
                label={
                  mgmtZone?.id === "mas"
                    ? "Đơn giá căn này (đ/m², đã gồm VAT)"
                    : "Đơn giá (đ/m², đã gồm VAT)"
                }
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        )}

        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Số WC</p>
          <div className="flex gap-2">
            {[1, 2].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setValue("bathrooms", count, { shouldDirty: true })}
                className={`h-10 flex-1 rounded-xl border text-sm ${
                  values.bathrooms === count
                    ? "border-emerald-600 bg-emerald-50 font-medium text-emerald-800"
                    : "border-slate-200 text-slate-700"
                }`}
              >
                {count} WC
              </button>
            ))}
          </div>
        </div>

        <Input label="View" {...register("viewNote")} placeholder="Nội khu" />

        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Nội thất</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_FURNITURE.map((key) => {
              const item = FURNITURE_ITEMS.find((entry) => entry.key === key);
              if (!item) return null;
              const checked = furniture.includes(item.key);
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => toggleFurniture(item.key)}
                  className={`rounded-full border px-3 py-1.5 text-sm ${
                    checked
                      ? "border-emerald-600 bg-emerald-50 font-medium text-emerald-800"
                      : "border-slate-200 text-slate-700"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Controller
            control={control}
            name="rentMonthly"
            render={({ field }) => (
              <MoneyInput label="Giá thuê / tháng" value={field.value} onChange={field.onChange} />
            )}
          />
          <Controller
            control={control}
            name="depositMonths"
            render={({ field }) => (
              <Input
                label="Cọc (số tháng)"
                type="number"
                step="0.5"
                value={field.value ?? ""}
                onChange={(e) =>
                  field.onChange(e.target.value === "" ? null : Number(e.target.value))
                }
              />
            )}
          />
        </div>
        <p className="-mt-2 text-sm text-slate-600">
          Tiền cọc{" "}
          <span className="font-medium text-slate-900">
            {formatVnd(
              values.depositMonths != null && values.rentMonthly != null
                ? Math.round(values.depositMonths * values.rentMonthly)
                : null
            )}
          </span>
        </p>

        <Controller
          control={control}
          name="motorbikeCount"
          render={({ field }) => (
            <QtyStepper
              label="Xe máy"
              hint={`${formatVnd(values.motorbikeFee ?? settings.defaultMotorbikeFee)}/tháng`}
              value={field.value ?? 0}
              onChange={field.onChange}
            />
          )}
        />

        <div className="grid gap-3 sm:grid-cols-3">
          <Controller
            control={control}
            name="electricityKwhMonth"
            render={({ field }) => (
              <Input
                label="Điện (kWh/tháng)"
                type="number"
                value={field.value ?? ""}
                onChange={(e) =>
                  field.onChange(e.target.value === "" ? null : Number(e.target.value))
                }
              />
            )}
          />
          <Controller
            control={control}
            name="waterM3Month"
            render={({ field }) => (
              <Input
                label="Nước (m³/tháng)"
                type="number"
                value={field.value ?? ""}
                onChange={(e) =>
                  field.onChange(e.target.value === "" ? null : Number(e.target.value))
                }
              />
            )}
          />
          <Controller
            control={control}
            name="internetFee"
            render={({ field }) => (
              <MoneyInput label="Internet" value={field.value} onChange={field.onChange} />
            )}
          />
        </div>

        <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-3">
          <div>
            <p className="text-xs text-emerald-800">Ước tính / tháng</p>
            <p className="text-lg font-semibold text-emerald-950">
              {formatVnd(costs.estimatedMonthly)}
            </p>
          </div>
          <p className="text-right text-xs text-emerald-800">
            Cọc {formatVnd(costs.deposit)}
          </p>
        </div>
      </section>

      <Accordion title="Chi tiết căn">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Dự án" {...register("project")} />
          <Input label="Số căn" {...register("unitNumber")} />
          <Input label="Ghi chú loại căn" {...register("unitTypeNote")} />
          <Controller
            control={control}
            name="grossAreaM2"
            render={({ field }) => (
              <Input
                label="Diện tích tim tường (m²)"
                type="number"
                step="0.01"
                value={field.value ?? ""}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === "" ? null : Number(e.target.value)
                  )
                }
              />
            )}
          />
          <Select
            label="Hướng cửa chính"
            placeholder="—"
            options={DIRECTIONS.map((d) => ({ value: d, label: d }))}
            {...register("doorDirection")}
          />
          <Select
            label="Hướng ban công"
            placeholder="—"
            options={DIRECTIONS.map((d) => ({ value: d, label: d }))}
            {...register("balconyDirection")}
          />
          <Input label="Địa chỉ" {...register("address")} />
          <Input label="Link tin đăng" {...register("listingUrl")} />
          <Input label="Người liên hệ" {...register("contactName")} />
          <Input label="SĐT" {...register("contactPhone")} inputMode="tel" />
          <Input label="Ngày xem" type="date" {...register("viewedAt")} />
          <Controller
            control={control}
            name="bedrooms"
            render={({ field }) => (
              <Input
                label="Số PN"
                type="number"
                value={field.value ?? ""}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === "" ? null : Number(e.target.value)
                  )
                }
              />
            )}
          />
          <Controller
            control={control}
            name="bathrooms"
            render={({ field }) => (
              <Input
                label="Số WC"
                type="number"
                value={field.value ?? ""}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === "" ? null : Number(e.target.value)
                  )
                }
              />
            )}
          />
          <Select
            label="Nội thất"
            options={Object.entries(FURNISHING_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
            {...register("furnishing")}
          />
          <Select
            label="Loại HĐ thuê"
            placeholder="—"
            options={Object.entries(CONTRACT_TYPE_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
            {...register("contractType")}
          />
          <Input label="Ghi chú HĐ" {...register("contractNote")} />
          <Controller
            control={control}
            name="minLeaseMonths"
            render={({ field }) => (
              <Input
                label="Thuê tối thiểu (tháng)"
                type="number"
                value={field.value ?? ""}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === "" ? null : Number(e.target.value)
                  )
                }
              />
            )}
          />
          <Input label="Ngày có thể dọn vào" type="date" {...register("availableFrom")} />
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">
            Checklist nội thất
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {FURNITURE_ITEMS.map((item) => {
              const checked = furniture.includes(item.key);
              return (
                <label
                  key={item.key}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      const next = checked
                        ? furniture.filter((k) => k !== item.key)
                        : [...furniture, item.key];
                      setValue("furnitureItems", next, { shouldDirty: true });
                    }}
                    className="accent-emerald-600"
                  />
                  {item.label}
                </label>
              );
            })}
          </div>
        </div>
      </Accordion>

      <Accordion title="Chi phí khác">
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-sm">
          <input type="checkbox" {...register("rentIncludesMgmt")} className="accent-emerald-600" />
          Giá thuê đã gồm phí quản lý
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <Controller
            control={control}
            name="leaseMonths"
            render={({ field }) => (
              <Input
                label="Số tháng thuê dự kiến"
                type="number"
                value={field.value ?? ""}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === "" ? null : Number(e.target.value)
                  )
                }
              />
            )}
          />
          <Select
            label="Thanh toán"
            options={Object.entries(PAYMENT_CYCLE_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
            {...register("paymentCycle")}
          />
          <Select
            label="Cơ sở tính phí quản lý"
            options={Object.entries(AREA_BASIS_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
            {...register("mgmtFeeBasis")}
          />
          <Controller
            control={control}
            name="motorbikeFee"
            render={({ field }) => (
              <MoneyInput label="Đơn giá xe máy" value={field.value} onChange={field.onChange} />
            )}
          />
        </div>

        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Phí khác</p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                extras.append({ name: "", amount: 0, sortOrder: extras.fields.length })
              }
            >
              <Plus className="h-3.5 w-3.5" />
              Thêm dòng
            </Button>
          </div>
          {extras.fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <Input
                placeholder="Tên phí"
                className="flex-1"
                {...register(`extras.${index}.name`)}
              />
              <Controller
                control={control}
                name={`extras.${index}.amount`}
                render={({ field: f }) => (
                  <MoneyInput
                    className="w-36"
                    value={f.value}
                    onChange={f.onChange}
                  />
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => extras.remove(index)}
              >
                <Trash2 className="h-4 w-4 text-rose-500" />
              </Button>
            </div>
          ))}
        </div>
      </Accordion>

      <Accordion title="Ước tính chi phí">
        <CostBreakdown costs={costs} />
      </Accordion>

      <Accordion title="Ưu / nhược & chấm điểm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-emerald-700">Ưu điểm</p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  points.append({
                    kind: "PRO",
                    text: "",
                    sortOrder: points.fields.length,
                  })
                }
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
            {points.fields.map((field, index) =>
              watch(`points.${index}.kind`) === "PRO" ? (
                <div key={field.id} className="flex gap-2">
                  <Input {...register(`points.${index}.text`)} placeholder="Ưu điểm" />
                  <Button type="button" variant="ghost" size="sm" onClick={() => points.remove(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : null
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-rose-700">Nhược điểm</p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  points.append({
                    kind: "CON",
                    text: "",
                    sortOrder: points.fields.length,
                  })
                }
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
            {points.fields.map((field, index) =>
              watch(`points.${index}.kind`) === "CON" ? (
                <div key={field.id} className="flex gap-2">
                  <Input {...register(`points.${index}.text`)} placeholder="Nhược điểm" />
                  <Button type="button" variant="ghost" size="sm" onClick={() => points.remove(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : null
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {SCORE_CRITERIA.map((c) => (
            <Controller
              key={c.key}
              control={control}
              name={c.key}
              render={({ field }) => (
                <StarRating
                  label={c.label}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          ))}
        </div>
        <Textarea label="Ghi chú tự do" {...register("notes")} rows={4} />
      </Accordion>

      <Accordion title="Hình ảnh">
        <PhotoManager
          listingId={listingId}
          userId={userId}
          initialPhotos={photos}
        />
      </Accordion>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:static md:border-0 md:bg-transparent md:p-0">
        <div className="mx-auto flex max-w-6xl gap-2">
          <Button
            type="button"
            variant="danger"
            className="shrink-0"
            loading={deleting}
            onClick={remove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            type="submit"
            className="flex-1"
            loading={saveState === "saving"}
          >
            <Save className="h-4 w-4" />
            Lưu
          </Button>
        </div>
      </div>
    </form>
  );
}

function QtyStepper({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 px-3 py-2">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-800">{label}</p>
        <p className="truncate text-xs text-slate-500">{hint}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          aria-label={`Giảm ${label}`}
          className="h-9 w-9 rounded-lg border border-slate-200 text-lg leading-none text-slate-700"
          onClick={() => onChange(Math.max(0, value - 1))}
        >
          −
        </button>
        <span className="w-5 text-center text-sm tabular-nums">{value}</span>
        <button
          type="button"
          aria-label={`Tăng ${label}`}
          className="h-9 w-9 rounded-lg border border-slate-200 text-lg leading-none text-slate-700"
          onClick={() => onChange(value + 1)}
        >
          +
        </button>
      </div>
    </div>
  );
}
