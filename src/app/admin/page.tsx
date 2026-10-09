import Link from "next/link";
import { Brand } from "@/components/admin/brand";
import { Dashboard } from "@/components/admin/dashboard";
import { firebaseConfigured } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";
export default function AdminPage() {
  const configured = firebaseConfigured() && process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!configured) return <main className="admin-login"><div className="admin-login-card"><Brand /><h1>Connect Firebase to get started</h1><p>The website is using its existing content. Add your Firebase project configuration to enable sign-in, publishing, and the booking inbox.</p><ol className="admin-steps"><li>Create a Firebase project and Firestore database.</li><li>Enable email/password authentication and add your administrator.</li><li>Follow <code>docs/firebase-setup.md</code> and configure the variables in <code>.env.example</code>.</li><li>Redeploy, sign in here, and import the existing content.</li></ol><Link className="admin-back-link" href="/de">Return to website</Link></div></main>;
  return <Dashboard />;
}
