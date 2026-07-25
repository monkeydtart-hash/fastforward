"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { requireSession } from "@/lib/auth";

export type CreateProjectState = { error: string } | undefined;

export async function createProjectAction(
  _prevState: CreateProjectState,
  formData: FormData
): Promise<CreateProjectState> {
  const currentMember = await requireSession();

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const dueDateRaw = String(formData.get("dueDate") ?? "");
  const pointsRewardRaw = String(formData.get("pointsReward") ?? "0");
  const memberIds = formData.getAll("memberIds").map(String);

  if (!name) {
    return { error: "กรุณากรอกชื่อโปรเจค" };
  }

  const pointsReward = Math.max(0, Math.round(Number(pointsRewardRaw) || 0));

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      name,
      description,
      due_date: dueDateRaw || null,
      points_reward: pointsReward,
      created_by: currentMember.id,
    })
    .select("id")
    .single();

  if (error || !project) {
    return { error: "สร้างโปรเจคไม่สำเร็จ กรุณาลองใหม่" };
  }

  if (memberIds.length > 0) {
    await supabase
      .from("project_members")
      .insert(memberIds.map((memberId) => ({ project_id: project.id, member_id: memberId })));
  }

  revalidatePath("/projects");
  redirect(`/projects/${project.id}`);
}
