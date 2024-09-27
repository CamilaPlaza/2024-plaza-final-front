import { Order } from "./order";

export class Table {
    id: number;
    status: string = '';
    order?: Order;
    
    constructor(id: number, status: string, order? :Order) {
      this.id = id;
      this.status = status;
      this.order = order;
    }
}