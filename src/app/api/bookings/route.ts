import { bookingSchema } from "@/cms/validation";
import { firebaseConfigured } from "@/lib/firebase/admin";
import { createBooking } from "@/server/bookings";
import { apiError, HttpError, json, readJson } from "@/server/http";

export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const input = bookingSchema.parse(await readJson(request, 12000));
    if (input.website) return json({ received: true });
    if (!firebaseConfigured()) throw new HttpError(503, "Booking submissions are not configured yet. Please contact us by email.");
    await createBooking(input, request);
    return json({ received: true }, 201);
  } catch (error) { return apiError(error); }
}
