import 'dotenv/config';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { parse } from 'dotenv';
import pg from 'pg';

// Load .env.local
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envConfig = parse(fs.readFileSync(envLocalPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL tidak ditemukan di environment variables');
  process.exit(1);
}

async function checkDatabaseConnection(): Promise<boolean> {
  const client = new pg.Client({ connectionString: databaseUrl });
  try {
    await client.connect();
    await client.query('SELECT 1');
    await client.end();
    return true;
  } catch {
    return false;
  }
}

async function checkTablesExist(): Promise<boolean> {
  const client = new pg.Client({ connectionString: databaseUrl });
  try {
    await client.connect();
    const result = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'categories'
      );
    `);
    await client.end();
    return result.rows[0].exists;
  } catch {
    return false;
  }
}

async function waitForDatabase(maxRetries = 10, delay = 2000): Promise<boolean> {
  console.log('🔄 Menunggu koneksi database...');
  
  for (let i = 0; i < maxRetries; i++) {
    const connected = await checkDatabaseConnection();
    if (connected) {
      console.log('✅ Database terhubung!');
      return true;
    }
    console.log(`   Percobaan ${i + 1}/${maxRetries}...`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  return false;
}

async function runMigration() {
  console.log('🔄 Menjalankan migrasi database...');
  try {
    execSync('npx drizzle-kit push', { stdio: 'inherit' });
    console.log('✅ Migrasi database berhasil!');
  } catch (error) {
    console.error('❌ Gagal menjalankan migrasi:', error);
    process.exit(1);
  }
}

async function main() {
  console.log('\n🚀 Database Setup Script\n');
  console.log('========================\n');

  // Check if database is running
  const isConnected = await waitForDatabase(5, 1000);
  
  if (!isConnected) {
    console.log('\n⚠️  Database tidak berjalan. Mencoba menjalankan Docker...\n');
    try {
      execSync('docker compose --profile dev up postgres-dev -d', { stdio: 'inherit' });
      console.log('\n🔄 Docker container dimulai, menunggu database ready...\n');
      
      const connectedAfterDocker = await waitForDatabase(15, 2000);
      if (!connectedAfterDocker) {
        console.error('\n❌ Gagal terhubung ke database setelah menjalankan Docker');
        console.log('\n💡 Tips: Pastikan Docker sudah terinstall dan berjalan');
        process.exit(1);
      }
    } catch {
      console.error('\n❌ Gagal menjalankan Docker container');
      console.log('\n💡 Tips: Jalankan manual dengan: npm run db:dev');
      process.exit(1);
    }
  }

  // Check if tables exist
  const tablesExist = await checkTablesExist();
  
  if (!tablesExist) {
    console.log('\n📋 Tabel database belum ada, menjalankan migrasi...\n');
    await runMigration();
  } else {
    console.log('✅ Tabel database sudah ada');
  }

  console.log('\n🎉 Database siap digunakan!\n');
}

main().catch(console.error);
