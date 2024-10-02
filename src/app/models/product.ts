export class Product {
    id?: number;
    name: string = '';
    description: string = '';
    price: string = '';
    category: string = '';
    calories: number;

  
    constructor(name: string, description: string, price: string, category: string, calories:number, id?: number) {
      this.id = id;
      this.name = name;
      this.description = description;
      this.price = price;
      this.category = category;
      this.calories = calories;
    }
}