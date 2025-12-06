
import { db } from '@/db';
import { menuItems, categories } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function checkSnacks() {
  const cats = await db.select().from(categories).where(eq(categories.name, 'Camilan')); // Note: DB seems to have 'Camilan' vs 'Cemilan'
  
  if (cats.length === 0) {
      console.log('Category "Camilan" not found');
      const allCats = await db.select().from(categories);
      console.log('All Categories:', allCats.map(c => c.name));
      return;
  }

  const catId = cats[0].id;
  console.log('Category ID:', catId);

  const items = await db.select().from(menuItems).where(eq(menuItems.categoryId, catId));
  console.log('Items in Camilan:', items);
}

checkSnacks().catch(console.error).finally(() => process.exit());
