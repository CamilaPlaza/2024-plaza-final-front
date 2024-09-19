import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';

import { Category } from 'src/app/models/category';
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
  categories: any[] = [
    { id: '1', name: 'Breakfast', type: 'Default' },
    { id: '2', name: 'Lunch', type: 'Default' },
    { id: '3', name: 'Dinner', type: 'Default' },
    { id: '4', name: 'Drinks', type: 'Custom' }
  ];
  displayNewCategoryDialog: boolean = false;
  displayNoticeDialog: boolean = false;
  message: string = '';
  clonedCategories: { [s: string]: any } = {};

  constructor() {}

  ngOnInit() {}

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
      delete this.clonedCategories[category.id];
    } else {
    }
    this.displayConfirmDialog = false;
  }

  onRowEditCancel(category: any, index: number) {
    this.categories[index] = this.clonedCategories[category.id];
    delete this.clonedCategories[category.id];
  }

  async onNewCategory() {
    const category = new Category(this.newCategoryName, 'Custom');
    try {
      //const response = await this.productService.postCategory(category);
      this.message = 'Creation successfully';
      this.showNoticeDialog();

    } catch (error: any) {
      this.message = 'Something went wrong';
      this.showNoticeDialog();
    }
    
  }

  onDeleteCategory(category: any){

  }

  showConfirmDialog(category: any) {
    this.editingCategory = category;
    this.displayConfirmDialog = true;

  }

  closeConfirmDialog() {
    this.displayConfirmDialog = false;
  }

  //ACA

  
  showNewCategoryDialog() {
    this.displayNewCategoryDialog = true;
  }

  closeNewCategoryDialog() {
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
