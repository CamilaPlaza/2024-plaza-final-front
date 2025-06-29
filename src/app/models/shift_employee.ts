export class ShiftEmployee {
    id?: number;
    id_employee: string = '';
    id_shift: number;
    assigned_tasks: string[] = [];

    constructor(id_employee: string, id_shift: number, assigned_tasks: string[], id?:number) {
      this.id_employee = id_employee;
      this.id_shift = id_shift;
      this.id = id;
      this.assigned_tasks = assigned_tasks;
    }
}
