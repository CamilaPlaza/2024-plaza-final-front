import { Component, Input } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-export-excel',
  templateUrl: './export-excel.component.html',
  styleUrls: ['./export-excel.component.css']
})
export class ExportExcelComponent {
  @Input() data: any[] = []; // Array de órdenes

  exportToExcel(): void {
    if (!Array.isArray(this.data) || this.data.length === 0) return;

    const formattedData = this.data.map(order => ({
      id: order.id ?? '',
      date: order.date ?? '',
      time: order.time ?? '',
      status: order.status ?? '',
      tableNumber: order.tableNumber ?? '',
      // 👉 Usamos directamente los campos de orderItems
      orderItems: this.formatOrderItems(order.orderItems ?? []),
      // si el total viene como string, lo dejamos; si preferís número, parsealo
      total: order.total ?? ''
    }));

    const headers = ['ID', 'DATE', 'TIME', 'STATUS', 'TABLENUMBER', 'ORDERITEMS', 'TOTAL'];

    // Creamos sheet con datos (sin header automático)
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(formattedData, { skipHeader: true });

    // Insertamos header en la primera fila
    XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: 'A1' });

    // (Opcional) Anchos de columnas para que se vea prolijo
    worksheet['!cols'] = [
      { wch: 16 }, // ID
      { wch: 12 }, // DATE
      { wch: 10 }, // TIME
      { wch: 12 }, // STATUS
      { wch: 12 }, // TABLENUMBER
      { wch: 60 }, // ORDERITEMS
      { wch: 12 }, // TOTAL
    ];

    // (Opcional) Estilos de header — ojo: requieren soporte del build
    const headerCells = headers.map((_, index) => XLSX.utils.encode_cell({ r: 0, c: index }));
    headerCells.forEach(cellRef => {
      if (!worksheet[cellRef]) return;
      (worksheet as any)[cellRef].s = {
        fill: { fgColor: { rgb: 'FFFF00' } },
        font: { bold: true, color: { rgb: '000000' }, sz: 12, name: 'Arial' }
      };
    });

    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, 'orders');
  }

  /** Devuelve un string legible: "Café x1 ($2500), Ñoquis... x2 ($17000)" */
  private formatOrderItems(orderItems: any[]): string {
    if (!Array.isArray(orderItems) || orderItems.length === 0) return '';

    const fmtMoney = (v: string | number) => {
      const n = typeof v === 'number' ? v : Number(String(v).replace(',', '.')) || 0;
      return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
    };

    return orderItems.map(item => {
      const name = item?.product_name ?? 'Producto';
      const amount = item?.amount ?? 0;
      const price = fmtMoney(item?.product_price ?? 0);
      return `${name} x${amount} (${price})`;
    }).join(', ');
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: 'application/octet-stream' });
    saveAs(data, `${fileName}_${new Date().getTime()}.xlsx`);
  }
}
