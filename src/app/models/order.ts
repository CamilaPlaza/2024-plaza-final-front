export class Order {
    id?: number;
    name: string = '';
    type: string = '';
    
    constructor(name: string, type: string, id?:number) {
      this.name = name;
      this.type = type;
      this.id = id;
    }
}