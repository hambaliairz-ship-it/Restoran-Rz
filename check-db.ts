
import { db } from '@/db';
import { menuItems, categories } from '@/db/schema';

async function checkData() {
  const items = await db.select().from(menuItems);
  const cats = await db.select().from(categories);
  console.log('Categories:', cats);
  console.log('Menu Items:', items);
}

checkData().catch(console.error).finally(() => process.exit());
