import { requireAdmin } from "@/server/auth";
import { apiError, json } from "@/server/http";
import { isInitialized } from "@/server/cms-repository";

export const runtime = "nodejs";
export async function GET(request: Request) {
  try { await requireAdmin(request); return json({ initialized: await isInitialized() }); }
  catch (error) { return apiError(error); }
}
