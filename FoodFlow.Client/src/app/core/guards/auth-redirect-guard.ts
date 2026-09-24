import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authRedirectGuard: CanActivateFn = () => {

  const router = inject(Router);

  const token = localStorage.getItem('token');

  // Not logged in → Login page
  if (!token) {
    return router.createUrlTree(['/login']);
  }

  try {

    // Read JWT payload
    const payload = JSON.parse(atob(token.split('.')[1]));

    const role =
      payload[
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
      ];

    // Redirect according to role
    if (role === 'Admin') {
      return router.createUrlTree(['/admin/orders']);
    }

    if (role === 'DeliveryPartner') {
      return router.createUrlTree(['/delivery/dashboard']);
    }

    if (role === 'Customer') {
      return router.createUrlTree(['/home']);
    }

    // Unknown role
    localStorage.removeItem('token');
    localStorage.removeItem('role');

    return router.createUrlTree(['/login']);

  } catch {

    // Invalid JWT
    localStorage.removeItem('token');
    localStorage.removeItem('role');

    return router.createUrlTree(['/login']);
  }
};
