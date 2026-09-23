import impressum from "./impressum.json";
import disclaimer from "./disclaimer.json";
import terms from "./terms.json";
import privacy from "./privacy.json";

export const legalDocuments = { impressum, disclaimer, terms, privacy };
export type LegalDocument = keyof typeof legalDocuments;
export function isLegalDocument(value: string): value is LegalDocument {
  return Object.prototype.hasOwnProperty.call(legalDocuments, value);
}
