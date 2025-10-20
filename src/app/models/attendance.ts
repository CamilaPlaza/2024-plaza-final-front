export class Attendance {
    id?: number;
    id_employee: string;
    check_in_time: string;
    check_out_time: string;
    shift_id: string;
    total_hours: string;
    observations: string;

    constructor(id_employee: string, check_in_time: string, check_out_time: string, shift_id: string,
      total_hours: string, observations: string, id?:number) {
      this.id = id;
      this.id_employee = id_employee;
      this.check_in_time = check_in_time;
      this.check_out_time = check_out_time;
      this.shift_id = shift_id;
      this.total_hours = total_hours;
      this.observations = observations;
    }
}
