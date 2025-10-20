export class Shift {
    id?: number;
    start_time: string = '';
    end_time: string = '';
    status: string;
    name: string;

    constructor(start_time: string, end_time: string, status: string, name:string, id?:number) {
      this.start_time = start_time;
      this.end_time = end_time;
      this.id = id;
      this.status = status;
      this.name = name;
    }
}
