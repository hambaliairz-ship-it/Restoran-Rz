import { getCategories, getMenuItems } from "./actions";
import { MenuManagement } from "./menu-management";

export const dynamic = "force-dynamic";

export default async function AdminMenuPage() {
  const [categories, menuItems] = await Promise.all([
    getCategories(),
    getMenuItems(),
  ]);

  return <MenuManagement categories={categories} menuItems={menuItems} />;
}
