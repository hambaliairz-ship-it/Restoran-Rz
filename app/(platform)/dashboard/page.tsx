import { getDashboardStats } from "./actions";
import { DashboardContent } from "./dashboard-content";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  return <DashboardContent stats={stats} />;
}
