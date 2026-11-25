import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getSettings, listAgents } from "@/lib/db";
import { AdminDashboard } from "@/components/AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }

  const agents = listAgents();
  const settings = getSettings();

  return (
    <AdminDashboard
      initialAgents={agents}
      initialSettings={settings}
      username={session.username}
    />
  );
}
