import { notFound } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { requireSession } from "@/lib/auth";
import type { Project } from "@/lib/types";
import { updateStatusAction, toggleMemberAction } from "./actions";

const STATUS_LABEL: Record<Project["status"], string> = {
  planning: "วางแผน",
  in_progress: "กำลังทำ",
  done: "เสร็จแล้ว",
  cancelled: "ยกเลิก",
};

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id } = await params;

  const [{ data: projectRow }, { data: allMembers }, { data: assignedRows }, { data: pointLogs }] =
    await Promise.all([
      supabase.from("projects").select("*").eq("id", id).single(),
      supabase.from("members").select("id, name").order("created_at"),
      supabase.from("project_members").select("member_id").eq("project_id", id),
      supabase
        .from("point_logs")
        .select("id, points, reason, created_at, member:members!point_logs_member_id_fkey(name)")
        .eq("project_id", id)
        .order("created_at", { ascending: false }),
    ]);

  const project = projectRow as Project | null;
  if (!project) notFound();

  const assignedIds = new Set((assignedRows ?? []).map((r) => r.member_id));

  return (
    <div className="space-y-6">
      <div>
        <Link href="/projects" className="text-sm text-indigo-600 hover:underline">
          ← โปรเจคทั้งหมด
        </Link>
        <h1 className="mt-1 text-xl font-bold text-slate-800">{project.name}</h1>
        {project.description && (
          <p className="mt-1 text-sm text-slate-600">{project.description}</p>
        )}
        <p className="mt-1 text-xs text-slate-400">
          {project.due_date ? `กำหนดส่ง: ${project.due_date}` : "ไม่มีกำหนดส่ง"}
          {project.points_reward > 0 ? ` · รางวัลเมื่อเสร็จ ${project.points_reward} คะแนน/คน` : ""}
        </p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="mb-2 text-sm font-medium text-slate-700">
          สถานะปัจจุบัน:{" "}
          <span className="font-semibold text-indigo-600">{STATUS_LABEL[project.status]}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(STATUS_LABEL) as Project["status"][]).map((status) => (
            <form key={status} action={updateStatusAction}>
              <input type="hidden" name="projectId" value={project.id} />
              <input type="hidden" name="status" value={status} />
              <button
                type="submit"
                disabled={project.status === status}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {STATUS_LABEL[status]}
              </button>
            </form>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="mb-2 text-sm font-medium text-slate-700">ผู้รับผิดชอบ</p>
        <div className="flex flex-wrap gap-2">
          {(allMembers ?? []).map((m) => {
            const assigned = assignedIds.has(m.id);
            return (
              <form key={m.id} action={toggleMemberAction}>
                <input type="hidden" name="projectId" value={project.id} />
                <input type="hidden" name="memberId" value={m.id} />
                <input type="hidden" name="assigned" value={String(assigned)} />
                <button
                  type="submit"
                  className={
                    "rounded-full px-3 py-1 text-sm " +
                    (assigned
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "border border-slate-300 text-slate-600 hover:bg-slate-50")
                  }
                >
                  {m.name}
                </button>
              </form>
            );
          })}
        </div>
      </section>

      <section>
        <p className="mb-2 text-sm font-medium text-slate-700">ประวัติคะแนนของโปรเจคนี้</p>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {(pointLogs ?? []).length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-slate-400">ยังไม่มีคะแนนที่เกี่ยวข้อง</p>
          )}
          {(pointLogs ?? []).map((log) => {
            const member = Array.isArray(log.member) ? log.member[0] : log.member;
            return (
              <div
                key={log.id}
                className="flex items-center justify-between border-b border-slate-100 px-4 py-2 text-sm last:border-b-0"
              >
                <span className="text-slate-700">
                  {member?.name ?? "-"} · {log.reason}
                </span>
                <span className="font-semibold text-emerald-600">+{log.points}</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
