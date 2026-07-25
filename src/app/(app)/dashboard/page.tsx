import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { requireSession } from "@/lib/auth";
import type { Member, PointLog, Project } from "@/lib/types";

const STATUS_LABEL: Record<Project["status"], string> = {
  planning: "วางแผน",
  in_progress: "กำลังทำ",
  done: "เสร็จแล้ว",
  cancelled: "ยกเลิก",
};

export default async function DashboardPage() {
  await requireSession();

  const [{ data: members }, { data: pointLogs }, { data: projects }] = await Promise.all([
    supabase.from("members").select("id, name, role, avatar_color").order("created_at"),
    supabase.from("point_logs").select("member_id, points"),
    supabase
      .from("projects")
      .select("id, name, status, due_date")
      .order("created_at", { ascending: false }),
  ]);

  const totals = new Map<string, number>();
  for (const log of (pointLogs ?? []) as Pick<PointLog, "member_id" | "points">[]) {
    totals.set(log.member_id, (totals.get(log.member_id) ?? 0) + log.points);
  }

  const leaderboard = ((members ?? []) as Pick<Member, "id" | "name" | "role" | "avatar_color">[])
    .map((m) => ({ ...m, total: totals.get(m.id) ?? 0 }))
    .sort((a, b) => b.total - a.total);

  const { data: recentLogs } = await supabase
    .from("point_logs")
    .select(
      "id, points, reason, created_at, member:members!point_logs_member_id_fkey(name)"
    )
    .order("created_at", { ascending: false })
    .limit(8);

  const statusCounts = { planning: 0, in_progress: 0, done: 0, cancelled: 0 };
  for (const p of (projects ?? []) as Pick<Project, "status">[]) {
    statusCounts[p.status]++;
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-800">
          กระดานคะแนน
        </h2>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {leaderboard.map((m, i) => (
            <div
              key={m.id}
              className="flex items-center justify-between border-b border-slate-100 px-4 py-3 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <span className="w-5 text-sm font-semibold text-slate-400">
                  {i + 1}
                </span>
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white"
                  style={{ backgroundColor: m.avatar_color }}
                >
                  {m.name.slice(0, 1)}
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-800">{m.name}</p>
                  <p className="text-xs text-slate-400">{m.role}</p>
                </div>
              </div>
              <span className="text-lg font-bold text-indigo-600">
                {m.total.toLocaleString()} คะแนน
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-800">
          สรุปโปรเจค
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(Object.keys(STATUS_LABEL) as Project["status"][]).map((status) => (
            <div
              key={status}
              className="rounded-xl border border-slate-200 bg-white p-4 text-center"
            >
              <p className="text-2xl font-bold text-slate-800">
                {statusCounts[status]}
              </p>
              <p className="text-xs text-slate-500">{STATUS_LABEL[status]}</p>
            </div>
          ))}
        </div>
        <Link
          href="/projects"
          className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:underline"
        >
          ดูโปรเจคทั้งหมด →
        </Link>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-800">
          กิจกรรมล่าสุด
        </h2>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {(recentLogs ?? []).length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-slate-400">
              ยังไม่มีกิจกรรม
            </p>
          )}
          {(recentLogs ?? []).map((log) => {
            const member = Array.isArray(log.member) ? log.member[0] : log.member;
            return (
              <div
                key={log.id}
                className="flex items-center justify-between border-b border-slate-100 px-4 py-3 text-sm last:border-b-0"
              >
                <div>
                  <span className="font-medium text-slate-800">
                    {member?.name ?? "ไม่ทราบชื่อ"}
                  </span>
                  <span className="ml-2 text-slate-500">{log.reason}</span>
                </div>
                <span
                  className={
                    log.points >= 0
                      ? "font-semibold text-emerald-600"
                      : "font-semibold text-red-500"
                  }
                >
                  {log.points >= 0 ? "+" : ""}
                  {log.points}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
