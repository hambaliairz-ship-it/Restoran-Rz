import { getUnpaidOrders } from "./data";
import { CashierContent } from "./cashier-content";

export const dynamic = "force-dynamic";

export default async function CashierPage() {
  const unpaidOrders = await getUnpaidOrders();
  return <CashierContent unpaidOrders={unpaidOrders} />;
}
