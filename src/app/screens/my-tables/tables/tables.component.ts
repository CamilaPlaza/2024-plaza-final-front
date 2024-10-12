import { TableService } from 'src/app/services/table_service';
import { Component, OnInit } from '@angular/core';
import { Table } from 'src/app/models/table';

@Component({
  selector: 'app-tables',
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.css'] // Corregido 'styleUrl' a 'styleUrls'
})
export class TablesComponent implements OnInit {

  public tableScrollHeight: string = '';
  tables: Table[] = [];
  displayModal: boolean = false;
  selectedTable: Table = new Table('');
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
          this.sortTables(); // Llama a sortTables después de cargar las mesas
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
      const idA = a.id ?? Number.MAX_SAFE_INTEGER; // Si a.id es undefined, asigna un valor grande
      const idB = b.id ?? Number.MAX_SAFE_INTEGER; // Si b.id es undefined, asigna un valor grande
      return idA - idB; // Ordena las mesas por id de menor a mayor
    });
  }
  
}
