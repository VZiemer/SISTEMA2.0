import { Component, OnInit } from '@angular/core';
import { Deus } from '../shared/models/deus';
import { Contas } from '../shared/models/contas';
import { FinanceiroService } from './financeiro.service';
@Component({
  selector: 'app-financeiro',
  templateUrl: './financeiro.component.html',
  styleUrls: ['./financeiro.component.scss']
})
export class FinanceiroComponent implements OnInit {
  busca: number;
  lista: Deus[];
  linhaDeus: Deus;
  listaContas: Contas[];

  constructor(private financeiroService: FinanceiroService) {

  }

  ngOnInit() {

    this.financeiroService.getDeus()
      .subscribe(res => {
        this.lista = res;
        console.log(this.lista)
      }, error => (console.log(error)));

  }

  getDeus() {
    this.financeiroService.getLctoDeus(this.busca)
      .subscribe(res => {
        this.linhaDeus = res;
        console.log(this.linhaDeus)
      }, error => (console.log(error)));
  }


}
