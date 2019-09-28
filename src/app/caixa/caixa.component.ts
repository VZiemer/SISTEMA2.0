import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-caixa',
  templateUrl: './caixa.component.html',
  styleUrls: ['./caixa.component.scss']
})
export class CaixaComponent implements OnInit {

  constructor() { }
  newItem: { item: string, codigo: number, descricao: string, valor: number, unidade: string, qtd: number };

  itemTeste = {
    'item': '1',
     'codigo': 441,
    'descricao': 'DOB FGV SLIDE ON CURVA 110º',
    'valor': 1.99,
    'unidade': 'PC',
    'qtd': 5
  };
  venda = [];
  addItem(newItem) {
    this.venda.push(newItem);
  }
  ngOnInit() {
  }

}
