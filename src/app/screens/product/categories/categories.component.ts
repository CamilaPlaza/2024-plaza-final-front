import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { Category } from 'src/app/models/category';
import { CategoryService } from 'src/app/services/category_service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<void>();
  displayConfirmDialog: boolean = false;
  editingCategory: any;
  newCategoryName: string = '';
  showPanel = true;
  displayNewCategoryDialog: boolean = false;
  displayNoticeDialog: boolean = false;
  message: string = '';
  clonedCategories: { [s: string]: any } = {};
  categories: Category[] = [];
  defaultCategoryNames: string[] = [];
  displayDeleteDialog: boolean = false;
  categoryToDelete: any;

  constructor(private categoryService: CategoryService) {}

  ngOnInit() {
    this.loadCategories(); // Cargar categorías por defecto
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe(
      (data) => {
        this.categories = data;
      },
      (error: any) => {
        console.error('Error loading categories', error);
      }
    );
  }

  handleSave() {
    this.showPanel = false;
    setTimeout(() => {
      this.onSave.emit();
    }, 1000);
  }

  onRowEditInit(category: any) {
    this.clonedCategories[category.id] = { ...category };
  }

  onRowEditSave() {
    const category = this.editingCategory;
    if (category.name.trim()) {
        // Check for duplicates before updating
        if (this.categories.some(cat => cat.id !== category.id && cat.name.toLowerCase() === category.name.trim().toLowerCase())) {
            this.message = 'Category cannot be repeated.';
            this.showNoticeDialog();
            return;
        }

        this.categoryService.updateCategoryName(category.id, category.name).subscribe(
            () => {
                delete this.clonedCategories[category.id];
                this.editingCategory = null;
                this.loadCategories();
            },
            (error: any) => {
                console.error('Error updating category', error);
            }
        );
    }
    this.displayConfirmDialog = false;
}

  onRowEditCancel(category: any, index: number) {
    this.categories[index] = this.clonedCategories[category.id];
    delete this.clonedCategories[category.id];
  }

  async onNewCategory() {
    const categoryName = this.newCategoryName.trim().toLowerCase();

    // Check for duplicates in all categories
    if (this.categories.some(cat => cat.name.toLowerCase() === categoryName)) {
        this.message = `The category name "${this.newCategoryName}" already exists.`;
        this.showNoticeDialog();
        return;
    }

    const category = new Category(this.newCategoryName, 'Custom');
    try {
        await this.categoryService.createCategory(category).toPromise();
        this.message = 'Creation successful';
        this.loadCategories();
        this.closeNewCategoryDialog();
        this.showNoticeDialog();
    } catch (error: any) {
        this.message = 'Something went wrong';
        this.showNoticeDialog();
    }
}

  onDeleteCategory() {
    if (this.categoryToDelete.id !== undefined) {
      this.categoryService.deleteCategory(this.categoryToDelete.id.toString()).subscribe(
        () => {
          this.loadCategories(); // Recargar categorías después de eliminar
        },
        (error) => {
          console.error('Error deleting category:', error);
        }
      );
    } else {
      console.error('Category ID is undefined');
    }
  }

  showDeleteDialog(category: any){
    this.categoryToDelete = category;
    this.displayDeleteDialog = true;

  }

  closeDeleteDialog() {
    this.displayDeleteDialog = false;
  }

  
  showConfirmDialog(category: any) {
    this.editingCategory = category;
    this.displayConfirmDialog = true;
  }

  closeConfirmDialog() {
    this.displayConfirmDialog = false;
  }

  showNewCategoryDialog() {
    this.displayNewCategoryDialog = true;
  }

  closeNewCategoryDialog() {
    this.newCategoryName = ''; // Limpiar el nombre de la nueva categoría
    this.displayNewCategoryDialog = false;
  }

  showNoticeDialog() {
    this.closeNewCategoryDialog();
    this.displayNoticeDialog = true;
  }

  closeNoticeDialog() {
    this.displayNoticeDialog = false;
  }
  
}
