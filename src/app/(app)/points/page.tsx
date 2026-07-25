import { supabase } from "@/lib/supabase";
import { requireSession } from "@/lib/auth";
import { AddPointsForm } from "./AddPointsForm";

export default async function PointsPage() {
  await requireSession();

  const [{ data: members }, { data: logs }] = await Promise.all([
    supabase.from("members").select("id, name, role").order("created_at"),
    supabase
      .from("point_logs")
      .select(
        "id, points, reason, created_at, member:members!point_logs_member_id_fkey(name), giver:members!point_logs_created_by_fkey(name)"
      )
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">คะแนนทีม</h1>
        <p className="text-sm text-slate-500">เพิ่มหรือหักคะแนนให้สมาชิก พร้อมบันทึกเหตุผล</p>
      </div>

      <AddPointsForm members={members ?? []} />

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-2">วันที่</th>
              <th className="px-4 py-2">สมาชิก</th>
              <th className="px-4 py-2">เหตุผล</th>
              <th className="px-4 py-2">โดย</th>
              <th className="px-4 py-2 text-right">คะแนน</th>
            </tr>
          </thead>
          <tbody>
            {(logs ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  ยังไม่มีประวัติคะแนน
                </td>
              </tr>
            )}
            {(logs ?? []).map((log) => {
              const member = Array.isArray(log.member) ? log.member[0] : log.member;
              const giver = Array.isArray(log.giver) ? log.giver[0] : log.giver;
              return (
                <tr key={log.id} className="border-t border-slate-100">
                  <td className="px-4 py-2 text-slate-500">
                    {new Date(log.created_at).toLocaleDateString("th-TH")}
                  </td>
                  <td className="px-4 py-2 font-medium text-slate-800">
                    {member?.name ?? "-"}
                  </td>
                  <td className="px-4 py-2 text-slate-600">{log.reason}</td>
                  <td className="px-4 py-2 text-slate-400">{giver?.name ?? "-"}</td>
                  <td
                    className={
                      "px-4 py-2 text-right font-semibold " +
                      (log.points >= 0 ? "text-emerald-600" : "text-red-500")
                    }
                  >
                    {log.points >= 0 ? "+" : ""}
                    {log.points}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
