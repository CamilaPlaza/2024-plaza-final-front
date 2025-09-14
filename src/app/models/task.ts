
export type TaskStatus = 'assigned' | 'in_progress' | 'done';

export interface TaskDTO {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  tag?: string;
  assignee_uid?: string;
  assignee_name?: string;
  shift_window?: { start: string; end: string };
}

export type UserRole = 'employee' | 'admin';

export interface UiUser {
  uid: string;
  name: string;
  role: UserRole;
  requiresAttendance: boolean;
}
