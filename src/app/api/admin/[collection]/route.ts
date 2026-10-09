import { requireAdmin } from "@/server/auth";
import { apiError, json } from "@/server/http";
import { listRecords } from "@/server/cms-repository";
import { parseCollection } from "@/server/collections";

export const runtime = "nodejs";
export async function GET(request: Request, context: { params: Promise<{ collection: string }> }) {
  try { await requireAdmin(request); return json(await listRecords(parseCollection((await context.params).collection))); }
  catch (error) { return apiError(error); }
}
