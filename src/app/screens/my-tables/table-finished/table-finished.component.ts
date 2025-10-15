import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Table } from 'src/app/models/table';
import { TableService } from 'src/app/services/table_service';

@Component({
  selector: 'app-table-finished',
  templateUrl: './table-finished.component.html',
  styleUrl: './table-finished.component.css'
})
export class TableFinishedComponent  implements OnInit {
  @Input() table: Table = new Table('',1);
  @Input() readOnly: boolean = false;
  @Output() close = new EventEmitter<void>();
  displayConfirmDialog = false;
  loading: boolean = false;

  constructor(private tableService: TableService) {}
  ngOnInit() {}

  cleanTable() {
    if (this.readOnly) return;
    this.loading = true;
    this.tableService.cleanTable(this.table).subscribe({
      next: () => {
        this.loading = false;
        this.closeDialog();
        location.reload();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  closeDialog() {
    this.displayConfirmDialog = false;
    this.close.emit();
  }
}
