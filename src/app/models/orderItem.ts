import { Product } from "./product";

export class OrderItem {
  product: Product;
  amount: number;

  constructor(product: Product, amount: number) {
    this.product = product;
    this.amount = amount;
  }
}