import { Component, OnInit, Renderer2 } from '@angular/core';
import { CaixaService } from './caixa.service';
import { MatDialog } from '@angular/material';
import { ModalPagtoCartaoComponent } from './modal-pagto-cartao/modal-pagto-cartao.component';
import { ModalPagtoBoletoComponent } from './modal-pagto-boleto/modal-pagto-boleto.component';
import { ModalPagtoDiComponent } from './modal-pagto-di/modal-pagto-di.component';
import { ModalBuscaVendaComponent } from './modal-busca-venda/busca-venda.component';
import { ModalBuscaGenericoComponent } from '../shared/components/modal-busca-generico/busca-generico.component';
import { ModalNfeComponent } from './modal-nfe/modal-nfe.component';

import { Produto } from '../shared/models/produto';
import { Cliente } from '../shared/models/Cliente';
import { Vendedor } from '../shared/models/Vendedor';
import { Venda } from '../shared/models/venda';
import { Deus } from '../shared/models/deus';

@Component({
  selector: 'app-caixa',
  templateUrl: './caixa.component.html',
  styleUrls: ['./caixa.component.scss']
})
export class CaixaComponent implements OnInit {
  empresa = {
    CODIGO: 1,
    NOME: 'FLORESTAL FERRAGENS'
  };
  name: string;
  color: string;
  input = {
    codbar: null,
    qtd: 1
  };
  venda: Venda = new Venda(
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    ''
  );
  Pagar: number;
  cartao = [];
  boleto = [];
  pagamento: Deus[] = [];
  prodvenda: Produto[] = [];
  cliente: Cliente = {
    CODIGO: null,
    RAZAO: '',
    CGC: null,
    INSC: null,
    LIBERAFAT: null,
    LIBERANP: null
  };
  vendedor: Vendedor = {
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

  constructor(
    private caixaService: CaixaService,
    public dialog: MatDialog,
    private renderer: Renderer2
  ) {}
  // tslint:disable-next-line: use-lifecycle-interface
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
    const dialogRef = this.dialog.open(ModalBuscaVendaComponent, {
      width: '70vw',
      height: '60vh',
      hasBackdrop: true,
      disableClose: true,
      data: 'venda'
    });

    dialogRef.afterClosed().subscribe(res => {
      console.log('retorno', res);
      this.caixaService.getVenda(res.LCTO).subscribe(
        venda => {
          this.venda = new Venda(
            venda[0].LCTO,
            venda[0].DATA,
            venda[0].ID_TRANSITO,
            venda[0].CGC,
            venda[0].INSC,
            venda[0].CODCLI,
            venda[0].NOMECLI,
            venda[0].CODVEND,
            venda[0].NOMEVEND,
            venda[0].EMAIL,
            venda[0].FONE,
            venda[0].RAZAO,
            venda[0].ENDERECO,
            venda[0].NUMERO,
            venda[0].BAIRRO,
            venda[0].CEP,
            venda[0].CODIBGE,
            venda[0].CODCIDADE,
            venda[0].CIDADE,
            venda[0].ESTADO,
            venda[0].COMPLEMENTO,
            venda[0].DESCONTO,
            venda[0].FRETE,
            venda[0].SEGURO,
            venda[0].TOTAL,
            venda[0].FATURAMENTO,
            venda[0].LIBERAFAT,
            venda[0].LIBERANP
          );
          this.venda.insereTransporte(
            venda[0].VOLUMES,
            venda[0].PESO,
            venda[0].TIPOFRETE,
            venda[0].TRANSPORTADOR
          );

          this.getProdvenda(this.venda.LCTO);
          console.log(this.venda);
        },
        error => console.log(error)
      );
    });
  }

  gerarNfe() {
    const dialogRef = this.dialog.open(ModalNfeComponent, {
      width: '100vw',
      height: '100vh',
      hasBackdrop: true,
      disableClose: false,
      data: this.venda
    });

    dialogRef.afterClosed().subscribe(res => {
      console.log('retorno', res);
    });
  }

  // insere um novo produto com pelo id (alterar para codbar)
  getProduto(id: number, qtd: number) {
    this.input.codbar = null;
    this.input.qtd = 1;
    this.caixaService.insereProdvenda(id, qtd, this.venda.LCTO).subscribe(
      produto => {
        // produto.QTD = qtd;
        this.ultimoProduto = produto;
        this.prodvenda.push(produto);
        this.venda.TOTAL += produto.VALOR * produto.QTD;
        this.Pagar = this.venda.TOTAL;
      },
      error => console.log(error)
    );
  }

