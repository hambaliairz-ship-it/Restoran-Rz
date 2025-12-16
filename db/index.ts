import 'dotenv/config';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { parse } from 'dotenv';
import * as schema from './schema';

// Cache connection instance
let cachedDb: ReturnType<typeof drizzleNeon> | ReturnType<typeof drizzlePg> | null = null;

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

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL is not set in environment variables');
  throw new Error('DATABASE_URL is required for the application to run');
}

// Use Neon serverless driver for production in Vercel/Netlify based on hostnames
const isServerlessEnv = typeof process.env.VERCEL !== 'undefined' ||
                       typeof process.env.NETLIFY !== 'undefined' ||
                       (typeof process.env.HOSTNAME !== 'undefined' &&
                        (process.env.HOSTNAME.includes('vercel') || process.env.HOSTNAME.includes('netlify')));

// Use Neon serverless driver for production (Vercel/Netlify) and serverless environments, pg for local development
const isProduction = process.env.NODE_ENV === 'production' || isServerlessEnv;

export const getDb = () => {
  if (!cachedDb) {
    cachedDb = isProduction
      ? drizzleNeon(neon(databaseUrl), { schema })
      : drizzlePg(databaseUrl, { schema });
  }
  return cachedDb;
};

// For direct access (backward compatibility)
export const db = getDb();