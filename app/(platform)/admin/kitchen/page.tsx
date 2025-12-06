import { getKitchenOrders } from "./actions";
import { KitchenContent } from "./kitchen-content";

export const dynamic = "force-dynamic";

export default async function KitchenPage() {
  const orders = await getKitchenOrders();
  return <KitchenContent orders={orders} />;
}
