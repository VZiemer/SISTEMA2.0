
import { Component, OnInit, Renderer2 } from '@angular/core';
import { CaixaService } from './caixa.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MyModalComponent } from './my-modal/my-modal.component';
import { Produto } from '../shared/models/produto';
import { Cliente } from '../shared/models/Cliente';
import { Vendedor } from '../shared/models/Vendedor';
import { elementAt } from 'rxjs/operators';



@Component({
  selector: 'app-caixa',
  templateUrl: './caixa.component.html',
  styleUrls: ['./caixa.component.scss']
})

export class CaixaComponent implements OnInit {

  name: string;
  color: string;
  input = {
    'codbar': null,
    'qtd': 1
  };
  venda: Produto[] = [];
  Cliente: Cliente = {
    CODIGO: null,
    RAZAO: '',
    CGC: null,
    INSC: null,
    LIBERAFAT: null,
    LIBERANP: null
  };
  Vendedor: Vendedor = {
    CODIGO: null,
    NOME: ''
  };
  ultimoProduto: Produto = {
    CODIGO: null,
    DESCRICAO: '',
    QTD: null,
    VALOR: null,
    UNIDADE: ''
  };

  selectedFunction = {
    function: 'F3',
    text: 'Leia o código do Produto'
  };
  DOM = {
    inputProd: null,
    inputCli: null,
    inputVend: null,
    inputQtd: null
  };

  // F2 - abreVenda
  // F3 - InsereProduto
  // F4 - InsereCliente
  // F5 - InsereVendedor

  constructor(private caixaService: CaixaService, public dialog: MatDialog, private renderer: Renderer2) { }
  ngAfterViewInit() {
    this.DOM.inputProd = this.renderer.selectRootElement('#codbar');
    this.DOM.inputCli = this.renderer.selectRootElement('#inputCli');
    this.DOM.inputVend = this.renderer.selectRootElement('#inputVend');
    this.DOM.inputQtd = this.renderer.selectRootElement('#multqtd');

  }

  // função que volta o input
  inputReturn() {
    this.DOM.inputProd.focus();
  }

  // funções dos botões
  clicaCliente() {
    this.selectedFunction.text = 'Digite o clinte ou Enter para Buscar';
    this.DOM.inputCli.focus();
  }
  clicaProduto() {
    this.selectedFunction.text = 'Leia o código do Produto';
    this.DOM.inputProd.focus();
  }
  clicaVendedor() {
    this.selectedFunction.text = 'Digite o vendedor ou Enter para Buscar';
    this.DOM.inputVend.focus();
  }
  clicaAbreVenda() {
    this.selectedFunction.text = 'Digite a venda ou Enter para buscar';
    this.DOM.inputProd.focus();
  }

  // insere um novo produto com pelo id (alterar para codbar)
  getProduto(id: void, qtd: number) {
    this.input.codbar = null;
    this.input.qtd = 1;
    this.caixaService.getProduto(id)
      .subscribe(produto => {
        produto.QTD = qtd;
        this.ultimoProduto = produto;
        this.venda.push(produto);
      }, error => (console.log(error)));
  }
  // insere um novo produto com pelo id (alterar para codbar)
  getCliente(id): void {
    this.input.codbar = null;
    this.input.qtd = 1;
    if (id) {
      this.caixaService.getCliente(id)
        .subscribe(cliente => {
          this.Cliente = cliente;
          this.clicaProduto();
        }, error => (console.log(error)));
    } else {
      this.openDialog();
    }

  }

  getVendedor(id): void {
    this.input.codbar = null;
    this.input.qtd = 1;
    if (id) {
      this.caixaService.getVendedor(id)
        .subscribe(vendedor => {
          this.Vendedor = vendedor;
          this.clicaProduto();
        }, error => (console.log(error)));
    } else {
      this.openDialog();
    }

  }





  openDialog(): void {
    const dialogRef = this.dialog.open(MyModalComponent, {
      width: '60vw',
      height: '60vh',
      hasBackdrop: true,
      disableClose: true,
      data: Cliente
    });

    dialogRef.afterClosed().subscribe(res => {
      console.log('retorno', res);
      this.Cliente = res[0];
    });
  }


  ngOnInit() {
    // this.selectedFunction.function = 'F3';
    // this.selectedFunction.text = 'Leia o código do Produto';
  }



}
