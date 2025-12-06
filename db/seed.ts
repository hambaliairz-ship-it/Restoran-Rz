
import { db } from '@/db';
import { categories, menuItems, orders, orderItems, orderStatusEnum } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('🌱 Seeding database...');

  // 1. Create Categories
  console.log('Creating categories...');
  const insertedCategories = await db.insert(categories).values([
    { name: 'Makanan Utama', description: 'Hidangan utama yang mengenyangkan' },
    { name: 'Minuman', description: 'Minuman segar dan hangat' },
    { name: 'Camilan', description: 'Makanan ringan pelengkap' },
  ]).returning();

  const foodCat = insertedCategories.find(c => c.name === 'Makanan Utama');
  const drinkCat = insertedCategories.find(c => c.name === 'Minuman');

  // 2. Create Menu Items
  console.log('Creating menu items...');
  const insertedMenu = await db.insert(menuItems).values([
    {
      name: 'Nasi Goreng Spesial',
      description: 'Nasi goreng dengan telur, ayam, dan udang',
      price: '25000.00',
      categoryId: foodCat?.id,
      isAvailable: true,
      preparationTime: 15,
    },
    {
      name: 'Ayam Bakar Madu',
      description: 'Ayam bakar dengan olesan madu spesial',
      price: '30000.00',
      categoryId: foodCat?.id,
      isAvailable: true,
      preparationTime: 20,
    },
    {
      name: 'Es Teh Manis',
      description: 'Teh manis dingin segar',
      price: '5000.00',
      categoryId: drinkCat?.id,
      isAvailable: true,
      preparationTime: 5,
    },
    {
      name: 'Kopi Hitam',
      description: 'Kopi hitam robusta asli',
      price: '10000.00',
      categoryId: drinkCat?.id,
      isAvailable: true,
      preparationTime: 5,
    },
  ]).returning();

  // 3. Create Dummy Orders
  console.log('Creating dummy orders...');
  
  // Order 1: Pending
  const order1 = await db.insert(orders).values({
    orderNumber: 'ORD-001',
    customerName: 'Budi Santoso',
    tableNumber: '5',
    totalAmount: '55000.00',
    status: 'pending',
  }).returning();

  await db.insert(orderItems).values([
    {
      orderId: order1[0].id,
      menuItemId: insertedMenu[0].id, // Nasi Goreng
      quantity: 1,
      price: '25000.00',
      notes: 'Pedas banget',
    },
    {
      orderId: order1[0].id,
      menuItemId: insertedMenu[1].id, // Ayam Bakar
      quantity: 1,
      price: '30000.00',
    }
  ]);

  // Order 2: Preparing
  const order2 = await db.insert(orders).values({
    orderNumber: 'ORD-002',
    customerName: 'Siti Aminah',
    tableNumber: '2',
    totalAmount: '15000.00',
    status: 'preparing',
  }).returning();

  await db.insert(orderItems).values([
    {
      orderId: order2[0].id,
      menuItemId: insertedMenu[2].id, // Es Teh
      quantity: 3,
      price: '5000.00',
      notes: 'Es sedikit',
    }
  ]);

    // Order 3: Ready
  const order3 = await db.insert(orders).values({
    orderNumber: 'ORD-003',
    customerName: 'Rudi Hartono',
    tableNumber: '8',
    totalAmount: '25000.00',
    status: 'ready',
  }).returning();

  await db.insert(orderItems).values([
    {
      orderId: order3[0].id,
      menuItemId: insertedMenu[0].id, // Nasi Goreng
      quantity: 1,
      price: '25000.00',
    }
  ]);


  console.log('✅ Database seeded successfully!');
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
