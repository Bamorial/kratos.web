import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());
const [email, operation = "grant"] = process.argv.slice(2);
if (!email || !["grant", "revoke"].includes(operation)) {
  console.error("Usage: npm run admin:access -- admin@example.com [grant|revoke]");
  process.exit(1);
}
if (!process.env.FIREBASE_PROJECT_ID) throw new Error("Set FIREBASE_PROJECT_ID in .env.local first.");
if (process.env.VERCEL) throw new Error("Run this script locally, not during a deployment.");
const projectId = process.env.FIREBASE_PROJECT_ID;
const app = initializeApp(process.env.FIREBASE_AUTH_EMULATOR_HOST ? { projectId } : {
  projectId, credential: cert({ projectId, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n") }),
});
const auth = getAuth(app);
const user = await auth.getUserByEmail(email);
const claims = { ...user.customClaims };
if (operation === "grant") claims.admin = true;
else delete claims.admin;
await auth.setCustomUserClaims(user.uid, claims);
if (operation === "revoke") await auth.revokeRefreshTokens(user.uid);
console.log(`Administrator access ${operation === "grant" ? "granted" : "revoked"} in project ${projectId}. Sign out and sign in again to refresh claims.`);
