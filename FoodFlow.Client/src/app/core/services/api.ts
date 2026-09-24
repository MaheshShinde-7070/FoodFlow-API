import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = 'https://foodflow-api-st1v.onrender.com';

  constructor(private http: HttpClient) {}

}