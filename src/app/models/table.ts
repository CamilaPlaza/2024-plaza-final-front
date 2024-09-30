import { Order } from "./order";

export class Table {
    status: string = '';
    order_id?: number;
    id?: number;
    
    constructor(status: string, id?: number, order_id?: number) {
      this.id = id;
      this.status = status;
      this.order_id = order_id;
    }
}