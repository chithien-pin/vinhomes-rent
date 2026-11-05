import type {
  AreaBasis,
  ContractType,
  Furnishing,
  ListingStatus,
  PaymentCycle,
  PhotoCategory,
  UnitType,
} from "@prisma/client";

export const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  INTERESTED: "Quan tâm",
  VIEWED: "Đã xem",
  REJECTED: "Loại",
  CHOSEN: "Đã chốt",
};

export const LISTING_STATUS_COLORS: Record<ListingStatus, string> = {
  INTERESTED: "bg-sky-100 text-sky-800",
  VIEWED: "bg-amber-100 text-amber-800",
  REJECTED: "bg-rose-100 text-rose-800",
  CHOSEN: "bg-emerald-100 text-emerald-800",
};

export const UNIT_TYPE_LABELS: Record<UnitType, string> = {
  STUDIO: "Studio",
  ONE_BR: "1PN",
  ONE_BR_PLUS: "1PN+1",
  TWO_BR: "2PN",
  TWO_BR_PLUS: "2PN+",
  THREE_BR: "3PN",
  OTHER: "Khác",
};

export const FURNISHING_LABELS: Record<Furnishing, string> = {
  NONE: "Không",
  BASIC: "Cơ bản",
  FULL: "Đầy đủ",
};

export const AREA_BASIS_LABELS: Record<AreaBasis, string> = {
  NET: "Thông thủy",
  GROSS: "Tim tường",
};

export const PAYMENT_CYCLE_LABELS: Record<PaymentCycle, string> = {
  MONTHLY: "Theo tháng",
  QUARTERLY: "Theo quý",
};

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  OWNER: "Hợp đồng chính chủ",
  AUTHORIZED: "Ủy quyền",
  LONG_TERM: "Thuê dài hạn",
  OTHER: "Khác",
};

export const PHOTO_CATEGORY_LABELS: Record<PhotoCategory, string> = {
  LIVING: "Phòng khách",
  BEDROOM: "Phòng ngủ",
  KITCHEN: "Bếp",
  BATHROOM: "WC",
  BALCONY_VIEW: "Ban công/View",
  HALL_BUILDING: "Hành lang/Tòa nhà",
  DOCUMENTS: "Hợp đồng/Giấy tờ",
  OTHER: "Khác",
};

export const FURNITURE_ITEMS = [
  { key: "aircon", label: "Máy lạnh" },
  { key: "washer", label: "Máy giặt" },
  { key: "fridge", label: "Tủ lạnh" },
  { key: "stove", label: "Bếp" },
  { key: "waterHeater", label: "Nóng lạnh" },
  { key: "curtains", label: "Rèm" },
  { key: "bed", label: "Giường" },
  { key: "wardrobe", label: "Tủ quần áo" },
  { key: "sofa", label: "Sofa" },
  { key: "tv", label: "TV" },
  { key: "microwave", label: "Lò vi sóng" },
] as const;

export const DIRECTIONS = [
  "Đông",
  "Tây",
  "Nam",
  "Bắc",
  "Đông Bắc",
  "Đông Nam",
  "Tây Bắc",
  "Tây Nam",
] as const;

export const SCORE_CRITERIA = [
  { key: "scorePrice", weightKey: "weightPrice", label: "Giá" },
  { key: "scoreLocation", weightKey: "weightLocation", label: "Vị trí/di chuyển" },
  {
    key: "scoreLightView",
    weightKey: "weightLightView",
    label: "Ánh sáng & view",
  },
  { key: "scoreFurniture", weightKey: "weightFurniture", label: "Nội thất" },
  {
    key: "scoreAmenities",
    weightKey: "weightAmenities",
    label: "Tiện ích tòa nhà",
  },
  { key: "scoreSecurity", weightKey: "weightSecurity", label: "An ninh" },
  {
    key: "scoreLandlord",
    weightKey: "weightLandlord",
    label: "Chủ nhà/môi giới",
  },
  { key: "scoreOverall", weightKey: "weightOverall", label: "Cảm nhận chung" },
] as const;

export const MAX_PHOTOS_PER_LISTING = 20;
export const MAX_PHOTO_SIZE_MB = 1.5;
export const PHOTO_MAX_DIMENSION = 1600;
export const PHOTO_QUALITY = 0.8;

/** Đơn giá ô tô cũ, trước khi chốt 2 triệu/tháng */
export const LEGACY_CAR_FEE = 1_227_273;

/** Phí gửi ô tô, 2 triệu/tháng */
export const CAR_PARKING_MONTH = 2_000_000;

/**
 * Phí quản lý theo khu — đơn giá đ/m²/tháng, đã gồm VAT.
 * Mas không có mức cố định (tuỳ căn, có hỗ trợ).
 */
