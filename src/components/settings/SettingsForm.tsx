"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { Select } from "@/components/ui/Select";
import { AREA_BASIS_LABELS, SCORE_CRITERIA } from "@/lib/constants";
import {
  settingsFormSchema,
  type SettingsFormValues,
} from "@/lib/validators";
import type { UserSettings } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

export function SettingsForm({ settings }: { settings: UserSettings }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const { register, control, handleSubmit } = useForm<SettingsFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(settingsFormSchema) as any,
    defaultValues: {
      weightPrice: settings.weightPrice,
      weightLocation: settings.weightLocation,
      weightLightView: settings.weightLightView,
      weightFurniture: settings.weightFurniture,
      weightAmenities: settings.weightAmenities,
      weightSecurity: settings.weightSecurity,
      weightLandlord: settings.weightLandlord,
      weightOverall: settings.weightOverall,
      defaultMgmtFeePerM2: settings.defaultMgmtFeePerM2,
      defaultMgmtFeeBasis: settings.defaultMgmtFeeBasis,
      defaultBikeFee: settings.defaultBikeFee,
      defaultMotorbikeFee: settings.defaultMotorbikeFee,
      defaultCarFee: settings.defaultCarFee,
      defaultEvChargeFee: settings.defaultEvChargeFee,
      defaultElectricityPerKwh: settings.defaultElectricityPerKwh,
      defaultWaterPerM3: settings.defaultWaterPerM3 ?? 6700,
      defaultLeaseMonths: settings.defaultLeaseMonths,
    },
  });

  async function onSubmit(data: SettingsFormValues) {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setMessage("Đã lưu cài đặt");
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Lỗi lưu");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h1 className="text-xl font-bold md:text-2xl">Cài đặt</h1>
        <p className="text-sm text-slate-500">
          Trọng số điểm, đơn giá mặc định (The Rainbow), số tháng thuê dự kiến
        </p>
      </div>

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="font-semibold">Trọng số chấm điểm</h2>
        <p className="text-xs text-slate-500">
          Điểm tổng = trung bình có trọng số các tiêu chí đã chấm. Tổng trọng số
          không cần = 100.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {SCORE_CRITERIA.map((c) => (
            <Input
              key={c.weightKey}
              type="number"
              min={0}
              max={100}
              label={c.label}
              {...register(c.weightKey, { valueAsNumber: true })}
            />
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="font-semibold">Đơn giá mặc định</h2>
        <p className="text-xs text-slate-500">
          Áp dụng khi tạo căn mới. Sửa tại đây không đổi các căn đã tạo (trừ khi
          ô trên căn để trống — lúc tính sẽ fallback về mặc định).
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Controller
            control={control}
            name="defaultMgmtFeePerM2"
            render={({ field }) => (
              <MoneyInput
                label="Phí QL đ/m²/tháng"
                value={field.value}
                onChange={(v) => field.onChange(v ?? 0)}
              />
            )}
          />
          <Select
            label="Cơ sở tính QL"
            options={Object.entries(AREA_BASIS_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
            {...register("defaultMgmtFeeBasis")}
          />
          <Controller
            control={control}
            name="defaultBikeFee"
            render={({ field }) => (
              <MoneyInput
                label="Xe đạp / tháng"
                value={field.value}
                onChange={(v) => field.onChange(v ?? 0)}
              />
            )}
          />
          <Controller
            control={control}
            name="defaultMotorbikeFee"
            render={({ field }) => (
              <MoneyInput
                label="Xe máy / tháng"
                value={field.value}
                onChange={(v) => field.onChange(v ?? 0)}
              />
            )}
          />
          <Controller
            control={control}
            name="defaultCarFee"
            render={({ field }) => (
              <MoneyInput
                label="Ô tô / tháng"
                value={field.value}
                onChange={(v) => field.onChange(v ?? 0)}
              />
            )}
          />
          <Controller
            control={control}
            name="defaultEvChargeFee"
            render={({ field }) => (
              <MoneyInput
                label="Sạc xe điện / tháng"
                value={field.value}
                onChange={(v) => field.onChange(v ?? 0)}
              />
            )}
          />
          <Controller
            control={control}
            name="defaultElectricityPerKwh"
            render={({ field }) => (
              <MoneyInput
                label="Điện đ/kWh (để trống = bậc thang NN + VAT 8%)"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="defaultWaterPerM3"
            render={({ field }) => (
              <MoneyInput
                label="Nước đ/m³ (mặc định 6.700)"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Input
            type="number"
            min={1}
            label="Số tháng thuê dự kiến"
            {...register("defaultLeaseMonths", { valueAsNumber: true })}
          />
          <div className="rounded-xl bg-slate-50 px-3 py-3 text-sm text-slate-600 sm:col-span-2">
            Điện để trống đơn giá → tính theo bậc thang sinh hoạt (QĐ 1279/QĐ-BCT)
            + VAT 8%. Đơn vị tiền: <strong>VND (đ)</strong>
          </div>
        </div>
      </section>

      {message && (
        <p className="text-sm text-emerald-700">{message}</p>
      )}

      <Button type="submit" loading={saving} className="w-full sm:w-auto">
        <Save className="h-4 w-4" />
        Lưu cài đặt
      </Button>
    </form>
  );
}
