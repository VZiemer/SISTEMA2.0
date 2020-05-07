import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../../environments/environment';


const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};
@Injectable({
  providedIn: 'root'
})

export class ProdutoService {
  apiURL = 'http://sistema.florestalferragens.com.br/rotas';
  // apiURL = 'http://localhost:4200/api/rotas';
  constructor(private http: HttpClient) { }


}







