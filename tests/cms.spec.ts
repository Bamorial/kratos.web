import { test, expect, type APIRequestContext } from "@playwright/test";
import { initializeApp, deleteApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { initializeTestEnvironment, assertFails } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { readFile } from "node:fs/promises";
import type { ArticleData, CmsRecord, ServiceData } from "../src/cms/models";

test.describe("Firebase CMS", () => {
  test.skip(process.env.CMS_EMULATOR_TEST !== "1", "Run npm run test:cms to enable isolated emulators.");
  test.describe.configure({ mode: "serial" });
  let app: App;
  let token: string;
  let ordinaryToken: string;
  const email = "cms-admin@example.test";
  const password = "Emulator-only-password-123!";
  async function signIn(address: string) {
    const response = await fetch("http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-api-key", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: address, password, returnSecureToken: true }) });
    if (!response.ok) throw new Error("Emulator sign-in failed.");
    return (await response.json()).idToken as string;
  }
  const headers = () => ({ Authorization: `Bearer ${token}` });
  async function mutate(request: APIRequestContext, path: string, data: unknown) {
    return request.put(`/api/admin/${path}`, { headers: headers(), data });
  }
  test.beforeAll(async () => {
    if (process.env.FIREBASE_PROJECT_ID !== "demo-kratos-cms" || process.env.FIRESTORE_EMULATOR_HOST !== "127.0.0.1:8080") throw new Error("Refusing to test outside the local emulator.");
    app = initializeApp({ projectId: "demo-kratos-cms" }, "cms-test");
    const auth = getAuth(app);
    const admin = await auth.createUser({ email, password });
    await auth.setCustomUserClaims(admin.uid, { admin: true });
    await auth.createUser({ email: "reader@example.test", password });
    token = await signIn(email);
    ordinaryToken = await signIn("reader@example.test");
  });
  test.afterAll(async () => { if (app) await deleteApp(app); });

  test("unauthenticated users, normal accounts, and direct Firestore access are denied", async ({ request }) => {
    expect((await request.get("/api/admin/bookings")).status()).toBe(401);
    expect((await request.get("/api/admin/articles", { headers: { Authorization: `Bearer ${ordinaryToken}` } })).status()).toBe(403);
    expect((await request.get("/api/admin/session", { headers: { Authorization: "Bearer forged" } })).status()).toBe(401);
    const rules = await initializeTestEnvironment({ projectId: "demo-kratos-cms", firestore: { host: "127.0.0.1", port: 8080, rules: await readFile("firestore.rules", "utf8") } });
    for (const context of [rules.unauthenticatedContext(), rules.authenticatedContext("ordinary"), rules.authenticatedContext("admin", { admin: true })]) {
      await assertFails(getDoc(doc(context.firestore(), "bookings/private-message")));
      await assertFails(setDoc(doc(context.firestore(), "cms_content/de"), { published: {} }));
    }
    await rules.cleanup();
  });

  test("administrator signs in and imports the existing multilingual content once", async ({ page, request }) => {
    await page.goto("/admin");
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await page.getByRole("button", { name: "Import existing website content", exact: true }).click();
    await expect(page.getByRole("button", { name: "Deutsch Published", exact: true })).toBeVisible();
    const response = await request.post("/api/admin/initialize", { headers: headers(), data: {} });
    expect(response.status()).toBe(409);
    const content = await request.get("/api/admin/content", { headers: headers() });
    expect((await content.json()).map((item: { id: string }) => item.id).sort()).toEqual(["de", "en", "ro"]);
    await page.getByRole("button", { name: "Deutsch Published", exact: true }).click();
    await page.screenshot({ path: "test-results/cms-content-desktop.png", fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
    await page.screenshot({ path: "test-results/cms-content-mobile.png", fullPage: true });
  });

  test("drafts stay private, publishing creates new URLs, translations fall back, stale edits fail", async ({ request }) => {
    const data: ArticleData = { slug: "emulator-article", image: "06606.png", date: "2026-10-09", translations: { de: { title: "Ein neuer Artikel", category: "Test", excerpt: "Ein neuer Text", body: [{ type: "paragraph", text: "Published German article body" }] } } };
    let response = await mutate(request, "articles/emulator-article", { action: "save", version: 0, data });
    expect(response.status()).toBe(200);
    let record: CmsRecord<ArticleData> = await response.json();
    expect((await request.get("/de/blog/emulator-article")).status()).toBe(404);
    expect(await (await request.get("/de/blog")).text()).not.toContain("Ein neuer Artikel");
    response = await mutate(request, "articles/emulator-article", { action: "publish", version: record.version, data });
    expect(response.status()).toBe(200); record = await response.json();
    let page = await request.get("/ro/blog/emulator-article");
    expect(page.status()).toBe(200); expect(await page.text()).toContain('lang="de"');
    expect(await (await request.get("/de/blog/emulator-article")).text()).toContain("Published German article body");
    expect((await mutate(request, "articles/emulator-article", { action: "save", version: 1, data })).status()).toBe(409);
    data.translations.de.title = "PRIVATE DRAFT TITLE";
    response = await mutate(request, "articles/emulator-article", { action: "save", version: record.version, data }); record = await response.json();
    expect(await (await request.get("/de/blog/emulator-article")).text()).not.toContain("PRIVATE DRAFT TITLE");
    data.translations.ro = { ...data.translations.de, title: "Articol în română" };
    response = await mutate(request, "articles/emulator-article", { action: "publish", version: record.version, data }); record = await response.json();
    page = await request.get("/ro/blog/emulator-article"); expect(await page.text()).toContain("Articol în română");
    expect((await mutate(request, "articles/emulator-article", { action: "delete", version: record.version })).status()).toBe(409);
    response = await mutate(request, "articles/emulator-article", { action: "unpublish", version: record.version }); record = await response.json();
    expect((await request.get("/ro/blog/emulator-article")).status()).toBe(404);
    expect((await mutate(request, "articles/emulator-article", { action: "delete", version: record.version })).status()).toBe(200);
  });

  test("translated service prices reach the enquiry form and private inbox", async ({ page, request }) => {
    const service: ServiceData = { slug: "test-service", image: "760cb.png", currency: "EUR", priceCents: 8500, durationMinutes: 60, order: 0, translations: { de: { title: "Test Beratung", description: "Beschreibung", details: [] }, ro: { title: "Consiliere de test", description: "Descriere", details: [] } } };
    expect((await mutate(request, "services/test-service", { action: "publish", version: 0, data: service })).status()).toBe(200);
    await page.goto("/ro/services");
    await expect(page.getByRole("heading", { name: "Consiliere de test" })).toBeVisible();
    await page.locator('#test-service').getByRole("link", { name: "Programează o ședință" }).click();
    await expect(page.getByLabel("Serviciu", { exact: true })).toHaveValue("test-service");
    await page.getByRole("textbox", { name: "Nume", exact: true }).fill("Emulator Client");
    await page.getByRole("textbox", { name: "E-mail", exact: true }).fill("client@example.test");
    await page.getByRole("textbox", { name: "Mesajul tău…", exact: true }).fill("Private test enquiry");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Trimite cererea", exact: true }).click();
    await expect(page.getByRole("status")).toContainText("Cererea ta a fost primită");
    const inbox = await request.get("/api/admin/bookings", { headers: headers() });
    const { items } = await inbox.json();
    expect(items).toHaveLength(1); expect(items[0]).toMatchObject({ locale: "ro", serviceTitle: "Consiliere de test", priceCents: 8500, status: "new" });
    const id = items[0].id;
    expect((await request.patch(`/api/admin/bookings/${id}`, { headers: headers(), data: { status: "contacted" } })).status()).toBe(200);
    expect(await (await request.get("/ro")).text()).not.toContain("Private test enquiry");
    await page.goto("/admin");
    await page.getByLabel("Email", { exact: true }).fill(email); await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await page.getByRole("button", { name: "Booking inbox", exact: true }).click();
    await expect(page.getByText("Private test enquiry", { exact: true })).toBeVisible();
    await page.screenshot({ path: "test-results/cms-booking-inbox.png", fullPage: true });
    expect((await request.delete(`/api/admin/bookings/${id}`, { headers: headers(), data: {} })).status()).toBe(200);
  });

  test("validation, honeypot, retry deduplication, and database rate limits", async ({ request }) => {
    await getFirestore(app).recursiveDelete(getFirestore(app).collection("booking_limits"));
    const data = { requestId: crypto.randomUUID(), name: "Rate test", email: "test@example.test", message: "Test", locale: "en", serviceId: "", website: "", consent: true };
    expect((await request.post("/api/bookings", { data: { ...data, status: "closed" } })).status()).toBe(400);
    expect((await request.post("/api/bookings", { headers: { Origin: "https://another.example" }, data })).status()).toBe(403);
    expect((await request.post("/api/bookings", { data: { ...data, website: "spam.example" } })).status()).toBe(200);
    expect((await getFirestore(app).collection("bookings").doc(data.requestId).get()).exists).toBe(false);
    expect((await request.post("/api/bookings", { data })).status()).toBe(201);
    expect((await request.post("/api/bookings", { data })).status()).toBe(201);
    for (let i = 0; i < 4; i++) expect((await request.post("/api/bookings", { data: { ...data, requestId: crypto.randomUUID() } })).status()).toBe(201);
    expect((await request.post("/api/bookings", { data: { ...data, requestId: crypto.randomUUID() } })).status()).toBe(429);
  });

  test("removing an admin claim immediately blocks an existing token", async ({ request }) => {
    const user = await getAuth(app).getUserByEmail(email);
    await getAuth(app).setCustomUserClaims(user.uid, {});
    expect((await request.get("/api/admin/bookings", { headers: headers() })).status()).toBe(403);
  });
});
