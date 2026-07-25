"use server";

import { redirect } from "next/navigation";
import { destroySessionCookie } from "@/lib/session";

export async function logoutAction() {
  await destroySessionCookie();
  redirect("/login");
}
