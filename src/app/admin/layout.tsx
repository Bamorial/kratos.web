import type { Metadata } from "next";
import "../globals.css";
import "./admin.css";

export const metadata: Metadata = { title: "Administration | Systhera", robots: { index: false, follow: false } };
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className="admin-body">{children}</body></html>;
}
