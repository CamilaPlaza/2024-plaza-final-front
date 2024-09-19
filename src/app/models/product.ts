export class Product {
    name: string = '';
    description: string = '';
    price: string = '';
    category: string = '';

  
    constructor(name: string, description: string, price: string, category: string) {
      this.name = name;
      this.description = description;
      this.price = price;
      this.category = category;
    }
}