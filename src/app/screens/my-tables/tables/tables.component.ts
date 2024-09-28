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
    new Table('FREE',1), new Table('FREE',2), new Table('FREE',3), 
    new Table('BUSY', 4, 
      {
        id: 1,
        status: 'In Process',
        tableNumber: 3,
        date: '2024-09-27',
        time: '14:30',
        total: '45.00',
        orderItems: [
          { product: { id: 1, name: 'Pizza Margherita', description: 'Classic pizza with cheese and tomato', price: '15.00', category: '1, 2' }, amount: 1 },
          { product: { id: 2, name: 'Caesar Salad', description: 'Romaine lettuce with caesar dressing', price: '10.00', category: '3, 4' }, amount: 1 },
        ],
      }      
    ),
    new Table('FREE', 5), new Table('FREE', 6), new Table('FREE', 7), 
    new Table('BUSY', 8, 
      {
        id: 4,
        status: 'In Process',
        tableNumber: 2,
        date: '2024-09-27',
        time: '13:15',
        total: '30.00',
        orderItems: [
          { product: { id: 8, name: 'Burger', description: 'Beef burger with cheese and lettuce', price: '15.00', category: '2' }, amount: 1 },
          { product: { id: 9, name: 'French Fries', description: 'Golden fried potato sticks', price: '5.00', category: '1' }, amount: 1 },
          { product: { id: 10, name: 'Coke', description: 'Chilled cola drink', price: '10.00', category: '3' }, amount: 1 },
        ],
      }
      
    ),
    new Table('FREE', 9), new Table('FREE', 10), new Table('FREE', 11), new Table('FREE', 12),
    new Table('FREE', 13), new Table('FREE', 14), new Table('FREE', 15), new Table('FREE', 16),
    new Table('FREE', 17), new Table('FREE', 18), new Table('FREE', 19), new Table('FREE', 20)
  ];
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
