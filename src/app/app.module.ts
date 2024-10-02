import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { AppRoutingModule } from './app-routing.module';
import { FloatLabelModule } from 'primeng/floatlabel';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FooterComponent } from './screens/common/footer/footer.component';
import { HeaderComponent } from './screens/common/header/header.component';
import { HttpClientModule } from '@angular/common/http';
import { LogInComponent } from './screens/User-LogIn/log-in/log-in.component';
import { UserRegisterComponent } from './screens/User-LogIn/user-register/user-register.component';
import { UserForgotPasswordComponent } from './screens/User-LogIn/user-forgot-password/user-forgot-password.component';
import { MenubarModule } from 'primeng/menubar';
import { CalendarModule } from 'primeng/calendar';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { HomeComponent } from './screens/home/home.component';
import { DialogModule } from 'primeng/dialog';
import { UserProfileComponent } from './screens/user-profile/user-profile.component';
import { ProductsViewComponent } from './screens/product/products-view/products-view.component';
import { RegisterProductComponent } from './screens/product/register-product/register-product.component';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DatePipe } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ConfirmationPopUpComponent } from './screens/announcements/confirmation-pop-up/confirmation-pop-up.component';
import { NoticeComponent } from './screens/announcements/notice/notice.component';
import { DropdownModule } from 'primeng/dropdown';
import { CategoriesComponent } from "./screens/product/categories/categories.component";
import { TablesComponent } from './screens/my-tables/tables/tables.component';
import { OrdersComponent } from './screens/my-orders/orders/orders.component';
import { ResetPasswordComponent } from './screens/User-LogIn/reset-password/reset-password.component';
import { CaloriesComponent } from './screens/product/calories/calories.component';
import { MultiSelectModule } from 'primeng/multiselect';  
import { TableBusyComponent } from './screens/my-tables/table-busy/table-busy.component';
import { TableFreeComponent } from './screens/my-tables/table-free/table-free.component';
import { OrderInfoComponent } from './screens/my-orders/order-info/order-info.component';
import { ExportExcelComponent } from './screens/my-orders/export-excel/export-excel.component';


@NgModule({
  declarations: [
    AppComponent,
    TablesComponent,
    ExportExcelComponent,
    OrdersComponent,
    OrderInfoComponent,
    TableBusyComponent,
    TableFreeComponent,
    CaloriesComponent,
    FooterComponent,
    HeaderComponent,
    HomeComponent,
    UserProfileComponent,
    ProductsViewComponent,
    ConfirmationPopUpComponent,
    RegisterProductComponent,
    LogInComponent,
    UserRegisterComponent,
    NoticeComponent,
    UserForgotPasswordComponent,
    CategoriesComponent,
    ResetPasswordComponent
  ],
  imports: [
    BrowserModule,
    DropdownModule,
    ToastModule,
    ConfirmDialogModule,
    TagModule,
    TableModule,
    HttpClientModule,
    MultiSelectModule,
    FormsModule,
    TieredMenuModule,
    PasswordModule,
    ProgressSpinnerModule,
    ButtonModule,
    DialogModule,
    BrowserAnimationsModule,
    DividerModule,
    InputTextModule,
    AppRoutingModule,
    FloatLabelModule,
    CalendarModule,
    MenubarModule
],
  providers: [ConfirmationService, MessageService, DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
