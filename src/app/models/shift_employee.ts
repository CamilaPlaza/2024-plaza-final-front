import { EmbeddedTask } from './task';

export interface ShiftEmployee {
  id?: string;
  id_employee: string;
  id_shift: string;
  shift_assignments: EmbeddedTask[];
  updated_at?: string;
}

export function newShiftEmployee(id_employee: string, id_shift: string): ShiftEmployee {
  return {
    id_employee,
    id_shift,
    shift_assignments: [],
  };
}
