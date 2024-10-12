export class OrderItem {
  product_id: number;
  product_name: string;
  product_price: string;
  amount: number;

  constructor(product: number, amount: number, product_name: string, product_price: string) {
    this.product_id = product;
    this.amount = amount;
    this.product_name = product_name;
    this.product_price = product_price;
  }
}