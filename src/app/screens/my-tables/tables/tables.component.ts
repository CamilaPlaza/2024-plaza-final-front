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

  tables: Table[] = []; 
  displayModal: boolean = false;
  selectedTable: Table = new Table('');
  selectedComponent: string = '';

  constructor(private tableService: TableService) {}

  ngOnInit(): void {
    this.loadTables();
    this.sortTables();
    this.setScrollHeight();
    window.addEventListener('resize', () => {
      this.setScrollHeight();
    });
  }

  setScrollHeight() {
    if (window.innerWidth <= 768) { // Móvil
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
  } else {
    console.log('Table is not available.');
  }
}

  // Cerrar el modal
  closeModal() {
    this.displayModal = false;
    location.reload();
  }

  loadTables(): void {
    this.tableService.getTables().subscribe({
      next: (data) => {
        console.log('Tables fetched:', data);
        // Check if the response is an array
        if (Array.isArray(data)) {
            this.tables = data; // Directly assign the data
        } else {
            console.error('Unexpected data format:', data);
        }
    },
    error: (err) => {
        console.error('Error fetching tables:', err);
    }})
  }

  sortTables() {
  }
  
  
}
