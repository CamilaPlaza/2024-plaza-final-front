import { Component, Output, Input, EventEmitter } from '@angular/core';
import { Product } from 'src/app/models/product';
import { ProductService } from 'src/app/services/product_service';

@Component({
  selector: 'app-update-stock',
  templateUrl: './update-stock.component.html',
  styleUrl: './update-stock.component.css'
})
export class UpdateStockComponent {
  @Input() product: Product = new Product('', '','', '',0,'', '');
  stock: string = '';
  visible: boolean = false;
  @Output() onClose = new EventEmitter<void>();
  @Output() onFailed = new EventEmitter<void>();
  @Output() onSuccess = new EventEmitter<void>();
  displayConfirmDialog: boolean = false;
  loading: boolean = false; 


  constructor(private productService: ProductService) {}

  async onUpdateStock() {
    this.loading = true;
    try {
      const response = await this.productService.updateNewStock(this.product.id?.toString() ?? '', this.stock);
      console.log('Update successful', response);
      this.closeDialog();
      this.success();

    } catch (error: any) {
      console.error('Update failed', error);
      this.failed();
      
    } finally {
    this.loading = false;
  }
    
  }

  closeDialog() {
    this.onClose.emit();
  }

  success(){
    this.onSuccess.emit();
  }

  failed(){
    this.onFailed.emit();
  }

  
  onlyAllowNumbers(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
    }
  }

  onStockChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value);
  
    if (value < 0) {
      input.value = '0';
      this.stock = '0';
    } else {
      this.stock = input.value;
    }
  }

  get totalCost(): number {
    const costPerUnit = parseFloat(this.product.cost) || 0; 
    const stockQuantity = parseFloat(this.stock) || 0; 
    return this.product ? costPerUnit * stockQuantity : 0;
  }
  
  openConfirmationPopup(){
    this.displayConfirmDialog = true;
  }
  

}
