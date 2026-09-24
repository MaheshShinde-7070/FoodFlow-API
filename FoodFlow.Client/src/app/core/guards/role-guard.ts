import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const roleGuard: CanActivateFn = (route) => {

  const router = inject(Router);

  const token = localStorage.getItem('token');

  // User is not logged in
  if (!token) {
    return router.createUrlTree(['/login']);
  }

  try {

    // Read JWT payload
    const payload = JSON.parse(atob(token.split('.')[1]));

    // Read role from JWT
    const role =
      payload[
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
      ];

    // Get allowed roles from route
    const allowedRoles = route.data['roles'] as string[];

    // Check whether user's role is allowed
    if (allowedRoles.includes(role)) {
      return true;
    }

    // User is logged in but does not have permission
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
    return router.createUrlTree(['/login']);

  } catch (error) {

    // Invalid or corrupted token
    console.error('Invalid JWT token:', error);

    localStorage.removeItem('token');
    localStorage.removeItem('role');

    return router.createUrlTree(['/login']);
  }
};
