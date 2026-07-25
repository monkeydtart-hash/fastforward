"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";
import { createSessionCookie } from "@/lib/session";

export type LoginState = { error: string } | undefined;

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const memberId = String(formData.get("memberId") ?? "");
  const pin = String(formData.get("pin") ?? "");

  if (!memberId || !pin) {
    return { error: "กรุณาเลือกชื่อและกรอกรหัส PIN" };
  }

  const { data: member, error } = await supabase
    .from("members")
    .select("id, pin_hash")
    .eq("id", memberId)
    .single();

  if (error || !member) {
    return { error: "ไม่พบสมาชิกนี้" };
  }

  const valid = await bcrypt.compare(pin, member.pin_hash);
  if (!valid) {
    return { error: "รหัส PIN ไม่ถูกต้อง" };
  }

  await createSessionCookie(member.id);
  redirect("/dashboard");
}
