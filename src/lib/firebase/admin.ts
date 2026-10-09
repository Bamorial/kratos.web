import "server-only";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

export function firebaseConfigured() {
  return Boolean(process.env.FIREBASE_PROJECT_ID && ((process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) || process.env.FIRESTORE_EMULATOR_HOST));
}

function adminApp() {
  if (process.env.VERCEL && (process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST)) {
    throw new Error("Firebase emulators must not be enabled on Vercel.");
  }
  const existing = getApps().find(app => app.name === "cms-server");
  if (existing) return existing;
  if (!firebaseConfigured()) throw new Error("Firebase server configuration is missing.");
  const projectId = process.env.FIREBASE_PROJECT_ID!;
  return initializeApp(process.env.FIRESTORE_EMULATOR_HOST
    ? { projectId }
    : { projectId, credential: cert({ projectId, clientEmail: process.env.FIREBASE_CLIENT_EMAIL!, privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n") }) }, "cms-server");
}
export const adminAuth = () => getAuth(adminApp());
export const adminDatabase = () => getFirestore(adminApp());
