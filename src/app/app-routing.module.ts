import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FooterComponent } from './screens/common/footer/footer.component';
import { HeaderComponent } from './screens/common/header/header.component';
import { LogInComponent } from './screens/User-LogIn/log-in/log-in.component';
import { UserRegisterComponent } from './screens/User-LogIn/user-register/user-register.component';
import { UserForgotPasswordComponent } from './screens/User-LogIn/user-forgot-password/user-forgot-password.component';
import { HomeComponent } from './screens/home/home.component';
import { UserProfileComponent } from './screens/user-profile/user-profile.component';
import { ProductsViewComponent } from './screens/product/products-view/products-view.component';
import { RegisterProductComponent } from './screens/product/register-product/register-product.component';
import { AuthGuard } from './services/auth_guard';
import { ResetPasswordComponent } from './screens/User-LogIn/reset-password/reset-password.component';
import { CategoriesComponent } from './screens/product/categories/categories.component';
import { TablesComponent } from './screens/tables/tables.component';
import { OrdersComponent } from './screens/orders/orders.component';

const routes: Routes = [
  { path: '', component: LogInComponent},
  { path: 'footer', component: FooterComponent},
  { path: 'header', component: HeaderComponent},
  { path: 'user-register', component: UserRegisterComponent},
  { path: 'user-forgot-password', component: UserForgotPasswordComponent},
  { path: 'categories', component: CategoriesComponent},
  { path: 'home', component: HomeComponent, canActivate:[AuthGuard]},
  { path: 'user-profile', component: UserProfileComponent, canActivate:[AuthGuard]},
  { path: 'products-view', component: ProductsViewComponent, canActivate:[AuthGuard]},
  { path: 'register-product', component: RegisterProductComponent, canActivate:[AuthGuard]},
  { path: 'reset-password', component: ResetPasswordComponent},
  { path: 'tables', component: TablesComponent},
  { path: 'orders', component: OrdersComponent},
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
