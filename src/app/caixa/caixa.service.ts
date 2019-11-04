import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Produto } from '../shared/models/produto';
import { Venda } from '../shared/models/venda';
import { Cliente } from '../shared/models/cliente';
import { Deus } from '../shared/models/deus';
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
  apiURL = 'http://localhost:4200/api/rotas';
  constructor(private http: HttpClient) {}

  getProduto(id: void): Observable<Produto> {
    return this.http.get<Produto>(this.apiURL + '/produto/' + id).pipe();
  }
  insereProdvenda(id: number, qtd: number, venda: number): Observable<Produto> {
    return this.http
      .post<Produto>(this.apiURL + '/prodvenda', {
        id: id,
        qtd: qtd,
        venda: venda
      })
      .pipe();
  }
  getClientes(codigo: void, nome: void): Observable<[]> {
    return this.http
      .get<[]>(this.apiURL + '/cliente' + `?CODIGO=${codigo}&NOME=${nome}`)
      .pipe();
  }
  getCliente(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(this.apiURL + '/cliente/' + id).pipe();
  }
  getVendedores(codigo: void, nome: void): Observable<[]> {
    return this.http
      .get<[]>(this.apiURL + '/vendedor' + `?CODIGO=${codigo}&NOME=${nome}`)
      .pipe();
  }
  getVendedor(id: number): Observable<Vendedor> {
    return this.http.get<Vendedor>(this.apiURL + '/vendedor/' + id).pipe();
  }
  novaVenda(codcli: number, codvend: number): Observable<Venda> {
    return this.http
      .post<Venda>(this.apiURL + '/venda/', {
        CODCLI: codcli,
        CODVEND: codvend
      })
      .pipe();
  }
  getVendas(status: void): Observable<any[]> {
    return this.http.get<any[]>(this.apiURL + `/venda?STATUS=${status}`).pipe();
  }
  getVenda(lcto: number): Observable<Venda> {
    return this.http.get<Venda>(this.apiURL + `/venda/${lcto}`).pipe();
  }

  confirmaVenda(
    venda: Venda,
    pagamentos: Deus[],
    cartao: any[]
  ): Observable<any> {
    return this.http
      .post<any>(this.apiURL + `/confirmavenda`, {
        venda: venda,
        pagamentos: pagamentos,
        cartao: cartao
      })
      .pipe();
  }

  getProdVenda(lcto: number): Observable<Produto[]> {
    return this.http.get<Produto[]>(this.apiURL + `/prodvenda/${lcto}`).pipe();
  }
  getCartao(estabelecimento: number) {
    return this.http
      .get<any[]>(this.apiURL + `/cartao?estabelecimento=${estabelecimento}`)
      .pipe();
  }
  getBoleto(estabelecimento: number) {
    return this.http
      .get<any[]>(this.apiURL + `/boleto?estabelecimento=${estabelecimento}`)
      .pipe();
  }
}
