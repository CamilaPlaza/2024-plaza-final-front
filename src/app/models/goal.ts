export class Goal {
    id?: number;
    title: string;
    description: string;
    color: string;
    icon: string;
    date: string;
    expectedIncome: number;
    actualIncome: number;
    categoryId?: number;
    progressValue?: number;
    
    constructor(title: string, description: string, expectedIncome: number, actualIncome: number, color:string, icon:string, date: string, categoryId?: number, id?:number) {
      this.title = title;
      this.description = description;
      this.expectedIncome = expectedIncome;
      this.actualIncome = actualIncome
      this.id = id;
      this.color = color;
      this.icon = icon;
      this.date = date;
      this.categoryId = categoryId;
    }
}