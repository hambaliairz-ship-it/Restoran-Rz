import 'dotenv/config';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { parse } from 'dotenv';
import * as schema from './schema';

// Load local env manually if running locally outside of Next.js context
// This ensures scripts like seed.ts pick up .env.local
if (process.env.NODE_ENV !== 'production') {
  const envLocalPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envLocalPath)) {
    const envConfig = parse(fs.readFileSync(envLocalPath));
    for (const k in envConfig) {
      process.env[k] = envConfig[k];
    }
  }
}

const databaseUrl = process.env.DATABASE_URL!;

// Use Neon serverless driver for production (Vercel/Netlify), pg for local development
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL || process.env.NETLIFY;

export const db = isProduction
  ? drizzleNeon(neon(databaseUrl), { schema })
  : drizzlePg(databaseUrl, { schema });
