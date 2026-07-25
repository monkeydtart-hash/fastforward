import "server-only";
import { redirect } from "next/navigation";
import { supabase } from "./supabase";
import { readSession } from "./session";
import type { SessionMember } from "./types";

export async function getCurrentMember(): Promise<SessionMember | null> {
  const session = await readSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from("members")
    .select("id, name, role, avatar_color")
    .eq("id", session.memberId)
    .single();

  if (error || !data) return null;
  return data;
}

export async function requireSession(): Promise<SessionMember> {
  const member = await getCurrentMember();
  if (!member) {
    redirect("/login");
  }
  return member;
}
