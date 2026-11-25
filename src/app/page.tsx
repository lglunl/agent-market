import { MarketClient } from "@/components/MarketClient";
import { getSettings, listAgents, listCategories } from "@/lib/db";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const agents = listAgents({ publishedOnly: true });
  const categories = listCategories(true);
  const settings = getSettings();

  return (
    <MarketClient
      initialAgents={agents}
      initialCategories={categories}
      settings={settings}
    />
  );
}
