import { TableService } from 'src/app/services/table_service';
import { Component, OnInit, NgZone } from '@angular/core';
import { Table } from 'src/app/models/table';
import { OrderService } from 'src/app/services/order_service';
import { Order } from 'src/app/models/order';
import { forkJoin, of } from 'rxjs';
import { AssistanceService } from 'src/app/services/assistance_service';
import { UserService } from 'src/app/services/user_service';
import { catchError, switchMap } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

@Component({
  selector: 'app-tables',
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.css']
})
export class TablesComponent implements OnInit {

  public tableScrollHeight: string = '';
  tables: Table[] = [];
  displayModal: boolean = false;
  selectedTable: Table = new Table('', 1);
  selectedComponent: string = '';
  inactiveOrdersCount: number = 0;
  inactiveOrders: Order[] = [];
  freeTables: Table[] = [];
  displayModalInactive: boolean = false;
  isLoading: boolean = true;

  isEmployee: boolean = false;
  canInteract: boolean = false;
  showCheckInPopup: boolean = false;
  userName: string = 'Empleado';
  private employeeUid: string = '';

  private dataDone = false;
  private accessDone = false;

  constructor(
    private tableService: TableService,
    private orderService: OrderService,
    private assistance: AssistanceService,
    private userService: UserService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.setScrollHeight();
    this.bootstrapUserStream();
    this.loadAccessState();
    this.loadData();
    window.addEventListener('resize', () => this.setScrollHeight());
  }

  private bootstrapUserStream(): void {
    this.userService.currentUserData$.subscribe((data: any) => {
      if (!data) return;
      const role = String(data?.role || '').toUpperCase();
      this.userName = data?.name || this.userName;
      if (data?.uid) this.employeeUid = data.uid;
      this.isEmployee = role !== 'ADMIN';
      if (!this.isEmployee) this.canInteract = true;
    });
  }

  private maybeFinish() {
    if (this.dataDone && this.accessDone) {
      this.isLoading = false;
      document.body.style.overflow = '';
    }
  }

  setScrollHeight() {
    this.tableScrollHeight = window.innerWidth <= 768 ? '800px' : '400px';
  }

  private async ensureUidReady(): Promise<boolean> {
    if (this.employeeUid) return true;

    const uSvc = this.userService.currentUser as any;
    if (uSvc?.uid) {
      this.employeeUid = uSvc.uid;
      await this.ensureUserName(this.employeeUid);
      return true;
    }

    const auth = getAuth();
    const uFb = auth.currentUser;
    if (uFb?.uid) {
      this.employeeUid = uFb.uid;
      await this.ensureUserName(this.employeeUid);
      return true;
    }

    const uid = await new Promise<string | null>((resolve) => {
      const unsub = onAuthStateChanged(auth, (usr) => {
        this.ngZone.run(() => {
          unsub();
          resolve(usr?.uid ?? null);
        });
      });
    });

    if (uid) {
      this.employeeUid = uid;
      await this.ensureUserName(this.employeeUid);
      return true;
    }

    return false;
  }

  private async ensureUserName(uid: string): Promise<void> {
    try {
      const obs = await this.userService.getUserDataFromFirestore(uid);
      const data: any = await firstValueFrom(obs);
      this.userName = data?.name || this.userName;
      const role = String(data?.role || '').toUpperCase();
      this.isEmployee = role !== 'ADMIN';
      if (!this.isEmployee) this.canInteract = true;
    } catch {}
  }

  private async loadAccessState(): Promise<void> {
    const u = this.userService.currentUser;

    if (!u?.uid) {
      const ok = await this.ensureUidReady();
      if (!ok) {
        this.isEmployee = true;
        this.canInteract = false;
        this.accessDone = true;
        this.maybeFinish();
        return;
      }
    } else {
      this.employeeUid = u.uid;
      await this.ensureUserName(this.employeeUid);
    }

    if (!this.isEmployee) {
      this.canInteract = true;
      this.accessDone = true;
      this.maybeFinish();
      return;
    }

    this.assistance.getOpenAttendance(this.employeeUid).pipe(
      catchError(() => of(null))
    ).subscribe((att: any) => {
      this.canInteract = !!att?.open;
      this.accessDone = true;
      this.maybeFinish();
    });
  }

  loadData(): void {
    this.isLoading = true;
    document.body.style.overflow = 'hidden';

    forkJoin({
      tables: this.tableService.getTables(),
      orders: this.orderService.getOrders()
    }).subscribe({
      next: ({ tables, orders }) => {
        if (Array.isArray(tables)) {
          this.tables = tables;
          this.sortTables();
          this.freeTables = this.tables.filter(t => t.status === 'FREE');
        }
        if (orders && Array.isArray(orders)) {
          this.inactiveOrders = orders.filter(o => o.status === 'INACTIVE');
          this.inactiveOrdersCount = this.inactiveOrders.length;
        }
        this.dataDone = true;
        this.maybeFinish();
      },
      error: () => {
        this.dataDone = true;
        this.maybeFinish();
      }
    });
  }

  sortTables() {
    this.tables.sort((a, b) => {
      const idA = a.id ?? Number.MAX_SAFE_INTEGER;
      const idB = b.id ?? Number.MAX_SAFE_INTEGER;
      return idA - idB;
    });
  }

  onTableClick(table: any) {
    this.selectedTable = table;
    this.selectedComponent = table.status;
    this.displayModal = true;
  }

  onNotificationBell(): void {
    if (this.isEmployee && !this.canInteract) return;
    this.displayModalInactive = true;
  }

  async openCheckInPopup(): Promise<void> {
    if (!this.isEmployee) return;
    const ok = await this.ensureUidReady();
    if (!ok) return;
    this.showCheckInPopup = true;
  }

  onCheckInPopupClosed(): void {
    this.showCheckInPopup = false;
    if (!this.employeeUid) return;
    this.assistance.getOpenAttendance(this.employeeUid).subscribe({
      next: (att: any) => { this.canInteract = !!att?.open; },
      error: () => {},
    });
  }

  closeModal() {
    this.displayModal = false;
    location.reload();
  }

  closeModalInactive() {
    this.displayModalInactive = false;
    location.reload();
  }
}
