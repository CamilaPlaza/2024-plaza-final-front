import { TableService } from 'src/app/services/table_service';
import { Component, OnInit } from '@angular/core';
import { Table } from 'src/app/models/table';
import { OrderService } from 'src/app/services/order_service';
import { Order } from 'src/app/models/order';
import { forkJoin } from 'rxjs';

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

  constructor(private tableService: TableService, private orderService: OrderService) {}

  ngOnInit(): void {
    this.setScrollHeight();
    this.loadData();

    window.addEventListener('resize', () => {
      this.setScrollHeight();
    });
  }

  setScrollHeight() {
    this.tableScrollHeight = window.innerWidth <= 768 ? '800px' : '400px';
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

        this.isLoading = false;
        document.body.style.overflow = '';
      },
      error: (err) => {
        console.error('Error loading data:', err);
        this.isLoading = false;
        document.body.style.overflow = '';
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

  onNotificationClick(): void {
    this.displayModalInactive = true;
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
