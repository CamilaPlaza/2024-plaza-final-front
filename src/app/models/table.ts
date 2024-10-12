
export class Table {
    status: string = '';
    capacity: number = 1;
    order_id?: number;
    id?: number;
    
    constructor(status: string, capacity: number, id?: number, order_id?: number) {
      this.id = id;
      this.capacity = capacity;
      this.status = status;
      this.order_id = order_id;
    }
}