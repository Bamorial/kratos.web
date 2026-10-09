import { test } from "node:test";
import assert from "node:assert/strict";
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth } from "firebase/auth";

test("Firebase app and Auth share the same component registry", async () => {
  // Synthetic config: initialization does not contact a Firebase project.
  const app = initializeApp(
    { apiKey: "test-only-key", projectId: "demo-kratos-cms" },
    "auth-registration-regression",
  );
  try {
    const auth = getAuth(app);
    assert.equal(auth.app, app);
    assert.equal(getAuth(app), auth);
  } finally {
    await deleteApp(app);
  }
});
