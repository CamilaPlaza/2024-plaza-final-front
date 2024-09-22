export class Ingredient {
    id?: number;
    name: string = '';
    calories: number;
    
    constructor(name: string, calories: number, id?:number) {
      this.name = name;
      this.calories = calories;
      this.id = id;
    }
}