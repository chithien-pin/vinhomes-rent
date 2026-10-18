import { ListingDetail } from "@/components/listings/ListingDetail";
import { requireAppUser } from "@/lib/auth";
import { enrichListing, listingInclude } from "@/lib/listings";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function ListingDetailPage({ params }: Props) {
  const user = await requireAppUser();
  const { id } = await params;
  const listing = await prisma.listing.findFirst({
    where: { id, userId: user.id },
    include: listingInclude,
  });
  if (!listing) notFound();

  const enriched = enrichListing(listing, user.settings!);

  return (
    <ListingDetail listing={JSON.parse(JSON.stringify(enriched))} />
  );
}
