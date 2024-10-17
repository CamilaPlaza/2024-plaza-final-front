export class Category {
    id?: number;
    name: string = '';
    type: string = '';
    color? : string = '';
    
    constructor(name: string, type: string, id?:number, color?: string) {
      this.name = name;
      this.type = type;
      this.id = id;
      this.color = color;
    }
}