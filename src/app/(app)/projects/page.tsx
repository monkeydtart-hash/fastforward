import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { requireSession } from "@/lib/auth";
import type { Project } from "@/lib/types";
import { CreateProjectForm } from "./CreateProjectForm";

const STATUS_LABEL: Record<Project["status"], string> = {
  planning: "วางแผน",
  in_progress: "กำลังทำ",
  done: "เสร็จแล้ว",
  cancelled: "ยกเลิก",
};

const STATUS_COLOR: Record<Project["status"], string> = {
  planning: "bg-slate-100 text-slate-600",
  in_progress: "bg-amber-100 text-amber-700",
  done: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-600",
};

export default async function ProjectsPage() {
  await requireSession();

  const [{ data: members }, { data: projects }] = await Promise.all([
    supabase.from("members").select("id, name").order("created_at"),
    supabase.from("projects").select("*").order("created_at", { ascending: false }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">โปรเจคทีม</h1>
        <p className="text-sm text-slate-500">
          สร้างและติดตามโปรเจคของทีม เมื่อโปรเจคเสร็จจะมอบคะแนนให้ผู้รับผิดชอบอัตโนมัติ
        </p>
      </div>

      <CreateProjectForm members={members ?? []} />

      <div className="space-y-2">
        {(projects ?? []).length === 0 && (
          <p className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-400">
            ยังไม่มีโปรเจค
          </p>
        )}
        {(projects ?? []).map((p: Project) => (
          <Link
            key={p.id}
            href={`/projects/${p.id}`}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 hover:border-indigo-300"
          >
            <div>
              <p className="font-medium text-slate-800">{p.name}</p>
              <p className="text-xs text-slate-400">
                {p.due_date ? `กำหนดส่ง: ${p.due_date}` : "ไม่มีกำหนดส่ง"}
                {p.points_reward > 0 ? ` · รางวัล ${p.points_reward} คะแนน` : ""}
              </p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLOR[p.status]}`}>
              {STATUS_LABEL[p.status]}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
