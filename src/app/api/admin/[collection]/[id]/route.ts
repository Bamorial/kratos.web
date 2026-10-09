import { requireAdmin } from "@/server/auth";
import { apiError, HttpError, json, readJson } from "@/server/http";
import { mutateRecord } from "@/server/cms-repository";
import { parseCollection } from "@/server/collections";
import { documentIdSchema, mutationSchema, validateData } from "@/cms/validation";
import { isLocale } from "@/i18n/config";
import { refreshPublishedContent } from "@/server/public-content";

export const runtime = "nodejs";
export async function PUT(request: Request, context: { params: Promise<{ collection: string; id: string }> }) {
  try {
    await requireAdmin(request);
    const params = await context.params;
    const collection = parseCollection(params.collection);
    const id = documentIdSchema.parse(params.id);
    if (collection === "content" && !isLocale(id)) throw new HttpError(400, "Unsupported language.");
    const mutation = mutationSchema.parse(await readJson(request));
    const data = mutation.data === undefined ? undefined : validateData(collection, mutation.data);
    if (data && "slug" in data && data.slug !== id) throw new HttpError(400, "The slug must match the item ID. Create a new item to change its URL.");
    const result = await mutateRecord(collection, id, mutation.action, mutation.version, data);
    if (mutation.action !== "save") refreshPublishedContent();
    return json(result);
  } catch (error) { return apiError(error); }
}
