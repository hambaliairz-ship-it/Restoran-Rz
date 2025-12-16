import { auth } from "@/lib/auth"; // path to your auth file
import { toNextJsHandler } from "better-auth/next-js";

// Only force dynamic for sensitive endpoints like login
// For other endpoints like session validation, we can use revalidation strategies
export const dynamic = "force-dynamic";

// Add headers to control caching behavior
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

export const { POST, GET } = toNextJsHandler(auth);