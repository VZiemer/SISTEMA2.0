import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { HttpHeaders } from "@angular/common/http";

import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { Produto } from "../shared/models/produto";
import { Venda } from "../shared/models/venda";
import { Cliente } from "../shared/models/cliente";

import { Param } from "../shared/models/param";
import { Deus } from "../shared/models/deus";
import { Vendedor } from "../shared/models/vendedor";
// import { HttpErrorHandler, HandleError } from '';

const httpOptions = {
  headers: new HttpHeaders({
    "Content-Type": "application/json"
  })
};
@Injectable({
  providedIn: "root"
})
export class CaixaService {
  // apiURL = "http://localhost:4200/api/rotas";
  apiURL = "http://sistema.florestalferragens.com.br/rotas";
  constructor(private http: HttpClient) { }



  getTributosIbpt(ncm: string, uf: string): Observable<any> {
    return this.http.get<any>(`http://ibpt.nfe.io/ncm/${uf}/${ncm}.json`).pipe();
  }

  getProduto(id: void): Observable<Produto> {
    return this.http.get<Produto>(this.apiURL + "/produto/" + id).pipe();
  }
  insereProdvenda(id: number, qtd: number, venda: number): Observable<Produto> {
    return this.http
      .post<Produto>(this.apiURL + "/prodvenda", {
        id: id,
        qtd: qtd,
        venda: venda
      })
      .pipe();
  }
  getClientes(codigo: void, nome: void): Observable<[]> {
    return this.http
      .get<[]>(this.apiURL + "/cliente" + `?CODIGO=${codigo}&NOME=${nome}`)
      .pipe();
  }
  getCliente(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(this.apiURL + "/cliente/" + id).pipe();
  }
  getParceiros(codigo: void, nome: void, tipoParc: string): Observable<[]> {
    return this.http
      .get<[]>(
        this.apiURL +
        "/parceiro" +
        `?CODIGO=${codigo}&NOME=${nome}&TIPOPARC=${tipoParc}`
      )
      .pipe();
  }
  getParceiro(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(this.apiURL + "/parceiro/" + id).pipe();
  }
  getVendedores(codigo: void, nome: void): Observable<[]> {
    return this.http
      .get<[]>(this.apiURL + "/vendedor" + `?CODIGO=${codigo}&NOME=${nome}`)
      .pipe();
  }
  getVendedor(id: number): Observable<any> {
    return this.http.get<any>(this.apiURL + "/vendedor/" + id).pipe();
  }
  novaVenda(codcli: number, codvend: number): Observable<any[]> {
    return this.http
      .post<any[]>(this.apiURL + "/venda/", {
        CODCLI: codcli,
        CODVEND: codvend
      })
      .pipe();
  }
  getVendas(status: void): Observable<any[]> {
    return this.http.get<any[]>(this.apiURL + `/venda?status=${status}`).pipe();
  }
  getVenda(lcto: number): Observable<any[]> {
    return this.http.get<any[]>(this.apiURL + `/venda/${lcto}`).pipe();
  }
  getTipoOperacao(): Observable<any[]> {
    return this.http.get<any[]>(this.apiURL + `/tipooperacao`).pipe();
  }
  getPagamentosVenda(lcto): Observable<Deus[]> {
    return this.http.get<Deus[]>(this.apiURL + `/pagtosvenda?lcto=${lcto}`).pipe();
  }
  confirmaVenda(
    venda: Venda,
    pagamentos: Deus[],
    cartao: any[],
    boleto: any[],
    empresa: number
  ): Observable<any> {
    return this.http
      .post<any>(this.apiURL + `/confirmavenda`, {
        venda: venda,
        pagamentos: pagamentos,
        cartao: cartao,
        boleto: boleto,
        empresa: empresa
      })
      .pipe();
  }
  gravaCupom(dados: any): Observable<any> {
    return this.http
      .post<any>(this.apiURL + `/numerocupom`, { dados: dados })
      .pipe();
  }
  getParam(id: void): Observable<Param[]> {
    return this.http.get<Param[]>(this.apiURL + "/pram").pipe();
  }

  getProdVenda(lcto: number): Observable<any[]> {
    return this.http.get<any[]>(this.apiURL + `/prodvenda/${lcto}`).pipe();
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

  getEmitente(empresa: number): Observable<any> {
    return this.http
      .get<any>(this.apiURL + `/emitente?empresa= ${empresa}`)
      .pipe();
  }

  // funções da NF
  getNumNota(empresa: number): Observable<number> {
    return this.http.get<number>(this.apiURL + `/numnfe/${empresa}`).pipe();
  }
  gravaNfe(dados: any, tributos: Deus[], itens: any[], transito: number): Observable<any> {
    return this.http
      .post<any>(this.apiURL + `/nfe`, {
        dados: dados,
        tributos: tributos,
        itens: itens,
        transito: transito
      })
      .pipe();
  }
  gravaProtocolo(dados: any): Observable<any> {
    return this.http
      .post<any>(this.apiURL + `/protocolonfe`, { dados: dados })
      .pipe();
  }
}
