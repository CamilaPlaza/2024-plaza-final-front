export class OrderItem {
  product_id: number;
  amount: number;

  constructor(product: number, amount: number) {
    this.product_id = product;
    this.amount = amount;
  }
}