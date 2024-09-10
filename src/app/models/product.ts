export class Product {
    product_name: string = '';
    description: string = '';
    product_price: string = '';
  
    constructor(product_name: string, description: string, product_price: string) {
      this.product_name = product_name;
      this.description = description;
      this.product_price = product_price;
    }
}