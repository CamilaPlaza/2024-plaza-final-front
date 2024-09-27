import { OrderItem } from "./orderItem";

export class Order {
  id?: number;
  status: string = ''; 
  tableNumber: number = 0;
  date: string = '';
  time: string = '';
  total: string = '';
  orderItems: OrderItem[] = [];

  constructor(
    status: string,
    tableNumber: number,
    date: string,
    time: string,
    total: string,
    orderItems: OrderItem[],
    id?: number
  ) {
    this.id = id;
    this.status = status;
    this.tableNumber = tableNumber;
    this.date = date;
    this.time = time;
    this.total = total;
    this.orderItems = orderItems;
  }
}