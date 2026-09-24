import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CreateOrder } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private apiUrl = 'https://foodflow-api-st1v.onrender.com';

  private deliveryPartnerApiUrl =
    'https://foodflow-api-st1v.onrender.com';

  constructor(private http: HttpClient) {}

  // Customer: Create order
  createOrder(order: CreateOrder) {
    return this.http.post(this.apiUrl, order);
  }

  // Customer: Get my orders
  getMyOrders() {
    return this.http.get<any[]>(
      `${this.apiUrl}/my-orders`
    );
  }

  // Customer: Cancel order
  cancelOrder(orderId: number) {
    return this.http.patch(
      `${this.apiUrl}/${orderId}/cancel`,
      {}
    );
  }

  // Customer: Get order details
  getOrder(orderId: number) {
    return this.http.get<any>(
      `${this.apiUrl}/${orderId}`
    );
  }

  // Restaurant: Get restaurant orders
  getRestaurantOrders(restaurantId: number) {
    return this.http.get<any[]>(
      `${this.apiUrl}/restaurant/${restaurantId}`
    );
  }

  // Restaurant: Accept order
  acceptOrder(orderId: number) {
    return this.http.patch(
      `${this.apiUrl}/${orderId}/accept`,
      {}
    );
  }

  // Restaurant: Reject order
  rejectOrder(orderId: number) {
    return this.http.patch(
      `${this.apiUrl}/${orderId}/reject`,
      {}
    );
  }

  // Restaurant: Start preparing
  markPreparing(orderId: number) {
    return this.http.patch(
      `${this.apiUrl}/${orderId}/preparing`,
      {}
    );
  }

  // Restaurant: Mark order ready
  markReady(orderId: number) {
    return this.http.patch(
      `${this.apiUrl}/${orderId}/ready`,
      {}
    );
  }

  // Delivery Partner: Get assigned orders
  getDeliveryPartnerOrders() {
    return this.http.get<any[]>(
      `${this.deliveryPartnerApiUrl}/my-orders`
    );
  }

  // Delivery Partner: Accept delivery
  acceptDelivery(orderId: number) {
    return this.http.patch(
      `${this.deliveryPartnerApiUrl}/orders/${orderId}/accept`,
      {}
    );
  }

  // Delivery Partner: Mark order picked up
  markPickedUp(orderId: number) {
    return this.http.patch(
      `${this.deliveryPartnerApiUrl}/orders/${orderId}/pickup`,
      {}
    );
  }

  // Delivery Partner: Mark order on the way
  markOnTheWay(orderId: number) {
    return this.http.patch(
      `${this.deliveryPartnerApiUrl}/orders/${orderId}/on-the-way`,
      {}
    );
  }

  // Delivery Partner: Mark order delivered
  markDelivered(orderId: number) {
    return this.http.patch(
      `${this.deliveryPartnerApiUrl}/orders/${orderId}/delivered`,
      {}
    );
  }

  // Admin/Restaurant: Assign delivery partner
  assignDeliveryPartner(
    orderId: number,
    deliveryPartnerId: number
  ) {
    return this.http.patch(
      `${this.apiUrl}/${orderId}/assign-delivery-partner`,
      {
        deliveryPartnerId: deliveryPartnerId
      }
    );
  }

  // Admin/Restaurant: Get available delivery partners
  getAvailableDeliveryPartners() {
    return this.http.get<any[]>(
      `${this.deliveryPartnerApiUrl}/available`
    );
  }

  
// Delivery Partner: Get my profile
getDeliveryPartnerProfile() {
  return this.http.get<any>(
    `${this.deliveryPartnerApiUrl}/my-profile`
  );
}

}