import { z } from "zod";

const optionalInt = z
  .union([z.number().int(), z.nan(), z.null(), z.undefined()])
  .transform((v) =>
    v == null || (typeof v === "number" && Number.isNaN(v)) ? null : v
  )
  .pipe(z.number().int().nullable())
  .optional()
  .nullable();

const optionalFloat = z
  .union([z.number(), z.nan(), z.null(), z.undefined()])
  .transform((v) =>
    v == null || (typeof v === "number" && Number.isNaN(v)) ? null : v
  )
  .pipe(z.number().nullable())
  .optional()
  .nullable();

const scoreField = z
  .union([z.number().int().min(1).max(5), z.null(), z.undefined()])
  .optional()
  .nullable();

export const listingPointSchema = z.object({
  id: z.string().optional(),
  kind: z.enum(["PRO", "CON"]),
  text: z.string(),
  sortOrder: z.number().int(),
});

export const extraFeeSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  amount: z.number().int().min(0),
  sortOrder: z.number().int(),
});

export const listingFormSchema = z.object({
  title: z.string().min(1, "Nhập tên gọi / ghi chú"),
  project: z.string().optional().nullable(),
  building: z.string().optional().nullable(),
  unitNumber: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  listingUrl: z
    .string()
    .refine((v) => !v || /^https?:\/\//i.test(v), {
      message: "Link phải bắt đầu bằng http(s)://",
    })
    .optional()
    .nullable(),
  contactName: z.string().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  viewedAt: z.string().optional().nullable(),
  status: z.enum(["INTERESTED", "VIEWED", "REJECTED", "CHOSEN"]),

  unitType: z.enum([
    "STUDIO",
    "ONE_BR",
    "ONE_BR_PLUS",
    "TWO_BR",
    "TWO_BR_PLUS",
    "THREE_BR",
    "OTHER",
  ]),
  unitTypeNote: z.string().optional().nullable(),
  netAreaM2: optionalFloat,
  grossAreaM2: optionalFloat,
  floor: optionalInt,
  doorDirection: z.string().optional().nullable(),
  balconyDirection: z.string().optional().nullable(),
  viewNote: z.string().optional().nullable(),
  bedrooms: optionalInt,
  bathrooms: optionalInt,
  furnishing: z.enum(["NONE", "BASIC", "FULL"]),
  furnitureItems: z.array(z.string()),
  contractType: z
    .enum(["OWNER", "AUTHORIZED", "LONG_TERM", "OTHER"])
    .optional()
    .nullable(),
  contractNote: z.string().optional().nullable(),
  minLeaseMonths: optionalInt,
  availableFrom: z.string().optional().nullable(),

  rentMonthly: optionalInt,
  depositMonths: optionalFloat,
  depositAmount: optionalInt,
  paymentCycle: z.enum(["MONTHLY", "QUARTERLY"]),
  brokerageFee: optionalInt,
  rentIncludesMgmt: z.boolean(),
  mgmtFeePerM2: optionalInt,
  mgmtFeeBasis: z.enum(["NET", "GROSS"]),

  bikeCount: z.number().int().min(0),
  bikeFee: optionalInt,
  motorbikeCount: z.number().int().min(0),
  motorbikeFee: optionalInt,
  carCount: z.number().int().min(0),
  carFee: optionalInt,
  evChargeCount: z.number().int().min(0),
  evChargeFee: optionalInt,

  electricityPerKwh: optionalInt,
  electricityKwhMonth: optionalFloat,
  waterPerM3: optionalInt,
  waterM3Month: optionalFloat,
  internetFee: optionalInt,
  tvFee: optionalInt,
  leaseMonths: optionalInt,

  scorePrice: scoreField,
  scoreLocation: scoreField,
  scoreLightView: scoreField,
  scoreFurniture: scoreField,
  scoreAmenities: scoreField,
  scoreSecurity: scoreField,
  scoreLandlord: scoreField,
  scoreOverall: scoreField,
  notes: z.string().optional().nullable(),

  points: z.array(listingPointSchema),
  extras: z.array(extraFeeSchema),
});

export type ListingFormValues = z.infer<typeof listingFormSchema>;

export const settingsFormSchema = z.object({
  weightPrice: z.number().int().min(0).max(100),
  weightLocation: z.number().int().min(0).max(100),
  weightLightView: z.number().int().min(0).max(100),
  weightFurniture: z.number().int().min(0).max(100),
  weightAmenities: z.number().int().min(0).max(100),
  weightSecurity: z.number().int().min(0).max(100),
  weightLandlord: z.number().int().min(0).max(100),
  weightOverall: z.number().int().min(0).max(100),
  defaultMgmtFeePerM2: z.number().int().min(0),
  defaultMgmtFeeBasis: z.enum(["NET", "GROSS"]),
  defaultBikeFee: z.number().int().min(0),
  defaultMotorbikeFee: z.number().int().min(0),
  defaultCarFee: z.number().int().min(0),
  defaultEvChargeFee: z.number().int().min(0),
  defaultElectricityPerKwh: optionalInt,
  defaultWaterPerM3: optionalInt,
  defaultLeaseMonths: z.number().int().min(1).max(120),
});

export type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export const photoMetaSchema = z.object({
  category: z
    .enum([
      "LIVING",
      "BEDROOM",
      "KITCHEN",
      "BATHROOM",
      "BALCONY_VIEW",
      "HALL_BUILDING",
      "DOCUMENTS",
      "OTHER",
    ])
    .default("OTHER"),
  caption: z.string().optional().nullable(),
  isCover: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});
