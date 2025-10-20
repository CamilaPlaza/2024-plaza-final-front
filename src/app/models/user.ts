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

  constructor(
    name: string,
    email: string,
    password: string,
    birthday: string,
    level: string,
    globalPoints: string,
    monthlyPoints: string,
    imageUrl: string,
    role: string
  ) {
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

import { Shift } from './shift';

export class EmployeeWithShift {
  uid: string = '';
  name: string = '';
  role: 'employee' = 'employee';
  shift: Shift | null = null;

  constructor(init?: Partial<EmployeeWithShift>) {
    Object.assign(this, init);
  }

  get shiftName(): string {
    return this.shift?.name ?? '—';
  }

  get shiftWindow(): string {
    if (!this.shift) return '—';
    const s = this.shift.start_time || '—';
    const e = this.shift.end_time || '—';
    return `${s}–${e}`;
  }
}