export const MGMT_ZONES = [
  {
    id: "beverly-solari",
    label: "Beverly Solari",
    perM2: 17380,
    note: null,
    aliases: ["beverly solari", "bevery solari", "bevery solary", "beverly solary"],
  },
  {
    id: "glory-height",
    label: "Glory Height",
    perM2: 18150,
    note: null,
    aliases: ["glory height", "glory heights"],
  },
  {
    id: "be",
    label: "BE",
    perM2: 22550,
    note: null,
    aliases: ["the beverly", "be"],
  },
  {
    id: "origami",
    label: "Origami",
    perM2: 8800,
    note: null,
    aliases: ["origami"],
  },
  {
    id: "rainbow",
    label: "Rainbow",
    perM2: 17000,
    note: null,
    aliases: ["rainbow"],
  },
  {
    id: "townhouse",
    label: "Nhà phố / Biệt thự / TMDV",
    perM2: 15400,
    note: null,
    aliases: ["nha pho", "biet thu", "tmdv"],
  },
  {
    id: "lumiere",
    label: "Lumiere / Masteri Centre Point",
    perM2: 20350,
    note: null,
    aliases: ["lumiere", "centre point", "center point"],
  },
  {
    id: "outside",
    label: "PQL ngoại khu",
    perM2: 8800,
    note: "Mức 8.800 đ/m² sẽ đổi từ năm 2027",
    aliases: ["ngoai khu"],
  },
  {
    id: "mas",
    label: "Masteri (Mas)",
    perM2: null,
    note: "Phí quản lý tuỳ căn, có hỗ trợ — nhập đơn giá của căn này",
    aliases: ["masteri", "mas"],
  },
  {
    id: "custom",
    label: "Nhập tay",
    perM2: null,
    note: null,
    aliases: [] as string[],
  },
] as const;

export type MgmtZoneId = (typeof MGMT_ZONES)[number]["id"];

export function mgmtZoneById(id: string | null | undefined) {
  return MGMT_ZONES.find((zone) => zone.id === id) ?? null;
}

function fold(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function hasAlias(haystack: string, alias: string) {
  const needle = fold(alias);
  if (!needle) return false;
  if (needle.length <= 3) {
    return new RegExp(`(^|\\s)${needle}(\\s|$)`).test(haystack);
  }
  return haystack.includes(needle);
}

function matchZoneByText(
  text: string,
  perM2: number | null | undefined
): MgmtZoneId | null {
  const haystack = fold(text);
  const hits = MGMT_ZONES.filter((zone) =>
    zone.aliases.some((alias) => hasAlias(haystack, alias))
  );
  if (perM2 != null) {
    const priced = hits.filter((zone) => zone.perM2 === perM2);
    if (priced.length === 1) return priced[0].id;
  }
  if (hits.length === 1) return hits[0].id;
  return null;
}

/** Chọn khu PQL đã lưu, hoặc đoán từ tên căn / đơn giá. */
export function inferMgmtZone(input: {
  mgmtZone?: string | null;
  mgmtFeePerM2?: number | null;
  title?: string | null;
  project?: string | null;
}): MgmtZoneId | null {
  if (input.mgmtZone && mgmtZoneById(input.mgmtZone)) {
    return input.mgmtZone as MgmtZoneId;
  }
  const named = matchZoneByText(
    `${input.title ?? ""} ${input.project ?? ""}`,
    input.mgmtFeePerM2
  );
  if (named) return named;
  if (input.mgmtFeePerM2 != null) {
    const byFee = MGMT_ZONES.filter((zone) => zone.perM2 === input.mgmtFeePerM2);
    if (byFee.length === 1) return byFee[0].id;
    return "custom";
  }
  return null;
}

export function mgmtZoneOptionLabel(zone: (typeof MGMT_ZONES)[number]) {
  if (zone.perM2 == null) {
    return zone.id === "mas" ? `${zone.label} — tuỳ căn, có hỗ trợ` : zone.label;
  }
  const price = zone.perM2.toLocaleString("vi-VN");
  const suffix = zone.id === "outside" ? " (đổi 2027)" : "";
  return `${zone.label} — ${price} đ/m²${suffix}`;
}

/** The Rainbow – Vinhomes Grand Park. PQL đã gồm VAT. */
export const RAINBOW_DEFAULTS = {
  mgmtFeePerM2: 17000,
  bikeFee: 29455,
  motorbikeFee: 147273,
  carFee: CAR_PARKING_MONTH,
  evChargeFee: 165000,
  /** Giá nước sinh hoạt mặc định (đ/m³, chưa VAT) */
  waterPerM3: 6700,
} as const;

/** VAT nước sinh hoạt */
export const WATER_VAT_RATE = 0.05;
