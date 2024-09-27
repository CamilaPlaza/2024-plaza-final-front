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
  selectedTable: Table = new Table(0,'');
  selectedComponent: string = '';

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
  if (table.status === 'FREE') {
    this.selectedComponent = 'FREE';
    this.displayModal = true;
  } else if (table.status === 'BUSY') {
    this.selectedComponent = 'BUSY';
    this.displayModal = true;
  } else {
    console.log('Table is not available.');
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
