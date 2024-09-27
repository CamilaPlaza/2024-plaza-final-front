import { TableService } from 'src/app/services/table_service';
import { Component, OnInit } from '@angular/core';
import { Table } from 'src/app/models/table';

@Component({
  selector: 'app-tables',
  templateUrl: './tables.component.html',
  styleUrl: './tables.component.css'
})
export class TablesComponent implements OnInit {
  
  public tableScrollHeight: string='';

  tablesExample: Table[] = [
    new Table(1, 'FREE'), new Table(2, 'FREE'), new Table(3, 'FREE'), new Table(4, 'BUSY'),
    new Table(5, 'FREE'), new Table(6, 'BUSY'), new Table(7, 'FREE'), new Table(8, 'BUSY'),
    new Table(9, 'FREE'), new Table(10, 'BUSY'), new Table(11, 'FREE'), new Table(12, 'BUSY'),
    new Table(13, 'FREE'), new Table(14, 'BUSY'), new Table(15, 'FREE'), new Table(16, 'BUSY'),
    new Table(17, 'FREE'), new Table(18, 'BUSY'), new Table(19, 'FREE'), new Table(20, 'BUSY')
  ];
  tables: Table[] = []; 
  displayModal: boolean = false;
  selectedTable: any = null;
  orderDetails: string = 'Order details go here';

  constructor(private tableService: TableService) {}

  ngOnInit(): void {
    this.loadTables();
    this.setScrollHeight();
    window.addEventListener('resize', () => {
      this.setScrollHeight();
    });
  }

  setScrollHeight() {
    if (window.innerWidth <= 768) { // Móvil
      this.tableScrollHeight = '800px';
    } else { // Pantallas más grandes
      this.tableScrollHeight = '400px';
    }
  }

  onTableClick(table: any) {
    this.selectedTable = table;
    this.displayModal = true;
  }

  // Crear una nueva orden y cambiar el estado de la mesa
  createOrder() {
    if (this.selectedTable) {
      this.selectedTable.status = 'BUSY';
      this.displayModal = false;
      // Aquí puedes añadir lógica para crear la orden real
      console.log(`Order created for table ${this.selectedTable.id}`);
    }
  }

  // Cerrar el modal
  closeModal() {
    this.displayModal = false;
  }

  loadTables(): void {
    this.tableService.getTables().subscribe({
      next: (data) => {
        console.log('Tables fetched:', data);
        if (data && data.message && Array.isArray(data.message.tables)) {
          this.tables = data.message.tables;
        } else {
          console.error('Unexpected data format:', data);
        }
      },
      error: (err) => {
        console.error('Error fetching tables:', err);
      }
    });
  }

}
