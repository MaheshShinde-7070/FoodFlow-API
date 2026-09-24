import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [

  // App starts here
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  // Customer
  {
    path: 'home',
    loadComponent: () =>
      import('./features/customer/home/home')
        .then(m => m.Home)
  },

  {
    path: 'menu/:id',
    loadComponent: () =>
      import('./features/customer/menu/menu')
        .then(m => m.Menu)
  },

  {
    path: 'cart',
    loadComponent: () =>
      import('./features/customer/cart/cart')
        .then(m => m.Cart)
  },

  {
    path: 'checkout',
    loadComponent: () =>
      import('./features/customer/checkout/checkout')
        .then(m => m.Checkout)
  },

  {
    path: 'my-orders',
    loadComponent: () =>
      import('./features/customer/my-orders/my-orders')
        .then(m => m.MyOrders)
  },

  {
    path: 'order/:id',
    loadComponent: () =>
      import('./features/customer/order-details/order-details')
        .then(m => m.OrderDetails)
  },

  // Authentication
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login')
        .then(m => m.LoginComponent)
  },

  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register')
        .then(m => m.RegisterComponent)
  },

  {
    path: 'delivery-register',
    loadComponent: () =>
      import('./features/auth/delivery-register/delivery-register')
        .then(m => m.DeliveryRegisterComponent)
  },

  // Restaurant / Admin
  {
    path: 'admin/orders',
    canActivate: [roleGuard],
    data: {
      roles: ['Admin']
    },
    loadComponent: () =>
      import('./features/admin/orders/orders')
        .then(m => m.Orders)
  },

  // Delivery Partner
  {
    path: 'delivery/dashboard',
    canActivate: [roleGuard],
    data: {
      roles: ['DeliveryPartner']
    },
    loadComponent: () =>
      import('./features/delivery/dashboard/dashboard')
        .then(m => m.Dashboard)
  },
  {
  path: 'admin/menu',
  canActivate: [roleGuard],
  data: { roles: ['Admin'] },
  loadComponent: () =>
    import('./features/admin/menu/menu')
      .then(m => m.Menu)
}
];
