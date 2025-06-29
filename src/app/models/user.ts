export class UserData {
    name : string = '';
    email : string = '';
    password : string = '';
    birthday : string = '';
    level: string = '';
    globalPoints: string = '';
    monthlyPoints: string = '';
    imageUrl: string = '';
    role: string = '';

    constructor( name: string, email: string, password: string, birthday: string, level: string, globalPoints: string, monthlyPoints: string, imageUrl: string, role: string) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.birthday = birthday;
        this.level = level;
        this.globalPoints = globalPoints;
        this.monthlyPoints = monthlyPoints;
        this.imageUrl = imageUrl;
        this.role = role;
    }
  }
