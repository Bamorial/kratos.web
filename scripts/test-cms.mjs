import { spawnSync } from "node:child_process";

// Always overwrite Firebase settings: these tests must never use a real project.
const project = "demo-kratos-cms";
const env = {
  ...process.env,
  FIREBASE_PROJECT_ID: project,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: project,
  NEXT_PUBLIC_FIREBASE_API_KEY: "demo-api-key",
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: `${project}.firebaseapp.com`,
  FIREBASE_AUTH_EMULATOR_HOST: "127.0.0.1:9099",
  FIRESTORE_EMULATOR_HOST: "127.0.0.1:8080",
  NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL: "http://127.0.0.1:9099",
  BOOKING_RATE_LIMIT_SECRET: "local-emulator-test-secret-not-for-production",
  CMS_EMULATOR_TEST: "1",
  CI: "1",
};
delete env.VERCEL;
delete env.FIREBASE_CLIENT_EMAIL;
delete env.FIREBASE_PRIVATE_KEY;
const result = spawnSync("npx", ["firebase", "emulators:exec", "--project", project, "--only", "auth,firestore", "npm run build && npx playwright test tests/cms.spec.ts"], { env, stdio: "inherit" });
process.exit(result.status ?? 1);
