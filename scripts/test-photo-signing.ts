import assert from "node:assert/strict";
import {
  filterStoredPhotoPaths,
  parseRequestedPhotoPaths,
} from "../src/lib/photo-signing";

const storedUrl =
  "https://abc.private.blob.vercel-storage.com/listings/user-1/listing-1/photo-a.jpg";
const storedLegacyPath = "user-1/listing-1/photo-b.jpg";

assert.deepEqual(parseRequestedPhotoPaths(null), []);
assert.deepEqual(
  parseRequestedPhotoPaths([storedUrl, 42, "", storedLegacyPath, null]),
  [storedUrl, storedLegacyPath]
);

assert.deepEqual(
  filterStoredPhotoPaths(
    [
      storedUrl,
      "listings/user-1/listing-1/photo-a.jpg",
      storedUrl,
      "https://abc.private.blob.vercel-storage.com/listings/user-1/listing-1/other.jpg",
      storedLegacyPath,
    ],
    [storedUrl, storedLegacyPath]
  ),
  [storedUrl, storedLegacyPath]
);

console.log("OK - photo signing filters only stored paths");
