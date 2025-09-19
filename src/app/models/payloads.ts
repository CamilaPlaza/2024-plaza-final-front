import { EmbeddedTask, ServerTaskStatus } from './task';

/** Requests/Responses tipados igual que el backend */

// POST /tasks/register
export interface CreateTaskPayload {
  id_employee: string;
  id_shift: string;
  task: EmbeddedTask; // puede venir sin id/status; server completa
}
export interface CreateAndAttachResponse {
  message: string;
  id: string;           // id de la tarea creada
  employee_id: string;
  shift_id: string;
}

// POST /tasks/assign
export interface AssignTasksPayload {
  id_employee: string;
  id_shift: string;
  shift_assignments: EmbeddedTask[]; // pueden venir sin id/status; server completa
}
export interface AssignBulkResponse {
  message: string;
  added: number;
}

// PUT /tasks/{employee_id}/{shift_id}/{task_id}/status/{status}
export interface UpdateStatusResponse {
  message: string;
  id: string;
  new_status: ServerTaskStatus;
}

// GET /tasks/by-employee/{employee_id}
export interface GetTasksResponse {
  tasks: Array<EmbeddedTask & { id_shift?: string }>;
}
