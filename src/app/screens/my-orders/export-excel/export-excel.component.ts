import { Component, Input } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ProductService } from 'src/app/services/product_service';

@Component({
  selector: 'app-export-excel',
  templateUrl: './export-excel.component.html',
  styleUrls: ['./export-excel.component.css']
})
export class ExportExcelComponent {
  @Input() data: any[] = [];
  products: any[] = [];

  constructor(private productService: ProductService) {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (data) => {
        if (data && data.message && Array.isArray(data.products)) {
          this.products = data.products;
        }
      },
      error: (err) => {
        console.error('Error fetching products:', err);
      }
    });
  }
  
  exportToExcel(): void {
    if (this.data.length === 0) {
      return;
    }

    const formattedData = this.data.map(order => ({
      id: order.id,
      date: order.date,
      time: order.time,
      status: order.status,
      tableNumber: order.tableNumber,
      orderItems: this.formatOrderItems(order.orderItems),
      total: order.total
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(formattedData);
    const headers = ['ID', 'DATE', 'TIME', 'STATUS', 'TABLENUMBER', 'ORDERITEMS', 'TOTAL'];

    XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: 'A1' });

    // Formato para los encabezados
    const headerRow = worksheet['!rows'] || [];
    const headerCells = headers.map((_, index) => XLSX.utils.encode_cell({ r: 0, c: index }));

    headerCells.forEach(cellRef => {
      worksheet[cellRef].s = {
        fill: {
          fgColor: { rgb: "FFFF00" } // Color de fondo amarillo
        },
        font: {
          bold: true,
          color: { rgb: "000000" },
          sz: 12,
          name: "Arial"
        }
      };
    });

    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, 'orders');
  }

  private formatOrderItems(orderItems: any[]): string {
    return orderItems.map(item => {
      const product = this.products.find(p => p.id === item.product_id);
      return product ? `${product.name} - ${item.amount}` : `Producto no encontrado - ${item.amount}`;
    }).join(', ');
  }
  
  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: 'application/octet-stream' });
    saveAs(data, `${fileName}_${new Date().getTime()}.xlsx`);
  }
}
