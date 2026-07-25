import Link from "next/link";
import { logoutAction } from "./actions";
import type { SessionMember } from "@/lib/types";

export function Navbar({ member }: { member: SessionMember }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-lg font-bold text-slate-800">
            ทีม 6 คน
          </Link>
          <nav className="hidden gap-4 text-sm font-medium text-slate-600 sm:flex">
            <Link href="/dashboard" className="hover:text-indigo-600">
              ภาพรวม
            </Link>
            <Link href="/points" className="hover:text-indigo-600">
              คะแนน
            </Link>
            <Link href="/projects" className="hover:text-indigo-600">
              โปรเจค
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <span
            className="hidden h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white sm:flex"
            style={{ backgroundColor: member.avatar_color }}
          >
            {member.name.slice(0, 1)}
          </span>
          <span className="text-sm text-slate-700">
            {member.name}
            <span className="ml-1 text-xs text-slate-400">({member.role})</span>
          </span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              ออกจากระบบ
            </button>
          </form>
        </div>
      </div>

      <nav className="flex gap-4 border-t border-slate-100 px-4 py-2 text-sm font-medium text-slate-600 sm:hidden">
        <Link href="/dashboard" className="hover:text-indigo-600">
          ภาพรวม
        </Link>
        <Link href="/points" className="hover:text-indigo-600">
          คะแนน
        </Link>
        <Link href="/projects" className="hover:text-indigo-600">
          โปรเจค
        </Link>
      </nav>
    </header>
  );
}
