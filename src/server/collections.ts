import type { Collection } from "@/cms/models";
import { HttpError } from "./http";

export function parseCollection(value: string): Collection {
  if (value === "content" || value === "articles" || value === "services") return value;
  throw new HttpError(404, "Collection not found.");
}
