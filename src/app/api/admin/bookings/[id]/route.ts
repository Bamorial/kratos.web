import { z } from "zod";
import { requireAdmin } from "@/server/auth";
import { updateBooking, deleteBooking } from "@/server/bookings";
import { apiError, json, readJson } from "@/server/http";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
export async function PATCH(request: Request, context: Context) {
  try {
    await requireAdmin(request);
    const id = z.uuid().parse((await context.params).id);
    const { status } = z.object({ status: z.enum(["new", "contacted", "closed"]) }).strict().parse(await readJson(request, 100));
    await updateBooking(id, status); return json({ status });
  } catch (error) { return apiError(error); }
}
export async function DELETE(request: Request, context: Context) {
  try {
    await requireAdmin(request); await readJson(request, 100);
    await deleteBooking(z.uuid().parse((await context.params).id)); return json({ deleted: true });
  } catch (error) { return apiError(error); }
}
