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
  PAYMENT_CYCLE_LABELS,
  SCORE_CRITERIA,
  UNIT_TYPE_LABELS,
} from "@/lib/constants";
import { calculateCosts } from "@/lib/costs";
import { listingFormSchema, type ListingFormValues } from "@/lib/validators";
import type { ListingPhoto, UserSettings } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Copy, Plus, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";

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
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const [deleting, setDeleting] = useState(false);
  const skipFirst = useRef(true);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
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
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 1500);
    } catch {
      setSaveState("error");
    }
  }

  // Autosave draft every ~1s after changes
  useEffect(() => {
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }
    const timer = setTimeout(() => {
      const current = getValues();
      const parsed = listingFormSchema.safeParse(current);
      if (parsed.success) {
        void save(parsed.data);
      }
    }, 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

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

  return (
    <form
      onSubmit={handleSubmit(save)}
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
            <span className="text-rose-600">Lỗi lưu</span>
          )}
          <Button type="button" variant="outline" size="sm" onClick={duplicate}>
            <Copy className="h-3.5 w-3.5" />
            Nhân bản
          </Button>
        </div>
      </div>

      <h1 className="text-xl font-bold">Sửa căn hộ</h1>

      <Accordion title="a. Thông tin chung" defaultOpen>
        <Input label="Tên gọi / ghi chú *" {...register("title")} error={errors.title?.message} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Dự án" {...register("project")} />
          <Input label="Tòa / block" {...register("building")} />
          <Input label="Số căn" {...register("unitNumber")} />
          <Input label="Địa chỉ" {...register("address")} />
          <Input label="Link tin đăng" {...register("listingUrl")} />
          <Input label="Người liên hệ" {...register("contactName")} />
          <Input label="SĐT" {...register("contactPhone")} inputMode="tel" />
          <Input label="Ngày xem" type="date" {...register("viewedAt")} />
          <Select
            label="Trạng thái"
            options={Object.entries(LISTING_STATUS_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
            {...register("status")}
          />
        </div>
      </Accordion>

      <Accordion title="b. Thông tin căn">
        <div className="grid gap-3 sm:grid-cols-2">
          <Select
            label="Loại căn"
            options={Object.entries(UNIT_TYPE_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
            {...register("unitType")}
          />
          <Input label="Ghi chú loại căn" {...register("unitTypeNote")} />
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
                  field.onChange(
                    e.target.value === "" ? null : Number(e.target.value)
                  )
                }
              />
            )}
          />
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
          <Controller
            control={control}
            name="floor"
            render={({ field }) => (
              <Input
                label="Tầng"
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
          <Input label="View" {...register("viewNote")} />
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

      <Accordion title="c. Giá thuê & chi phí" defaultOpen>
        <div className="grid gap-3 sm:grid-cols-2">
          <Controller
            control={control}
            name="rentMonthly"
            render={({ field }) => (
              <MoneyInput
                label="Giá thuê / tháng"
                value={field.value}
                onChange={field.onChange}
              />
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
                  field.onChange(
                    e.target.value === "" ? null : Number(e.target.value)
                  )
                }
              />
            )}
          />
          <Controller
            control={control}
            name="depositAmount"
            render={({ field }) => (
              <MoneyInput
                label="Cọc (số tiền — ưu tiên hơn tháng)"
                value={field.value}
                onChange={field.onChange}
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
          <Controller
            control={control}
            name="brokerageFee"
            render={({ field }) => (
              <MoneyInput
                label="Phí môi giới"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <label className="flex items-center gap-2 self-end rounded-xl border border-slate-200 px-3 py-3 text-sm">
            <input type="checkbox" {...register("rentIncludesMgmt")} className="accent-emerald-600" />
            Giá thuê đã gồm phí quản lý
          </label>
          <Controller
            control={control}
            name="mgmtFeePerM2"
            render={({ field }) => (
              <MoneyInput
                label="Phí QL đ/m²/tháng"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Select
            label="Cơ sở tính QL"
            options={Object.entries(AREA_BASIS_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
            {...register("mgmtFeeBasis")}
          />
        </div>

        <p className="text-sm font-medium text-slate-700">Gửi xe / tháng</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {(
            [
              ["bikeCount", "bikeFee", "Xe đạp"],
              ["motorbikeCount", "motorbikeFee", "Xe máy"],
              ["carCount", "carFee", "Ô tô"],
            ] as const
          ).map(([countKey, feeKey, label]) => (
            <div key={countKey} className="space-y-2 rounded-xl border border-slate-100 p-3">
              <p className="text-xs font-medium text-slate-500">{label}</p>
              <Controller
                control={control}
                name={countKey}
                render={({ field }) => (
                  <Input
                    label="Số lượng"
                    type="number"
                    min={0}
                    value={field.value ?? 0}
                    onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                  />
                )}
              />
              <Controller
                control={control}
                name={feeKey}
                render={({ field }) => (
                  <MoneyInput
                    label="Đơn giá"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Controller
            control={control}
            name="evChargeCount"
            render={({ field }) => (
              <Input
                label="Số chỗ sạc xe điện"
                type="number"
                min={0}
                value={field.value ?? 0}
                onChange={(e) => field.onChange(Number(e.target.value) || 0)}
              />
            )}
          />
          <Controller
            control={control}
            name="evChargeFee"
            render={({ field }) => (
              <MoneyInput
                label="Phí sạc / chỗ"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="electricityPerKwh"
            render={({ field }) => (
              <MoneyInput
                label="Điện đ/kWh (để trống = bậc thang + VAT)"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="electricityKwhMonth"
            render={({ field }) => (
              <Input
                label="Ước tính kWh/tháng"
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
            name="waterPerM3"
            render={({ field }) => (
              <MoneyInput
                label="Nước đ/m³ (để trống = 6.700 + VAT 5%)"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="waterM3Month"
            render={({ field }) => (
              <Input
                label="Ước tính m³/tháng"
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
            name="internetFee"
            render={({ field }) => (
              <MoneyInput label="Internet" value={field.value} onChange={field.onChange} />
            )}
          />
          <Controller
            control={control}
            name="tvFee"
            render={({ field }) => (
              <MoneyInput label="Truyền hình" value={field.value} onChange={field.onChange} />
            )}
          />
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
        </div>

        <div className="space-y-2">
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

      <Accordion title="d. Ước tính tổng chi phí" defaultOpen>
        <CostBreakdown costs={costs} />
      </Accordion>

      <Accordion title="e. Ưu / nhược & chấm điểm">
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

      <Accordion title="f. Hình ảnh">
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
