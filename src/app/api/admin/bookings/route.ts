import { requireAdmin } from "@/server/auth";
import { listBookings } from "@/server/bookings";
import { apiError, json } from "@/server/http";

export const runtime = "nodejs";
export async function GET(request: Request) {
  try { await requireAdmin(request); return json(await listBookings(new URL(request.url).searchParams.get("cursor") || undefined)); }
  catch (error) { return apiError(error); }
}
