"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

type Props = {
  members: { id: string; name: string; role: string }[];
};

export function LoginForm({ members }: Props) {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    loginAction,
    undefined
  );

  return (
    <form action={action} className="mt-6 space-y-4">
      <div>
        <label htmlFor="memberId" className="block text-sm font-medium text-slate-700">
          ชื่อของคุณ
        </label>
        <select
          id="memberId"
          name="memberId"
          required
          defaultValue=""
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-indigo-500 focus:outline-none"
        >
          <option value="" disabled>
            -- เลือกชื่อ --
          </option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} ({m.role})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="pin" className="block text-sm font-medium text-slate-700">
          รหัส PIN
        </label>
        <input
          id="pin"
          name="pin"
          type="password"
          inputMode="numeric"
          required
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-indigo-500 focus:outline-none"
          placeholder="4 หลัก"
        />
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-indigo-600 py-2 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
      >
        {pending ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
      </button>

      <p className="text-center text-xs text-slate-400">
        PIN เริ่มต้น = เบอร์โทร 4 หลักท้าย
      </p>
    </form>
  );
}
