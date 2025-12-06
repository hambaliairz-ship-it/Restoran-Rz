import { getIngredients, getStockTransactions } from "./actions";
import { StockContent } from "./stock-content";

export const dynamic = "force-dynamic";

export default async function StockPage() {
  const ingredients = await getIngredients();
  const transactions = await getStockTransactions();

  return <StockContent ingredients={ingredients} transactions={transactions} />;
}
