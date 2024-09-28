import { Order } from "./order";

export class Table {
    status: string = '';
    order?: Order;
    id?: number;
    
    constructor(status: string, id?: number, order? :Order) {
      this.id = id;
      this.status = status;
      this.order = order;
    }
}