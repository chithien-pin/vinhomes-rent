import { CompareClient } from "@/components/compare/CompareClient";
import { requireAppUser } from "@/lib/auth";
import { enrichListing, listingInclude } from "@/lib/listings";
import { prisma } from "@/lib/prisma";

type Props = { searchParams: Promise<{ ids?: string }> };

export default async function ComparePage({ searchParams }: Props) {
  const user = await requireAppUser();
  const { ids: idsParam } = await searchParams;
  const ids = (idsParam || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);

  const all = await prisma.listing.findMany({
    where: { userId: user.id },
    include: listingInclude,
    orderBy: { updatedAt: "desc" },
  });

  const enriched = all.map((l) => enrichListing(l, user.settings!));
  const selected = ids.length
    ? enriched.filter((l) => ids.includes(l.id))
    : [];

  return (
    <CompareClient
      allListings={JSON.parse(JSON.stringify(enriched))}
      initialSelected={JSON.parse(JSON.stringify(selected))}
      initialIds={ids}
    />
  );
}
