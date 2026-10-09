import { test, expect } from "@playwright/test";

test("localized pages, navigation targets, and original design assets resolve", async ({ page, request }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("/");
  await expect(page).toHaveURL(/\/de$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Das Ganze");
  await page.evaluate(async () => {
    document.querySelectorAll("img").forEach(image => { image.loading = "eager"; });
    await Promise.all([...document.images].map(image => image.decode().catch(() => {})));
    await document.fonts.ready;
  });
  await page.screenshot({ path: "test-results/landing-desktop.png", fullPage: true });
  const hrefs = await page.locator("a[href^='/']").evaluateAll(links => links.map(link => link.getAttribute("href")));
  for (const path of new Set(hrefs)) {
    if (!path) continue;
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
  }
  for (const locale of ["de", "en", "ro"]) {
    for (const path of ["", "/about", "/contact", "/services", "/blog", "/impressum", "/terms", "/privacy", "/disclaimer", "/blog/self-understanding", "/blog/inner-calm"]) {
      const response = await request.get(`/${locale}${path}`);
      expect(response.status(), `${locale}${path}`).toBe(200);
      expect(await response.text()).toContain(`<html lang="${locale}"`);
    }
  }
  expect((await request.get("/fr")).status()).toBe(404);
  expect((await request.get("/de/missing")).status()).toBe(404);
  expect((await request.get("/de/blog/missing")).status()).toBe(404);
  const imageSources = await page.locator("img").evaluateAll(images => images.map(image => image.getAttribute("src")).filter(Boolean) as string[]);
  for (const src of new Set(imageSources)) expect((await request.get(src)).status(), src).toBe(200);
});

test("language selection preserves the page and FAQs work by keyboard", async ({ page }) => {
  await page.goto("/de/about");
  await page.getByRole("button", { name: "Sprache wählen" }).click();
  await page.getByRole("link", { name: "🇷🇴 Română" }).click();
  await expect(page).toHaveURL(/\/ro\/about$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("parcursul");
  await page.goto("/en");
  const question = page.locator("details").filter({ hasText: "How can I check the practice's availability?" });
  await expect(question).not.toHaveAttribute("open");
  await question.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(question).toHaveAttribute("open");
});

test("mobile pages fit the viewport, menus work, and contact validates input", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/de");
  await page.getByRole("button", { name: "Menü", exact: true }).click();
  await expect(page.getByRole("navigation", { name: "Menü", exact: true })).toBeVisible();
  await page.getByRole("navigation", { name: "Menü", exact: true }).getByRole("link", { name: "Kontakt", exact: true }).click();
  await expect(page).toHaveURL(/\/de\/contact$/);
  await page.getByRole("button", { name: "Anfrage senden" }).click();
  await expect(page.getByRole("textbox", { name: "Name", exact: true })).toBeFocused();
  for (const route of ["/de", "/en", "/ro", "/de/about", "/de/contact", "/de/blog", "/de/services", "/de/privacy", "/de/terms", "/de/impressum", "/de/disclaimer", "/de/blog/self-understanding"]) {
    await page.goto(route);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow, `${route} must not overflow horizontally`).toBe(false);
  }
  await page.goto("/de");
  await page.evaluate(async () => {
    document.querySelectorAll("img").forEach(image => { image.loading = "eager"; });
    await Promise.all([...document.images].map(image => image.decode().catch(() => {})));
    await document.fonts.ready;
  });
  await page.screenshot({ path: "test-results/landing-mobile.png", fullPage: true });
  await page.getByRole("button", { name: "Weiter", exact: true }).click();
  await expect(page.getByRole("button", { name: "Stimmen unserer Klienten: Sabrina & Matthias", exact: true })).toHaveAttribute("aria-current", "true");
  await page.goto("/de/contact");
  await page.screenshot({ path: "test-results/contact-mobile.png", fullPage: true });
});
