  import { Component, OnInit } from '@angular/core';
  import { Product } from 'src/app/models/product';
  import { ProductService } from 'src/app/services/product_service';
  import { Router } from '@angular/router'; 
  
  @Component({
    selector: 'app-products-view',
    templateUrl: './products-view.component.html',
    styleUrls: ['./products-view.component.css']
  })
  export class ProductsViewComponent implements OnInit {
    products: Product[] = [];  // Arreglo para almacenar los productos
    categories = [
      { label: 'Breakfast', value: 'Breakfast' },
      { label: 'Lunch', value: 'Lunch' },
      { label: 'Dinner', value: 'Dinner' },
      { label: 'Drinks', value: 'Drinks' }
    ];
    displayConfirmDialog: boolean = false;
    deleteID: number = 0;
    public tableScrollHeight: string='';

    constructor(private productService: ProductService, private router: Router) {
      
    }

    ngOnInit(): void {
      this.loadProducts();

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
    // Método para cargar los productos usando el servicio
    loadProducts(): void {
      this.productService.getProducts().subscribe({
        next: (data) => {
          console.log('Products fetched:', data);
          // Accediendo correctamente a 'products'
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
    

    onRowEditInit(product: Product) {
      console.log('Row edit initialized', product);
    }

    async onRowEditSave(product: Product) {
      if (parseFloat(product.price) < 0) {
        console.error('Price cannot be negative');
        return;
      }
    
      // Asegúrate de que product.id esté definido
      if (product.id === undefined) {
        console.error('Product ID is undefined');
        return;
      }
    
      // Actualizar el precio del producto
      const priceUpdated = await this.productService.updateProductPrice(String(product.id), parseFloat(product.price));
      if (!priceUpdated) {
        console.error('Failed to update product price');
        return;
      }
    
      // Actualizar la descripción si está definida
      if (product.description) {
        const descriptionUpdated = await this.productService.updateProductDescription(String(product.id), product.description);
        if (!descriptionUpdated) {
          console.error('Failed to update product description');
          return;
        }
      }
    
      console.log('Row edit saved', product);
    }
    
    

    onRowEditCancel(product: Product, index: number) {
      console.log('Row edit cancelled', product, index);
    }

    deleteProduct() {
      this.products = this.products.filter(product => product.id !== this.deleteID);
      console.log('Product deleted:', this.deleteID);
      this.closeConfirmDialog();
    }


    customSort(event: { data: any[]; field: string; order: number }) {
      event.data.sort((data1, data2) => {
        let value1 = data1[event.field];
        let value2 = data2[event.field];
        let result = null;

        if (value1 == null && value2 != null) result = -1;
        else if (value1 != null && value2 == null) result = 1;
        else if (value1 == null && value2 == null) result = 0;
        else if (typeof value1 === 'string' && typeof value2 === 'string')
          result = value1.localeCompare(value2);
        else result = (value1 < value2) ? -1 : (value1 > value2) ? 1 : 0;

        return (event.order * result);
      });
    }

    navigateToRegisterProduct(): void {
      this.router.navigate(['/register-product']); // Asegúrate de que esta ruta esté configurada en tu router
    }

    showConfirmDialog(id: number) {
      this.deleteID = id;
      this.displayConfirmDialog = true;
    }
  
    closeConfirmDialog() {
      this.displayConfirmDialog = false;
    }
    
  }
