import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../../environments/environment';


import { Deus } from '../shared/models/deus';


const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};
@Injectable({
  providedIn: 'root'
})



export class FinanceiroService {
  apiURL = 'http://localhost:4200/api/rotas/';
  constructor(private http: HttpClient) { }

  getDeus(id: void): Observable<Deus[]> {
    return this.http.get<Deus[]>(this.apiURL + 'deus')
      .pipe();
  }
  getLctoDeus(id: number): Observable<Deus> {
    return this.http.get<Deus>(this.apiURL + 'deus/' + id)
      .pipe();
  }
}







