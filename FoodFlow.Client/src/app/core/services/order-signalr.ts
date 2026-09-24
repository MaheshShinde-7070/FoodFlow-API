import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class OrderSignalrService {

  private hubConnection: signalR.HubConnection;

  constructor() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7172/orderHub')
      .withAutomaticReconnect()
      .build();
  }

  startConnection(): Promise<void> {
    if (
      this.hubConnection.state === signalR.HubConnectionState.Connected ||
      this.hubConnection.state === signalR.HubConnectionState.Connecting
    ) {
      return Promise.resolve();
    }

    return this.hubConnection.start();
  }

  joinOrderGroup(orderId: number) {
    return this.hubConnection.invoke('JoinOrderGroup', orderId);
  }

  onOrderStatusUpdated(callback: (data: any) => void) {
    this.hubConnection.on('OrderStatusUpdated', callback);
  }

  joinRestaurantGroup(restaurantId: number) {
    return this.hubConnection.invoke(
      'JoinRestaurantGroup',
      restaurantId
    );
  }

  onNewOrderReceived(callback: (data: any) => void) {
    this.hubConnection.on('NewOrderReceived', callback);
  }
}