export type Member = {
  id: string;
  name: string;
  role: string;
  phone: string;
  pin_hash: string;
  avatar_color: string;
  created_at: string;
};

export type ProjectStatus = "planning" | "in_progress" | "done" | "cancelled";

export type Project = {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  due_date: string | null;
  points_reward: number;
  created_by: string | null;
  created_at: string;
  completed_at: string | null;
};

export type PointLog = {
  id: string;
  member_id: string;
  points: number;
  reason: string;
  project_id: string | null;
  created_by: string | null;
  created_at: string;
};

export type SessionMember = Pick<Member, "id" | "name" | "role" | "avatar_color">;
