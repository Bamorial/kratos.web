import "server-only";
import { createHmac } from "node:crypto";
import { FieldPath } from "firebase-admin/firestore";
import { adminDatabase } from "@/lib/firebase/admin";
import { resolveTranslation } from "@/cms/localization";
import { bookingSchema } from "@/cms/validation";
import type { Booking, BookingStatus, ServiceData } from "@/cms/models";
import type { z } from "zod";
import { HttpError } from "./http";

export async function createBooking(input: z.infer<typeof bookingSchema>, request: Request) {
  const secret = process.env.BOOKING_RATE_LIMIT_SECRET;
  if (!secret || secret.length < 32) throw new HttpError(503, "Booking submissions are not configured yet. Please contact us by email.");
  // Vercel overwrites this header. Outside Vercel, share a conservative local limit.
  const ip = process.env.VERCEL ? request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() || "unknown" : "local";
  const hash = createHmac("sha256", secret).update(ip).digest("hex");
  const db = adminDatabase();
  const bookingRef = db.collection("bookings").doc(input.requestId);
  const limitRef = db.collection("booking_limits").doc(hash);
  const globalRef = db.doc("booking_limits/global");
  const now = Date.now();
  await db.runTransaction(async transaction => {
    const [existing, limit, global] = await transaction.getAll(bookingRef, limitRef, globalRef);
    if (existing.exists) return; // Retrying a submission cannot create duplicate messages.
    const bucket = Math.floor(now / (15 * 60 * 1000));
    const day = Math.floor(now / 86400000);
    const count = limit.data()?.bucket === bucket ? Number(limit.data()?.count) : 0;
    const total = global.data()?.day === day ? Number(global.data()?.count) : 0;
    if (count >= 5 || total >= 200) throw new HttpError(429, "Please try again later or contact us by email.");
    let service: ServiceData | undefined;
    if (input.serviceId) {
      const result = await transaction.get(db.collection("cms_services").doc(input.serviceId));
      service = result.data()?.published;
      if (!service) throw new HttpError(400, "This service is no longer available. Please refresh the page.");
    }
    const booking: Omit<Booking, "id"> = {
      name: input.name, email: input.email, message: input.message, locale: input.locale,
      serviceId: input.serviceId, serviceTitle: service ? resolveTranslation(service.translations, input.locale).value.title : "",
      priceCents: service?.priceCents ?? null, status: "new", createdAt: new Date(now).toISOString(),
    };
    transaction.create(bookingRef, booking);
    transaction.set(limitRef, { bucket, count: count + 1 });
    transaction.set(globalRef, { day, count: total + 1 });
  });
}

export async function listBookings(cursor?: string) {
  let query = adminDatabase().collection("bookings").orderBy("createdAt", "desc").orderBy(FieldPath.documentId(), "desc");
  if (cursor) {
    if (!/^[a-f0-9-]{36}$/.test(cursor)) throw new HttpError(400, "Invalid cursor.");
    const previous = await adminDatabase().collection("bookings").doc(cursor).get();
    if (!previous.exists) throw new HttpError(400, "The previous message was deleted. Refresh the inbox.");
    query = query.startAfter(previous);
  }
  const result = await query.limit(51).get();
  const docs = result.docs.slice(0, 50);
  return { items: docs.map(doc => ({ ...doc.data(), id: doc.id }) as Booking), nextCursor: result.size > 50 ? docs.at(-1)!.id : null };
}
export async function updateBooking(id: string, status: BookingStatus) {
  const ref = adminDatabase().collection("bookings").doc(id);
  await adminDatabase().runTransaction(async transaction => {
    if (!(await transaction.get(ref)).exists) throw new HttpError(404, "Message not found.");
    transaction.update(ref, { status });
  });
}
export async function deleteBooking(id: string) { await adminDatabase().collection("bookings").doc(id).delete(); }
