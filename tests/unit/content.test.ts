import { test } from "node:test";
import assert from "node:assert/strict";
import { seedPublicContent } from "../../src/cms/seeds";
import { validateData, bookingSchema } from "../../src/cms/validation";
import { resolveTranslation } from "../../src/cms/localization";

test("all existing multilingual content can be imported without schema loss", () => {
  const seed = seedPublicContent();
  for (const content of Object.values(seed.content)) assert.deepEqual(validateData("content", content), content);
  for (const article of seed.articles) assert.deepEqual(validateData("articles", article), article);
  for (const service of seed.services) assert.deepEqual(validateData("services", service), service);
});
test("missing translations fall back to the whole German version", () => {
  const de = { title: "Deutsch", body: ["Text"] };
  assert.deepEqual(resolveTranslation({ de }, "ro"), { value: de, language: "de" });
  assert.equal(resolveTranslation({ de, en: { title: "English", body: ["Body"] } }, "en").value.title, "English");
});
test("invalid slugs, unsafe image URLs, invalid dates and fractional prices are rejected", () => {
  const seed = seedPublicContent();
  const article = seed.articles[0];
  for (const patch of [{ slug: "../private" }, { image: "javascript:alert(1)" }, { image: "http://localhost/private" }, { date: "2026-02-31" }, { translations: { en: article.translations.en } }]) {
    assert.throws(() => validateData("articles", { ...article, ...patch }));
  }
  for (const priceCents of [-1, 2.5, Infinity]) assert.throws(() => validateData("services", { ...seed.services[0], priceCents }));
  assert.equal(validateData("services", { ...seed.services[0], priceCents: 0 }).priceCents, 0);
});
test("booking input cannot supply server-owned fields or omit consent", () => {
  const input = { requestId: "4d40f8a2-dc03-44ee-9ee9-4d4431e99cfb", name: "Test client", email: "test@example.com", message: "Please contact me", locale: "ro", serviceId: "", website: "", consent: true };
  assert.equal(bookingSchema.parse(input).locale, "ro");
  for (const patch of [{ consent: false }, { status: "closed" }, { message: "a".repeat(4001) }, { email: "not-an-email" }, { locale: "fr" }]) assert.throws(() => bookingSchema.parse({ ...input, ...patch }));
});
test("page-copy validation prevents missing structures and link injection", () => {
  const content = seedPublicContent().content.de!;
  assert.throws(() => validateData("content", { ...content, site: { nav: {} } }));
  const unsafe = structuredClone(content);
  unsafe.site.audience.cards[0].path = "javascript:alert(1)";
  assert.throws(() => validateData("content", unsafe));
  unsafe.site.audience.cards[0].path = "services#qigong";
  unsafe.practice.phoneHref = "javascript:alert(1)";
  assert.throws(() => validateData("content", unsafe));
});
