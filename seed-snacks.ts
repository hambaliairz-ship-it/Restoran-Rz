
import { db } from '@/db';
import { menuItems, categories } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function seedSnacks() {
  const cats = await db.select().from(categories).where(eq(categories.name, 'Camilan'));
  
  if (cats.length === 0) {
      console.error('Category "Camilan" not found');
      return;
  }

  const catId = cats[0].id;

  await db.insert(menuItems).values([
      {
          name: "Kentang Goreng",
          description: "Kentang goreng renyah dengan saus sambal.",
          price: "15000",
          imageUrl: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=500&q=80",
          categoryId: catId,
          isAvailable: true,
          preparationTime: 10
      },
      {
          name: "Pisang Bakar Coklat Keju",
          description: "Pisang bakar dengan topping melimpah.",
          price: "18000",
          imageUrl: "https://images.unsplash.com/photo-1528751014936-58d2f9d318d3?w=500&q=80",
          categoryId: catId,
          isAvailable: true,
          preparationTime: 15
      }
  ]);

  console.log('Snacks inserted successfully');
}

seedSnacks().catch(console.error).finally(() => process.exit());
