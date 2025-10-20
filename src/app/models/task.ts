export type TaskStatus = 'assigned' | 'in_progress' | 'done';

export type ServerTaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export type UserRole = 'employee' | 'admin';

export interface UiUser {
  uid: string;
  name: string;
  role: UserRole;
  requiresAttendance: boolean;
}

export interface EmbeddedTask {
  id: string;
  name: string;
  description: string;
  status: ServerTaskStatus;
  tag?: string;
  created_at?: string; // ISO
  created_by?: string; // uid admin creador
  start_at?: string;   // ISO (opcional)
  due_at?: string;
}

export interface TaskDTO {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  tag?: string;
  assignee_uid?: string;
  assignee_name?: string;
  shift_window?: { start: string; end: string };
  created_at?: string;
  created_by?: string;
  id_shift?: string;
}

export const TaskMap = {
  toServerStatus(s?: TaskStatus): ServerTaskStatus {
    switch (s) {
      case 'in_progress': return 'IN_PROGRESS';
      case 'done':        return 'COMPLETED';
      case 'assigned':
      default:            return 'PENDING';
    }
  },
  toClientStatus(s?: ServerTaskStatus | string): TaskStatus {
    switch (s) {
      case 'IN_PROGRESS': return 'in_progress';
      case 'COMPLETED':   return 'done';
      case 'PENDING':
      default:            return 'assigned';
    }
  },
  fromEmbedded(t: EmbeddedTask, employeeId?: string, employeeName?: string, idShift?: string): TaskDTO {
    return {
      id: t.id,
      title: t.name,
      description: t.description,
      status: TaskMap.toClientStatus(t.status),
      tag: t.tag,
      assignee_uid: employeeId,
      assignee_name: employeeName,
      shift_window: t.start_at || t.due_at ? { start: t.start_at || '', end: t.due_at || '' } : undefined,
      created_at: t.created_at,
      created_by: t.created_by,
      id_shift: idShift,
    };
  },
  toEmbedded(dto: Pick<TaskDTO, 'title' | 'description' | 'status' | 'tag'> & {
    id?: string;
    start_at?: string;
    due_at?: string;
  }): EmbeddedTask {
    return {
      id: dto.id ?? '',
      name: dto.title,
      description: dto.description ?? '',
      status: TaskMap.toServerStatus(dto.status),
      tag: dto.tag,
      start_at: dto.start_at,
      due_at: dto.due_at,
    };
  },
};
