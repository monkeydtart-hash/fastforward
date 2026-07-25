import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getCurrentMember } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const current = await getCurrentMember();
  if (current) {
    redirect("/dashboard");
  }

  const { data: members } = await supabase
    .from("members")
    .select("id, name, role")
    .order("created_at", { ascending: true });

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-center text-2xl font-bold text-slate-800">
          ทีม 6 คน
        </h1>
        <p className="mt-1 text-center text-sm text-slate-500">
          เข้าสู่ระบบสะสมคะแนน + โปรเจคทีม
        </p>
        <LoginForm members={members ?? []} />
      </div>
    </div>
  );
}
