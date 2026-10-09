import "server-only";
import { adminAuth, firebaseConfigured } from "@/lib/firebase/admin";
import { HttpError } from "./http";

export async function requireAdmin(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) throw new HttpError(401, "Please sign in.");
  if (!firebaseConfigured()) throw new HttpError(503, "Firebase is not configured yet.");
  let token;
  try { token = await adminAuth().verifyIdToken(authorization.slice(7), true); }
  catch { throw new HttpError(401, "Your session expired. Please sign in again."); }
  // Also check the current user record, so removal of the claim takes effect immediately.
  const user = await adminAuth().getUser(token.uid);
  if (token.admin !== true || user.customClaims?.admin !== true || user.disabled) throw new HttpError(403, "This account does not have administrator access.");
  return token.uid;
}