  // insere um novo produto com pelo id (alterar para codbar)
  getCliente(id: number): void {
    this.input.codbar = null;
    this.input.qtd = 1;
    if (id) {
      this.caixaService.getCliente(id).subscribe(
        cliente => {
          this.cliente = cliente;
          this.clicaProduto();
        },
        error => console.log(error)
      );
    } else {
      this.openDialog('cliente', this.getCliente);
    }
  }

  getVendedor(id: number): void {
    this.input.codbar = null;
    this.input.qtd = 1;
    if (id) {
      this.caixaService.getVendedor(id).subscribe(
        vendedor => {
          this.vendedor = vendedor;
          this.clicaProduto();
        },
        error => console.log(error)
      );
    } else {
      this.openDialog('vendedor', this.getVendedor);
    }
  }

  getVenda(id: number): void {
    this.input.codbar = null;
    this.input.qtd = 1;
    if (id) {
      this.caixaService.getVenda(id).subscribe(
        venda => {
          this.venda = new Venda(
            venda[0].LCTO,
            venda[0].DATA,
            venda[0].ID_TRANSITO,
            venda[0].CGC,
            venda[0].INSC,
            venda[0].CODCLI,
            venda[0].NOMECLI,
            venda[0].CODVEND,
            venda[0].NOMEVEND,
            venda[0].EMAIL,
            venda[0].FONE,
            venda[0].RAZAO,
            venda[0].ENDERECO,
            venda[0].NUMERO,
            venda[0].BAIRRO,
            venda[0].CEP,
            venda[0].CODIBGE,
            venda[0].CODCIDADE,
            venda[0].CIDADE,
            venda[0].ESTADO,
            venda[0].COMPLEMENTO,
            venda[0].DESCONTO,
            venda[0].FRETE,
            venda[0].SEGURO,
            venda[0].TOTAL,
            venda[0].FATURAMENTO,
            venda[0].LIBERAFAT,
            venda[0].LIBERANP
          );
          this.venda.insereTransporte(
            venda[0].VOLUMES,
            venda[0].PESO,
            venda[0].TIPOFRETE,
            venda[0].TRANSPORTADOR
          );

          this.getProdvenda(this.venda.LCTO);
          console.log(this.venda);
        },
        error => console.log(error)
      );
    } else {
      this.openDialog('venda', this.getVenda);
    }
  }

  novaVenda() {
    this.input.codbar = null;
    this.input.qtd = 1;
    this.caixaService
      .novaVenda(this.cliente.CODIGO, this.vendedor.CODIGO)
      .subscribe(
        venda => {
          this.venda = venda;
        },
        error => console.log(error)
      );
  }

  cancelaPagto() {
    this.venda.PAGAMENTO = [];
    this.cartao = [];
    this.boleto = [];
    this.Pagar = this.venda.TOTAL;
  }

  openDialog(busca, callback) {
    const dialogRef = this.dialog.open(ModalBuscaGenericoComponent, {
      width: '70vw',
      height: '60vh',
      hasBackdrop: true,
      disableClose: true,
      data: busca
    });

    dialogRef.afterClosed().subscribe(res => {
      console.log('retorno', res);
      callback(res);
    });
  }

