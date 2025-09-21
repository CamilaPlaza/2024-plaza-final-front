import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { TaskDTO, TaskStatus, EmbeddedTask, TaskMap } from 'src/app/models/task';
import {
  CreateTaskPayload,
  CreateAndAttachResponse,
  AssignTasksPayload,
  AssignBulkResponse,
  UpdateStatusResponse,
  GetTasksResponse,
} from 'src/app/models/payloads';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private baseUrl = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient) {}

  /** ADMIN — Crea una tarea y la adjunta al (employee, shift). POST /tasks/register */
  createAndAttachTask(input: {
    employeeId: string;
    shiftId: string;
    dto: Pick<TaskDTO, 'title' | 'description' | 'status' | 'tag'> & {
      start_at?: string;
      due_at?: string;
      id?: string;
    };
  }): Observable<CreateAndAttachResponse> {
    const embedded: EmbeddedTask = TaskMap.toEmbedded({
      id:          input.dto.id,
      title:       input.dto.title,
      description: input.dto.description,
      status:      input.dto.status,
      tag:         input.dto.tag,
      start_at:    input.dto.start_at,
      due_at:      input.dto.due_at,
    });

    const body: CreateTaskPayload = {
      id_employee: input.employeeId,
      id_shift:    input.shiftId,
      task:        embedded,
    };

    return this.http.post<CreateAndAttachResponse>(`${this.baseUrl}/tasks/register`, body);
  }

  /** ADMIN — Agrega varias tareas embebidas. POST /tasks/assign */
  assignTasksBulk(input: {
    employeeId: string;
    shiftId: string;
    list: Array<Pick<TaskDTO, 'title' | 'description' | 'status' | 'tag'> & { start_at?: string; due_at?: string; id?: string }>;
  }): Observable<AssignBulkResponse> {
    const shift_assignments: EmbeddedTask[] = input.list.map(it =>
      TaskMap.toEmbedded({
        id: it.id, title: it.title, description: it.description, status: it.status, tag: it.tag,
        start_at: it.start_at, due_at: it.due_at,
      })
    );

    const body: AssignTasksPayload = {
      id_employee: input.employeeId,
      id_shift:    input.shiftId,
      shift_assignments,
    };

    return this.http.post<AssignBulkResponse>(`${this.baseUrl}/tasks/assign`, body);
  }

  /** ADMIN/EMPLOYEE — Cambiar estado embebido. PUT /tasks/{employee}/{shift}/{task}/status/{status} */
  updateEmbeddedTaskStatus(params: {
    employeeId: string;
    shiftId: string;
    taskId: string;
    status: TaskStatus;
  }): Observable<UpdateStatusResponse> {
    const serverStatus = TaskMap.toServerStatus(params.status);
    const url = `${this.baseUrl}/tasks/${encodeURIComponent(params.employeeId)}/${encodeURIComponent(params.shiftId)}/${encodeURIComponent(params.taskId)}/status/${serverStatus}`;
    return this.http.put<UpdateStatusResponse>(url, {});
  }

  /** ADMIN/EMPLOYEE — Listado crudo. GET /tasks/by-employee/{id}?shift_id=... */
  getTasksForEmployeeRaw(employeeId: string, shiftId?: string): Observable<GetTasksResponse> {
    let params = new HttpParams();
    if (shiftId) params = params.set('shift_id', shiftId);
    return this.http.get<GetTasksResponse>(`${this.baseUrl}/tasks/by-employee/${encodeURIComponent(employeeId)}`, { params });
  }

  /** Conveniencia: mismo listado pero mapeado a tu TaskDTO para la UI. */
  getTasksForEmployeeDTO(employeeId: string, shiftId?: string): Observable<TaskDTO[]> {
    return this.getTasksForEmployeeRaw(employeeId, shiftId).pipe(
      map(resp => (resp.tasks || []).map(t => TaskMap.fromEmbedded(t, employeeId, undefined, t.id_shift)))
    );
  }
}
