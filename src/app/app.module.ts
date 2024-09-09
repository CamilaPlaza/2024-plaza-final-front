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
import { PanelMenuModule } from 'primeng/panelmenu';
import { MenuModule } from 'primeng/menu';

@NgModule({
  declarations: [
    AppComponent,
    FooterComponent,
    HeaderComponent,
    HomeComponent,
    UserProfileComponent,
    ProductsViewComponent,
    RegisterProductComponent,
    LogInComponent,
    UserRegisterComponent,
    UserForgotPasswordComponent
  ],
  imports: [
    BrowserModule,
    PanelMenuModule,
    ToastModule,
    ConfirmDialogModule,
    HttpClientModule,
    FormsModule,
    TieredMenuModule,
    PasswordModule,
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
  providers: [ConfirmationService, MessageService],
  bootstrap: [AppComponent]
})
export class AppModule { }