  inserePagtoCartao(pagto) {
    const dialogRef = this.dialog.open(ModalPagtoCartaoComponent, {
      width: '50vw',
      height: '80vh',
      hasBackdrop: true,
      disableClose: true,
      data: { tipopag: pagto, valor: this.venda.PAGAR }
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.Pagar -= res.valor;
        console.log('pagar', this.Pagar);
        const data = new Date(this.venda.DATA);
        this.cartao.push({
          ID: null,
          VALOR: res.valor,
          LCTO: this.venda.LCTO,
          ESTABELECIMENTO: res.fPagto.ESTABELECIMENTO,
          ADQUIRENTE: res.fPagto.ADQUIRENTE,
          BANDEIRA: res.fPagto.BANDEIRA,
          PARCELAS: res.fPagto.PARCELAS,
          TID: null,
          AUTORIZACAO: null
        });
        console.log('cartao', this.cartao);
        if (res.fPagto.PARCELAS === 0) {
          const pgto: Deus = {
            CODIGO: null,
            CODDEC: null,
            EMPRESA: this.empresa.CODIGO,
            CODPARC: this.cliente.CODIGO,
            LCTO: this.venda.LCTO,
            TIPOLCTO: 'V',
            DOCUMENTO: this.venda.LCTO.toString() + '-0/0',
            DATAEMISSAO: this.venda.DATA,
            DATAVCTO: new Date(
              data.setDate(data.getDate() + res.fPagto.PERIODO)
            ),
            DATALIQUID: null,
            DEBITO: res.fPagto.DOMICILIO_BANCARIO,
            CREDITO: 173,
            VALOR: res.valor,
            PROJECAO: 0,
            OBS: ''
          };
          this.venda.PAGAMENTO.push(pgto);
          if (res.fPagto.TARIFA) {
            const valorTarifa: number = Number(
              ((res.valor * res.fPagto.TARIFA) / 100).toFixed(2)
            );
            const tarifa: Deus = {
              CODIGO: null,
              CODDEC: null,
              EMPRESA: this.empresa.CODIGO,
              CODPARC: res.fPagto.ADQUIRENTE,
              LCTO: this.venda.LCTO,
              TIPOLCTO: 'V',
              DOCUMENTO: this.venda.LCTO.toString() + '-0/0',
              DATAEMISSAO: this.venda.DATA,
              DATAVCTO: data,
              DATALIQUID: null,
              DEBITO: res.fPagto.CONTA_DESPESA,
              CREDITO: res.fPagto.DOMICILIO_BANCARIO,
              VALOR: valorTarifa,
              PROJECAO: 0,
              OBS: ''
            };
            this.venda.PAGAMENTO.push(tarifa);
          }
        } else {
          const newDate = new Date(data);
          const valor: number = Number(
            (res.valor / res.fPagto.PARCELAS).toFixed(2)
          );
          const resto: number = Number(
            (res.valor - valor * res.fPagto.PARCELAS).toFixed(2)
          );
          for (let index = 0; index < res.fPagto.PARCELAS; index++) {
            const pgto: Deus = {
              CODIGO: null,
              CODDEC: null,
              EMPRESA: this.empresa.CODIGO,
              CODPARC: this.cliente.CODIGO,
              LCTO: this.venda.LCTO,
              TIPOLCTO: 'V',
              DOCUMENTO:
                this.venda.LCTO.toString() +
                '-' +
                (index + 1) +
                '/' +
                res.fPagto.PARCELAS,
              DATAEMISSAO: this.venda.DATA,
              DATAVCTO: new Date(
                newDate.setDate(newDate.getDate() + res.fPagto.PERIODO)
              ),
              DATALIQUID: null,
              DEBITO: res.fPagto.DOMICILIO_BANCARIO,
              CREDITO: 173,
              VALOR: index + 1 === res.fPagto.PARCELAS ? valor + resto : valor,
              PROJECAO: 0,
              OBS: ''
            };
            this.venda.PAGAMENTO.push(pgto);
            if (res.fPagto.TARIFA) {
              const valorTarifa: number = Number(
                ((valor * res.fPagto.TARIFA) / 100).toFixed(2)
              );
              const tarifa: Deus = {
                CODIGO: null,
                CODDEC: null,
                EMPRESA: this.empresa.CODIGO,
                CODPARC: res.fPagto.ADQUIRENTE,
                LCTO: this.venda.LCTO,
                TIPOLCTO: 'V',
                DOCUMENTO:
                  this.venda.LCTO.toString() +
                  '-' +
                  (index + 1) +
                  '/' +
                  res.fPagto.PARCELAS,
                DATAEMISSAO: this.venda.DATA,
                DATAVCTO: new Date(newDate),
                DATALIQUID: null,
                DEBITO: res.fPagto.CONTA_DESPESA,
                CREDITO: res.fPagto.DOMICILIO_BANCARIO,
                VALOR: valorTarifa,
                PROJECAO: 0,
                OBS: ''
              };
              this.venda.PAGAMENTO.push(tarifa);
            }
          }
        }
        console.log(this.venda.PAGAMENTO);
      }
    });
  }

  inserePagtoBoleto(pagto) {
    const dialogRef = this.dialog.open(ModalPagtoBoletoComponent, {
      width: '50vw',
      height: '80vh',
      hasBackdrop: true,
      disableClose: true,
      data: { tipopag: pagto, valor: this.venda.PAGAR }
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.Pagar -= res.valor;
        console.log('pagar', this.Pagar);
        const data = new Date(this.venda.DATA);
        this.boleto.push({
          ID: null,
          VALOR: res.valor,
          LCTO: this.venda.LCTO,
          VENCIMENTOS: res.fPagto.VENCIMENTOS,
          BANDEIRA: res.fPagto.NOME_BANCO,
          PARCELAS: res.fPagto.PARCELAS
        });
        const newDate = new Date(data);
        const valor: number = Number(
          (res.valor / res.fPagto.PARCELAS).toFixed(2)
        );
        const resto: number = Number(
          (res.valor - valor * res.fPagto.PARCELAS).toFixed(2)
        );
        for (let index = 0; index < res.fPagto.PARCELAS; index++) {
          const pgto: Deus = {
            CODIGO: null,
            CODDEC: null,
            EMPRESA: this.empresa.CODIGO,
            CODPARC: this.cliente.CODIGO,
            LCTO: this.venda.LCTO,
            TIPOLCTO: 'V',
            DOCUMENTO:
              this.venda.LCTO.toString() +
              '-' +
              (index + 1) +
              '/' +
              res.fPagto.PARCELAS,
            DATAEMISSAO: this.venda.DATA,
            DATAVCTO: new Date(
              newDate.setDate(newDate.getDate() + res.fPagto.PERIODO)
            ),
            DATALIQUID: null,
            DEBITO: res.fPagto.DOMICILIO_BANCARIO,
            CREDITO: 173,
            VALOR: index + 1 === res.fPagto.PARCELAS ? valor + resto : valor,
            PROJECAO: 0,
            OBS: ''
          };
          this.venda.PAGAMENTO.push(pgto);
        }

        console.log(this.venda.PAGAMENTO);
      }
    });
  }

  inserePagtoDi(pagto) {
    const dialogRef = this.dialog.open(ModalPagtoDiComponent, {
      width: '70vw',
      height: '70vh',
      hasBackdrop: true,
      disableClose: true,
      data: { tipopag: pagto, valor: this.venda.PAGAR }
    });
    dialogRef.afterClosed().subscribe(res => {
      this.Pagar -= res.valor;
      console.log('pagar', this.Pagar);
      const data = new Date(this.venda.DATA);
      const pgto: Deus = {
        CODIGO: null,
        CODDEC: null,
        EMPRESA: this.empresa.CODIGO,
        CODPARC: this.cliente.CODIGO,
        LCTO: this.venda.LCTO,
        TIPOLCTO: 'V',
        DOCUMENTO: this.venda.LCTO.toString() + '-0/0',
        DATAEMISSAO: this.venda.DATA,
        DATAVCTO: this.venda.DATA,
        DATALIQUID: null,
        DEBITO: 159,
        CREDITO: 173,
        VALOR: res.valor,
        PROJECAO: 0,
        OBS: ''
      };
      this.venda.PAGAMENTO.push(pgto);
      console.log(this.venda.PAGAMENTO);
    });
  }

  confirmaVenda() {
    this.venda.PAGAMENTO.unshift({
      CODIGO: null,
      CODDEC: null,
      EMPRESA: this.empresa.CODIGO,
      CODPARC: this.cliente.CODIGO,
      LCTO: this.venda.LCTO,
      TIPOLCTO: 'V',
      DOCUMENTO: this.venda.LCTO.toString(),
      DATAEMISSAO: this.venda.DATA,
      DATAVCTO: this.venda.DATA,
      DATALIQUID: this.venda.DATA,
      DEBITO: 173,
      CREDITO: 126,
      VALOR: this.venda.TOTAL,
      PROJECAO: 0,
      OBS: ''
    });
    this.caixaService
      .confirmaVenda(this.venda, this.venda.PAGAMENTO, this.cartao)
      .subscribe(rest => {
        console.log(rest);
      });
  }

  getProdvenda(lcto: number) {
    this.caixaService.getProdVenda(lcto).subscribe(
      prodVenda => {
        const venda = this.venda;
        console.log(prodVenda);
        prodVenda.forEach(function (item) {
          if (item.QTDPEDIDO > 0) {
              venda.insereProduto(item);
              console.log('inseriu item');
          }
          if (item.QTDPEDIDO < 0) {
              venda.insereDescontos(item);
              console.log('descontou item');
          }
      });
        // this.prodvenda = prodVenda;
      },
      error => console.log(error)
    );
  }

  ngOnInit() {
    this.getVenda(1425697);
  }
}
