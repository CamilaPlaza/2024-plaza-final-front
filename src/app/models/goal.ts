export class Goal {
    id?: number;
    title: string;
    description: string;
    progress: number;
    color: string;
    icon: string;
    
    constructor(title: string, description: string, progress: number, color:string, icon:string, id?:number) {
      this.title = title;
      this.description = description;
      this.progress = progress;
      this.id = id;
      this.color = color;
      this.icon = icon;
    }
}