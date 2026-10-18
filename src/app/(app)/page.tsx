import { HomeClient } from "@/components/listings/HomeClient";
import { requireAppUser } from "@/lib/auth";
import { enrichListing, listingInclude } from "@/lib/listings";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const user = await requireAppUser();
  const listings = await prisma.listing.findMany({
    where: { userId: user.id },
    include: listingInclude,
    orderBy: { updatedAt: "desc" },
  });

  const enriched = listings.map((l) => enrichListing(l, user.settings!));

  return (
    <HomeClient
      initialListings={JSON.parse(JSON.stringify(enriched))}
      email={user.email}
    />
  );
}
