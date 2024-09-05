export class User {
    name : string = '';
    email : string = '';
    password : string = '';
    birthday : string = '';

    constructor( name: string, email: string, password: string, birthday: string) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.birthday = birthday;
    }
  }
  