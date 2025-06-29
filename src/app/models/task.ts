export class Task {
    id?: number;
    name: string = '';
    description: string = '';
    status: string = '';

    constructor(name: string, description: string, status: string, id?:number) {
      this.name = name;
      this.description = description;
      this.status = status;
      this.id = id;
    }
}
