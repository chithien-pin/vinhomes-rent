import { SettingsForm } from "@/components/settings/SettingsForm";
import { requireAppUser } from "@/lib/auth";

export default async function SettingsPage() {
  const user = await requireAppUser();
  return <SettingsForm settings={user.settings!} />;
}
