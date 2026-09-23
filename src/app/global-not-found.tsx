import Link from "next/link";
import "./globals.css";

export default function NotFound() {
  return <html lang="en"><body><main className="container inner-page center"><h1>404</h1><p>This page could not be found.</p><Link className="button" href="/de">Systhera</Link></main></body></html>;
}
