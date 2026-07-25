"use client";

import { useActionState } from "react";
import { createProjectAction, type CreateProjectState } from "./actions";

export function CreateProjectForm({
  members,
}: {
  members: { id: string; name: string }[];
}) {
  const [state, action, pending] = useActionState<CreateProjectState, FormData>(
    createProjectAction,
    undefined
  );

  return (
    <form action={action} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="name"
          type="text"
          required
          placeholder="ชื่อโปรเจค"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none sm:col-span-2"
        />
        <textarea
          name="description"
          placeholder="รายละเอียด (ถ้ามี)"
          rows={2}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none sm:col-span-2"
        />
        <input
          name="dueDate"
          type="date"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
        />
        <input
          name="pointsReward"
          type="number"
          min={0}
          placeholder="คะแนนรางวัลเมื่อเสร็จ"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
        />
      </div>

      <div>
        <p className="mb-1 text-sm font-medium text-slate-700">ผู้รับผิดชอบ</p>
        <div className="flex flex-wrap gap-3">
          {members.map((m) => (
            <label key={m.id} className="flex items-center gap-1.5 text-sm text-slate-600">
              <input type="checkbox" name="memberIds" value={m.id} className="rounded" />
              {m.name}
            </label>
          ))}
        </div>
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {pending ? "กำลังสร้าง..." : "สร้างโปรเจค"}
      </button>
    </form>
  );
}
