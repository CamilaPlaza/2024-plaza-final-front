import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Table } from 'src/app/models/table';
import { TableService } from 'src/app/services/table_service';


@Component({
  selector: 'app-table-finished',
  templateUrl: './table-finished.component.html',
  styleUrl: './table-finished.component.css'
})
export class TableFinishedComponent  implements OnInit {
  @Input() table: Table = new Table('');
  @Output() close = new EventEmitter<void>();
  displayConfirmDialog = false;

  constructor(private tableService: TableService) {}
  ngOnInit() {}

  cleanTable() {
    this.tableService.cleanTable(this.table).subscribe({
      next: () => {
        console.log('Table cleaned successfully');
        this.closeDialog();
        location.reload();
      },
      error: (err) => {
        console.error('Error cleaning table:', err);
      }        
    });

  }

  closeDialog() {
    this.displayConfirmDialog = false;
    this.close.emit();  
  }

}
