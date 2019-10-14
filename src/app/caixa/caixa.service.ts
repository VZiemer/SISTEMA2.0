import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Produto } from '../shared/models/produto';
import { Venda } from '../shared/models/venda';
import { Cliente } from '../shared/models/cliente';
import { Vendedor } from '../shared/models/vendedor';
// import { HttpErrorHandler, HandleError } from '';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};
@Injectable({
  providedIn: 'root'
})
export class CaixaService {
  apiURL = 'http://localhost:4200/api/rotas/';
  constructor(private http: HttpClient) { }

  getProduto(id: void): Observable<Produto> {
    return this.http.get<Produto>(this.apiURL + 'produto/' + id)
      .pipe();
  }
  getClientes(codigo: void, razao: void): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.apiURL + 'cliente' + `?CODIGO=${codigo}&RAZAO=${razao}`)
      .pipe();
  }
  getCliente(id: void): Observable<Cliente> {
    return this.http.get<Cliente>(this.apiURL + 'cliente/' + id)
      .pipe();
  }
  getVendedor(id: void): Observable<Vendedor> {
    return this.http.get<Vendedor>(this.apiURL + 'vendedor/' + id)
      .pipe();
  }

  // getVenda(cliente: void): Observable<Produto> {
  //   // return this.http.get<Produto>(this.apiURL + 'venda/'+ `?CODIGO=${codigo}`)
  //     // .pipe();
  // }
}





