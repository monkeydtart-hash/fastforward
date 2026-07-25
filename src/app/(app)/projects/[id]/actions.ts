"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { requireSession } from "@/lib/auth";
import type { ProjectStatus } from "@/lib/types";

const VALID_STATUSES: ProjectStatus[] = ["planning", "in_progress", "done", "cancelled"];

export async function updateStatusAction(formData: FormData) {
  const currentMember = await requireSession();

  const projectId = String(formData.get("projectId") ?? "");
  const status = String(formData.get("status") ?? "") as ProjectStatus;
  if (!projectId || !VALID_STATUSES.includes(status)) return;

  const { data: project } = await supabase
    .from("projects")
    .select("id, name, status, completed_at, points_reward")
    .eq("id", projectId)
    .single();

  if (!project) return;

  if (status === "done" && !project.completed_at) {
    // Guard against double-award: only proceed if this request is the one
    // that flips completed_at from null.
    const { data: updated } = await supabase
      .from("projects")
      .update({ status: "done", completed_at: new Date().toISOString() })
      .eq("id", projectId)
      .is("completed_at", null)
      .select("id")
      .single();

    if (updated && project.points_reward > 0) {
      const { data: assignees } = await supabase
        .from("project_members")
        .select("member_id")
        .eq("project_id", projectId);

      if (assignees && assignees.length > 0) {
        await supabase.from("point_logs").insert(
          assignees.map((a) => ({
            member_id: a.member_id,
            points: project.points_reward,
            reason: `โปรเจคเสร็จ: ${project.name}`,
            project_id: projectId,
            created_by: currentMember.id,
          }))
        );
      }
    }
  } else {
    await supabase.from("projects").update({ status }).eq("id", projectId);
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");
  revalidatePath("/dashboard");
  revalidatePath("/points");
}

export async function toggleMemberAction(formData: FormData) {
  await requireSession();

  const projectId = String(formData.get("projectId") ?? "");
  const memberId = String(formData.get("memberId") ?? "");
  const assigned = String(formData.get("assigned") ?? "") === "true";
  if (!projectId || !memberId) return;

  if (assigned) {
    await supabase.from("project_members").delete().eq("project_id", projectId).eq("member_id", memberId);
  } else {
    await supabase.from("project_members").insert({ project_id: projectId, member_id: memberId });
  }

  revalidatePath(`/projects/${projectId}`);
}
