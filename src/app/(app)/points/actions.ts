"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { requireSession } from "@/lib/auth";

export type AddPointsState = { error: string } | { success: true } | undefined;

export async function addPointsAction(
  _prevState: AddPointsState,
  formData: FormData
): Promise<AddPointsState> {
  const currentMember = await requireSession();

  const memberId = String(formData.get("memberId") ?? "");
  const pointsRaw = String(formData.get("points") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  const points = Number(pointsRaw);
  if (!memberId || !reason || !Number.isFinite(points) || points === 0) {
    return { error: "กรุณากรอกข้อมูลให้ครบและระบุคะแนนที่ไม่เป็นศูนย์" };
  }

  const { error } = await supabase.from("point_logs").insert({
    member_id: memberId,
    points: Math.round(points),
    reason,
    created_by: currentMember.id,
  });

  if (error) {
    return { error: "บันทึกคะแนนไม่สำเร็จ กรุณาลองใหม่" };
  }

  revalidatePath("/points");
  revalidatePath("/dashboard");
  return { success: true };
}
