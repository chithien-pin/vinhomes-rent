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

/** The Rainbow – Vinhomes Grand Park (cập nhật 08/2026) */
export const RAINBOW_DEFAULTS = {
  mgmtFeePerM2: 15400,
  bikeFee: 29455,
  motorbikeFee: 147273,
  carFee: 1227273,
  evChargeFee: 165000,
} as const;
