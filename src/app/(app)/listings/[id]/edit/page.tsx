import { ListingForm } from "@/components/listings/ListingForm";
import { requireAppUser } from "@/lib/auth";
import { listingInclude, listingToFormValues } from "@/lib/listings";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function EditListingPage({ params }: Props) {
  const user = await requireAppUser();
  const { id } = await params;
  const listing = await prisma.listing.findFirst({
    where: { id, userId: user.id },
    include: listingInclude,
  });
  if (!listing) notFound();

  const formValues = listingToFormValues(listing);

  return (
    <ListingForm
      listingId={listing.id}
      userId={user.id}
      defaultValues={formValues}
      settings={user.settings!}
      photos={listing.photos}
    />
  );
}
