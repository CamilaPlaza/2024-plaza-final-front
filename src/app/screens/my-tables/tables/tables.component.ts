import { TableService } from 'src/app/services/table_service';
import { Component, OnInit } from '@angular/core';
import { Table } from 'src/app/models/table';
import { OrderService } from 'src/app/services/order_service';
import { Order } from 'src/app/models/order';

@Component({
  selector: 'app-tables',
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.css']
})
export class TablesComponent implements OnInit {

  public tableScrollHeight: string = '';
  tables: Table[] = [];
  displayModal: boolean = false;
  selectedTable: Table = new Table('',1);
  selectedComponent: string = '';
  inactiveOrdersCount: number = 0; 
  inactiveOrders: Order[] = [];

  constructor(private tableService: TableService, private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadTables();
    this.loadOrders();
    this.setScrollHeight();
    window.addEventListener('resize', () => {
      this.setScrollHeight();
    });

  }

  setScrollHeight() {
    if (window.innerWidth <= 768) {
      this.tableScrollHeight = '800px';
    } else {
      this.tableScrollHeight = '400px';
    }
  }

  onTableClick(table: any) {
    this.selectedTable = table;
    if (table.status === 'FREE') {
      this.selectedComponent = 'FREE';
      this.displayModal = true;
    } else if (table.status === 'BUSY') {
      this.selectedComponent = 'BUSY';
      this.displayModal = true;
    } else if (table.status === 'FINISHED') {
      this.selectedComponent = 'FINISHED';
      this.displayModal = true;
    } else {
      console.log('Table is not available.');
    }
  }

  onNotificationClick(): void {
    this.displayModal = true; 
  }

  closeModal() {
    this.displayModal = false;
    location.reload();
  }

  loadTables(): void {
    this.tableService.getTables().subscribe({
      next: (data) => {
        console.log('Tables fetched:', data);
        if (Array.isArray(data)) {
          this.tables = data; 
          this.sortTables();
        } else {
          console.error('Unexpected data format:', data);
        }
      },
      error: (err) => {
        console.error('Error fetching tables:', err);
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

  loadOrders(): void {
    this.orderService.getInactiveOrders().subscribe({
      next: (data) => {
        console.log('Orders fetched:', data);
        if (data && Array.isArray(data)) {
          this.inactiveOrders = data.filter(order => order.status === 'INACTIVE');
          this.countInactiveOrders();
        } else {
          console.error('Unexpected data format:', data);
        }
      },
      error: (err) => {
        console.error('Error fetching orders:', err);
      }
    });
  }

  countInactiveOrders() {
    this.inactiveOrdersCount = this.inactiveOrders.length;
  }
  
  
}
