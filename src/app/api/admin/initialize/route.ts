import { requireAdmin } from "@/server/auth";
import { apiError, json, readJson } from "@/server/http";
import { initializeContent } from "@/server/cms-repository";
import { refreshPublishedContent } from "@/server/public-content";

export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    await requireAdmin(request); await readJson(request, 100);
    await initializeContent(); refreshPublishedContent(); return json({ initialized: true });
  } catch (error) { return apiError(error); }
}
