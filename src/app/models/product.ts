export class Product {
  id?: number;
  name: string = '';
  description: string = '';
  price: string = '';
  category: string = '';
  calories: number = 0;
  cost: string = '';
  stock: string = '';
  imageUrl?: string;
  
    constructor(name: string, description: string, price: string, category: string, calories: number, cost: string, stock: string, imagerl?: string, id?: number) {
      this.id = id;
      this.name = name;
      this.description = description;
      this.price = price;
      this.category = category;
      this.calories = calories;
      this.cost = cost;
      this.stock = stock;
      this.imageUrl = imagerl;
    }
}