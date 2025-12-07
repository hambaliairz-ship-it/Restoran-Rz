import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './db/schema';

// Neon database URL (production)
const NEON_URL = 'postgresql://neondb_owner:npg_lN5tUFJqrkn2@ep-misty-block-a1y7unp9-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

// Local database URL
const LOCAL_URL = 'postgresql://postgres:postgres@localhost:5432/postgres';

async function migrate() {
  console.log('Connecting to databases...');
  
  // Local DB
  const localDb = drizzle(LOCAL_URL, { schema });
  
  // Neon DB
  const sql = neon(NEON_URL);
  const neonDb = drizzleNeon(sql, { schema });

  try {
    // 1. Migrate users
    console.log('\n--- Migrating Users ---');
    const users = await localDb.select().from(schema.user);
    console.log(`Found ${users.length} users`);
    
    for (const u of users) {
      try {
        await neonDb.insert(schema.user).values(u).onConflictDoNothing();
        console.log(`✓ User: ${u.email}`);
      } catch (e: any) {
        console.log(`⚠ User ${u.email}: ${e.message}`);
      }
    }

    // 2. Migrate accounts (contains password hashes)
    console.log('\n--- Migrating Accounts ---');
    const accounts = await localDb.select().from(schema.account);
    console.log(`Found ${accounts.length} accounts`);
    
    for (const acc of accounts) {
      try {
        await neonDb.insert(schema.account).values(acc).onConflictDoNothing();
        console.log(`✓ Account: ${acc.id}`);
      } catch (e: any) {
        console.log(`⚠ Account ${acc.id}: ${e.message}`);
      }
    }

    // 3. Migrate categories
    console.log('\n--- Migrating Categories ---');
    const cats = await localDb.select().from(schema.categories);
    console.log(`Found ${cats.length} categories`);
    
    for (const cat of cats) {
      try {
        await neonDb.insert(schema.categories).values(cat).onConflictDoNothing();
        console.log(`✓ Category: ${cat.name}`);
      } catch (e: any) {
        console.log(`⚠ Category ${cat.name}: ${e.message}`);
      }
    }

    // 4. Migrate menu items
    console.log('\n--- Migrating Menu Items ---');
    const items = await localDb.select().from(schema.menuItems);
    console.log(`Found ${items.length} menu items`);
    
    for (const item of items) {
      try {
        await neonDb.insert(schema.menuItems).values(item).onConflictDoNothing();
        console.log(`✓ Menu: ${item.name}`);
      } catch (e: any) {
        console.log(`⚠ Menu ${item.name}: ${e.message}`);
      }
    }

    console.log('\n✅ Migration completed!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
  
  process.exit(0);
}

migrate();
