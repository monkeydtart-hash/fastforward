"use client";

import { useActionState, useRef, useEffect } from "react";
import { addPointsAction, type AddPointsState } from "./actions";

export function AddPointsForm({
  members,
}: {
  members: { id: string; name: string; role: string }[];
}) {
  const [state, action, pending] = useActionState<AddPointsState, FormData>(
    addPointsAction,
    undefined
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state && "success" in state) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={action}
      className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-4"
    >
      <select
        name="memberId"
        required
        defaultValue=""
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none sm:col-span-1"
      >
        <option value="" disabled>
          เลือกสมาชิก
        </option>
        {members.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>

      <input
        name="points"
        type="number"
        required
        placeholder="คะแนน (+/-)"
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
      />

      <input
        name="reason"
        type="text"
        required
        placeholder="เหตุผล เช่น ช่วยจัดงาน"
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none sm:col-span-1"
      />

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {pending ? "กำลังบันทึก..." : "บันทึกคะแนน"}
      </button>

      {state && "error" in state && (
        <p className="text-sm text-red-600 sm:col-span-4">{state.error}</p>
      )}
    </form>
  );
}
