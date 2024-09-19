export class Product {
    id?: number;
    name: string = '';
    description: string = '';
    price: string = '';
    category: string = '';

  
    constructor(name: string, description: string, price: string, category: string, id?: number) {
      this.id = id;
      this.name = name;
      this.description = description;
      this.price = price;
      this.category = category;
    }
}