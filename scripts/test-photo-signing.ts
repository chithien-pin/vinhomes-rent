import { filterSignablePhotoPaths } from "../src/app/api/photos/sign/route";

const storedUrl =
  "https://example.public.blob.vercel-storage.com/listings/admin/listing-1/photo-1.jpg";
const storedPath = "listings/admin/listing-1/photo-2.jpg";
const unrelatedPrivatePath = "exports/admin/secrets.csv";

const result = filterSignablePhotoPaths(
  [
    storedUrl,
    "listings/admin/listing-1/photo-1.jpg",
    storedPath,
    unrelatedPrivatePath,
  ],
  [storedUrl, storedPath]
);

console.assert(result.includes(storedUrl), "stored URL should be signable");
console.assert(
  result.includes("listings/admin/listing-1/photo-1.jpg"),
  "normalized stored URL path should be signable"
);
console.assert(result.includes(storedPath), "stored path should be signable");
console.assert(
  !result.includes(unrelatedPrivatePath),
  "unrelated private blob path must not be signable"
);

console.log("OK - photo signing authorization");
