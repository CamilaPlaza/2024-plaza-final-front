import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';

import { TaskDTO, TaskStatus, EmbeddedTask, TaskMap } from 'src/app/models/task';
import {
  CreateTaskPayload,
  CreateAndAttachResponse,
  AssignTasksPayload,
  AssignBulkResponse,
  UpdateStatusResponse,
  GetTasksResponse,
} from 'src/app/models/payloads';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private baseUrl = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient) {}

  /**
   * ADMIN — Crea una tarea y la adjunta al doc (employee, shift)
   * Back: POST /tasks/register
   */
  createAndAttachTask(input: {
    employeeId: string;
    shiftId: string;
    dto: Pick<TaskDTO, 'title' | 'description' | 'status' | 'tag'> & {
      start_at?: string;
      due_at?: string;
      id?: string;
    };
  }) {
    const embedded: EmbeddedTask = TaskMap.toEmbedded({
      id: input.dto.id,
      title: input.dto.title,
      description: input.dto.description,
      status: input.dto.status,
      tag: input.dto.tag,
      start_at: input.dto.start_at,
      due_at: input.dto.due_at,
    });

    const body: CreateTaskPayload = {
      id_employee: input.employeeId,
      id_shift: input.shiftId,
      task: embedded,
    };

    return this.http.post<CreateAndAttachResponse>(`${this.baseUrl}/tasks/register`, body);
  }

  /**
   * ADMIN — Agregar en lote tareas embebidas a (employee, shift)
   * Back: POST /tasks/assign
   */
  assignTasksBulk(input: {
    employeeId: string;
    shiftId: string;
    list: Array<Pick<TaskDTO, 'title' | 'description' | 'status' | 'tag'> & {
      start_at?: string; due_at?: string; id?: string;
    }>;
  }) {
    const shift_assignments: EmbeddedTask[] = input.list.map(it =>
      TaskMap.toEmbedded({
        id: it.id,
        title: it.title,
        description: it.description,
        status: it.status,
        tag: it.tag,
        start_at: it.start_at,
        due_at: it.due_at,
      })
    );

    const body: AssignTasksPayload = {
      id_employee: input.employeeId,
      id_shift: input.shiftId,
      shift_assignments,
    };

    return this.http.post<AssignBulkResponse>(`${this.baseUrl}/tasks/assign`, body);
  }

  /**
   * ADMIN/EMPLOYEE — Cambiar estado de una tarea embebida
   * Back: PUT /tasks/{employee_id}/{shift_id}/{task_id}/status/{status}
   */
  updateEmbeddedTaskStatus(params: {
    employeeId: string;
    shiftId: string;
    taskId: string;
    status: TaskStatus; // 'assigned' | 'in_progress' | 'done'
  }) {
    const serverStatus = TaskMap.toServerStatus(params.status);
    const url = `${this.baseUrl}/tasks/${encodeURIComponent(params.employeeId)}/${encodeURIComponent(params.shiftId)}/${encodeURIComponent(params.taskId)}/status/${serverStatus}`;
    return this.http.put<UpdateStatusResponse>(url, {});
  }

  /**
   * ADMIN/EMPLOYEE — Obtener tareas embebidas del empleado (opcionalmente por turno)
   * Back: GET /tasks/by-employee/{employee_id}?shift_id=...
   * Devuelve la respuesta del backend tal cual (EmbeddedTask[]).
   */
  getTasksForEmployeeRaw(employeeId: string, shiftId?: string) {
    let params = new HttpParams();
    if (shiftId) params = params.set('shift_id', shiftId);
    return this.http.get<GetTasksResponse>(`${this.baseUrl}/tasks/by-employee/${encodeURIComponent(employeeId)}`, { params });
  }

  /**
   * Conveniencia: lo mismo que arriba pero ya mapeado a tu TaskDTO para la UI.
   */
  getTasksForEmployeeDTO(employeeId: string, shiftId?: string) {
    return this.getTasksForEmployeeRaw(employeeId, shiftId).pipe(
      map(resp => (resp.tasks || []).map(t => TaskMap.fromEmbedded(t, employeeId, undefined, t.id_shift)))
    );
  }
}
