import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Order } from 'src/app/models/order';
import { OrderItem } from 'src/app/models/orderItem';
import { Product } from 'src/app/models/product';
import { Table } from 'src/app/models/table';
import { OrderService } from 'src/app/services/order_service';
import { ProductService } from 'src/app/services/product_service';

@Component({
  selector: 'app-table-busy',
  templateUrl: './table-busy.component.html',
  styleUrls: ['./table-busy.component.css']
})
export class TableBusyComponent implements OnInit {
  @Input() table: Table = new Table('');
  @Output() close = new EventEmitter<void>();
  ordersExample: Order[] = []
  actualOrder?: Order; 
  orderItems: OrderItem[] = [];
  products : Product[] = [];
  initialOrderItems: OrderItem[] = [];
  currentDate: string = '';
  currentTime: string = '';
  order: Order = new Order('', 0, '', '', '', []);
  selectedProduct: Product | null = null;
  selectedAmount: number = 1;
  canAddProduct: boolean = false;
  wantToAddNewProduct: boolean = false;
  displayConfirmDialog = false;
  displayCloseTableDialog = false;

  constructor(private productService: ProductService,  private orderService: OrderService) {}
  ngOnInit() {
    //TO DO: HACER EL GET DE LOS PRODUCTOS
    this.loadProducts();
    this.getOrderInformation();
    this.orderItems = this.actualOrder?.orderItems ?? [];
    this.initialOrderItems = JSON.parse(JSON.stringify(this.orderItems));
    this.currentDate = this.actualOrder?.date ?? '';
    this.currentTime = this.actualOrder?.time ?? '';
    this.order = this.actualOrder ?? new Order('', 0, '', '', '', []);
  }

  getOrderInformation(){
    //Hacer un get de todas las orders
    if (this.table.order_id) {
      this.actualOrder = this.ordersExample.find(order => order.id === this.table.order_id);
    }
    return undefined;
  }

  fetchProductDetailsForOrderItems() {
  for (const item of this.orderItems) {
      try {
          // Fetch product details using the product_id from the order item
          const product = this.productService.getProductById(item.product_id.toString());
          if (product) {
              // Optionally, you can store the fetched product details in a separate array
              // Here, I'm adding a product field directly to the order item if needed in future
              // item.productDetails = product; // Uncomment if you want to store product details
          } else {
              console.error(`Product not found for ID: ${item.product_id.toString()}`);
          }
      } catch (error) {
          console.error('Error fetching product details:', error);
      }
  }
}


  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (data) => {
        console.log('Products fetched:', data);
        if (data && Array.isArray(data.products)) {
          this.products = data.products;
        } else {
          console.error('Unexpected data format:', data);
        }
      },
      error: (err) => {
        console.error('Error fetching products:', err);
      }
      
    });
  }

  onProductChange() {
    this.validateForm();
  }

  validateForm() {
    this.canAddProduct = !!this.selectedProduct && this.selectedAmount > 0;
  }

  addNewProducts() {
    this.wantToAddNewProduct = true;
  }

  addOrderItem() {
    if (this.selectedProduct && this.selectedAmount > 0) {
      const newItem: OrderItem = {
        product_id: this.selectedProduct.id ?? 0,
        amount: this.selectedAmount
      };
      this.orderItems.push(newItem);
      this.resetForm();
    }
  }
  
  getProductById(productId: number | undefined): Product | undefined {
    if (productId === undefined) {
      console.warn('Product ID is undefined');
      return undefined; 
    }
  
    console.log('Product ID to search:', productId);
    return this.products.find(product => Number(product.id) === productId);
  }
  
  

  removeOrderItem(item: OrderItem) {
    const index = this.orderItems.indexOf(item);
    if (index > -1) {
      this.orderItems.splice(index, 1);
    }
  }

  resetForm() {
    this.selectedProduct = null;
    this.selectedAmount = 1;
    this.canAddProduct = false;
  }

  calculateTotal() {
    return this.orderItems.reduce((total, item) => {
      const product = this.products.find(p => p.id === item.product_id);
      console.log(product);
      return product ? total + item.amount * parseFloat(product.price) : total;
    }, 0);
  }

  createOrder() {
    console.log('ADD ORDER ITEMS');
    const total = this.calculateTotal();
    this.order = {
      status: 'BUSY',
      tableNumber: this.table?.id ?? 0,
      date: this.currentDate,
      time: this.currentTime,
      total: total.toString(),
      orderItems: this.orderItems
    };
    console.log('ORDER: ', this.order);
    this.closeConfirmDialog();
  
    // Prepare the order items to send to the backend
    const newItems = this.orderItems.map(item => {
      // Check if product and product ID are defined
      if (item.product_id.toString() && item.product_id.toString() !== undefined) {
        return {
          product_id: item.product_id.toString(), // Convert product ID to string
          amount: item.amount
        };
      } else {
        console.error('Product or Product ID is undefined:', item);
        return null; // Return null if product ID is not valid
      }
    }).filter(item => item !== null); // Filter out any null items
  
    // Check if order_id is defined
    if (this.table.order_id) {
      // Call the service to add new items to the existing order
      this.orderService.addOrderItems(this.table.order_id.toString(), newItems).then(success => {
        if (success) {
          console.log('Order items added successfully');
          this.closeTable(); // Close the table if the update is successful
        } else {
          console.error('Error adding order items.');
        }
      });
    } else {
      console.error('Order ID is undefined.');
      // Handle the case where order_id is not defined (e.g., show a message to the user)
    }
  }

  closeTable() {
    this.table.status = 'FREE';
    this.actualOrder = undefined;
    this.closeDialog();
  }

  closeTableAndSaveChanges() {
    this.createOrder();
    this.closeTable();
  }

  closeDialog() {
    console.log('Dialog closed');
    this.wantToAddNewProduct = false;
    this.close.emit();
  }

  showConfirmDialog() {
    if (this.hasChanges()) {
      this.displayConfirmDialog = true;
    } else {
      this.closeDialog();
    }
  }

  hasChanges(): boolean {
    return JSON.stringify(this.orderItems) !== JSON.stringify(this.initialOrderItems);
  }

  closeConfirmDialog() {
    this.displayConfirmDialog = false;
    this.closeDialog();
  }

  showCloseTableDialog() {
    this.displayCloseTableDialog = true;
  }

  closeCloseTableDialog() {
    this.displayCloseTableDialog = false;
  }
}
