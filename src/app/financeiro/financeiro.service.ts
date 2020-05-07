import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../../environments/environment';
import { Deus } from '../shared/models/deus';
import { Contas } from '../shared/models/contas';
import { Param } from '../shared/models/param';
import { ExternalReference } from '@angular/compiler';


const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};
@Injectable({
  providedIn: 'root'
})

export class FinanceiroService {
  // apiURL = 'http://sistema.florestalferragens.com.br/rotas';
  apiURL = 'http://localhost:4200/api/rotas';
  constructor(private http: HttpClient) { }

  getRegistrosFinanceiros(NroBotao: number, Empresa: number, dataFim: Date, dataInicio: Date, conta: number,parceiro:any ): Observable<any[]> {
    console.log('estou no serviço getRegistrosFinanceiros', 'NroBotao', NroBotao, 'Empresa', Empresa,
      'dataFim', dataFim, 'dataInicio', dataInicio, 'conta', conta, 'parceiro', parceiro);

    return this.http.get<any[]>(this.apiURL + '/deus?param=' + NroBotao +
      '&empresa=' + Empresa + '&dataFim=' + dataFim + '&dataInicio=' + dataInicio + '&conta=' + conta + '&parceiro=' + parceiro)
      .pipe();
  }


  getLctoDeus(coddec: number): Observable<any> {
    return this.http.get<any>(this.apiURL + '/deuslcto?coddec=' + coddec)
      .pipe();
  }

  getGenDeus(): Observable<any> {
    console.log('estou no servio GeneratorDeus');
    return this.http.get<any>(this.apiURL + '/deusGenerator')
      .pipe();
  }

  postLctoDeus(dados: any[]): Observable<any> {
    console.log('estou no serviço ATUALIZADEUS', dados);
    return this.http.post<any>(this.apiURL + '/Atualizadeuslcto', { 'dados': dados })
      .pipe();
  }

  postInsertDeus(dados: Deus[]): Observable<Deus[]> {
    console.log('estou no serviço', dados);
    return this.http.post<Deus[]>(this.apiURL + '/Insertdeus', { 'dados': dados })
      .pipe();
  }

  postDeleteDeus(codigo: number): Observable<number> {
    console.log('estou no serviço', codigo);
    return this.http.post<number>(this.apiURL + '/Deletedeus', { 'codigo': codigo })
      .pipe();
  }

  postLiquidaEntradaCeld(dados: any[]): Observable<any> {
    console.log('estou no serviço ATUALIZADEUS', dados);
    return this.http.post<any>(this.apiURL + '/lancaEntradaCeld', { 'pagamentos': dados })
      .pipe();
  }

  getContas(paramBusca: number, Empresa: number, Projecao: number, codigoConta: number): Observable<Contas[]> {
    console.log('serviço getContas', 'paramBusca', paramBusca, 'Empresa', Empresa, 'Projecao', Projecao, 'codigoConta', codigoConta);

    return this.http.get<Contas[]>(this.apiURL + '/contas?paramBusca=' + paramBusca + '&empresa=' + Empresa
      + '&projecao=' + Projecao + '&codigoConta=' + codigoConta)
      .pipe();
  }

  getParam(id: void): Observable<Param[]> {
    return this.http.get<Param[]>(this.apiURL + '/pram')
      .pipe();
  }

  getSaldoContaDataIni(conta: number, dataInicio: Date, parceiro:any): Observable<number> {
    console.log('serviço getSaldoContaDataIni', 'conta', conta, 'dataInicio', dataInicio, 'parceiro', parceiro);

    return this.http.get<number>(this.apiURL + '/SaldoContaDataIni?conta=' + conta + '&dataInicio=' + dataInicio + '&parceiro=' + parceiro)
      .pipe();
  }
  getSaldoConta(conta: number): Observable<number> {
    console.log('serviço getSaldoConta', 'conta', conta);

    return this.http.get<number>(this.apiURL + '/SaldoConta?conta=' + conta)
      .pipe();
  }

  gettaxasVendas(vendas: string[]):Observable<any[]> {
    return this.http.get<any[]>(this.apiURL + '/taxasVendas?vendas='+vendas.join())
    .pipe();
  }
  getcompensacao():Observable<any[]>  {
    return this.http.get<any[]>(this.apiURL + '/compensacao')
    .pipe();
  }
}







