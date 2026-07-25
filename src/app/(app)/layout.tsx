import { requireSession } from "@/lib/auth";
import { Navbar } from "./Navbar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const member = await requireSession();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar member={member} />
      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
    </div>
  );
}
