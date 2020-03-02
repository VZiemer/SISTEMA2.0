import {
  Component,
  OnInit,
  Renderer2,
  HostListener,
  AfterViewInit
} from "@angular/core";
import { CaixaService } from "./caixa.service";
import { ClockService } from "./clock.service";
import { ElectronService } from "../core/services/electron/electron.service";
import { MatDialog } from "@angular/material";
import { ModalPagtoCartaoComponent } from "./modal-pagto-cartao/modal-pagto-cartao.component";
import { ModalPagtoBoletoComponent } from "./modal-pagto-boleto/modal-pagto-boleto.component";
import { ModalPagtoDiComponent } from "./modal-pagto-di/modal-pagto-di.component";
import { ModalPagtoNPComponent } from "./modal-pagto-np/modal-pagto-np.component";
import { ModalBuscaVendaComponent } from "./modal-busca-venda/busca-venda.component";
import { ModalBuscaGenericoComponent } from "../shared/components/modal-busca-generico/busca-generico.component";
import { ModalNfeComponent } from "./modal-nfe/modal-nfe.component";
import { ModalSelectTransitoComponent } from "./modal-select-transito/modal-select-transito.component";

import { Produto } from "../shared/models/produto";
import { Cliente } from "../shared/models/Cliente";
import { Vendedor } from "../shared/models/Vendedor";
import { Venda } from "../shared/models/venda";
import { Deus } from "../shared/models/deus";
import { Param } from "../shared/models/param";

import * as dinheiro from "../shared/models/dinheiro";
import * as net from "net";
import * as ini from "ini";
import { Timestamp } from "rxjs";
// import * as bemafi from '../../Bemafi32';

@Component({
  selector: "app-caixa",
  templateUrl: "./caixa.component.html",
  styleUrls: ["./caixa.component.scss"]
})
export class CaixaComponent implements OnInit, AfterViewInit {
  ctrlPress: boolean;
  empresa = null;
  saldoVale: number = null;
  name: string;
  clock: any;
  color: string;
  listaEmpresas: Param[];
  contasEmpresas = {
    "1": {
      FANTASIA: 'FLORESTAL FERRAGENS',
      CODPARC: 71,
      CARTAO: 272,
      BOLETO: 268,
      CAIXAGERAL: 256,
      CLIENTES: 273,
      RECEITA: 274,
      CAIXACARTAO: 297,
      CAIXATERMINAL: 159,
      CAIXADEPOSITO: 290,
      CAIXANP: 305,

    },
    "2": {
      FANTASIA: 'LOCALDECOR FERRAGENS',
      CODPARC: 12872,
      CARTAO: 242,
      BOLETO: 173,
      CAIXAGERAL: 257,
      CLIENTES: 126,
      RECEITA: 225,
      CAIXACARTAO: 296,
      CAIXATERMINAL: 255,
      CAIXADEPOSITO: 288,
      CAIXANP: 304,
    },
    "3": {
      FANTASIA: 'CELD MARKETPLACE',
      CARTAO: 282, //CONTAS A RECEBER CARTAO
      CAIXATERMINAL: 283, // TERMINAL CAIXA
      CLIENTES: 285,
      RECEITA: '',
      CAIXAGERAL: 284,
      COMPENSACAODINHEIRO: 287,
      COMPENSACAODEPOSITO: 291,
      COMPENSACAOCARTAO: 292,
      COMPENSACAOMERCADOPAGO: 299,
      CAIXADEPOSITO: 294,
      CAIXAMERCADOPAGO: 298,
      CELD: 301,
      CAIXANP: 302,
      COMPONSACAONP: 303,
    }
  };

  input = {
    codbar: null,
    qtd: 1
  };
  venda: Venda = new Venda(
    null,
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    ""
  );
  Pagar: number;
  cupom = "";
  cartao = [];
  boleto = [];
  pagamento: Deus[] = [];
  prodvenda: Produto[] = [];
  tipoOperacao: any[];
  cliente: Cliente = {
    CODIGO: null,
    RAZAO: "",
    FANTASIA: "",
    CGC: null,
    INSC: null,
    LIBERAFAT: null,
    LIBERANP: null
  };
  vendedor: Vendedor = {
    CODIGO: null,
    NOME: ""
  };
  ultimoProduto = {
    CODIGO: null,
    DESCRICAO: "",
    QTD: null,
    VALOR: null,
    UNIDADE: ""
  };
  selectedFunction = {
    function: "F3",
    text: "Leia o código do Produto"
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
    private _clockService: ClockService,
    public dialog: MatDialog,
    private renderer: Renderer2,
    public electron: ElectronService
  ) {

  }

  ngAfterViewInit() {
    this.DOM.inputProd = this.renderer.selectRootElement("#codbar");
    this.DOM.inputCli = this.renderer.selectRootElement("#inputCli");
    this.DOM.inputVend = this.renderer.selectRootElement("#inputVend");
    this.DOM.inputQtd = this.renderer.selectRootElement("#multqtd");
  }

  @HostListener("window:keyupdown", ["$event"])
  keyDown(event: KeyboardEvent) {
    console.log(event);
    if (event.key === "Control") {
      //  event.preventDefault();
      this.ctrlPress = true;
    }
  }

  @HostListener("window:keyup", ["$event"])
  keyUp(event: KeyboardEvent) {
    console.log(event);
    if (event.altKey) {
    } else if (event.ctrlKey) {
      this.ctrlPress = false;
      if (event.key === "F2") {
        if (this.empresa != 2)
          this.inserePagtoCartao("cartão");
      }
      if (event.key === "F3") {
        if (this.empresa != 2)
          this.inserePagtoDi("dinheiro");
      }
      if (event.key === "F4") {
        // if (this.empresa != 2)
        // this.inserePagtoBoleto("boleto");
      }
    } else {
      if (event.key === "F2") {
        if (this.empresa != 2)
          this.novaVenda();
      }
      if (event.key === "F3") {
        if (this.empresa != 2)
          this.clicaProduto();
      }
      if (event.key === "F4") {
        if (this.empresa != 2)
          this.clicaCliente();
      }
      if (event.key === "F5") {
        if (this.empresa != 2)
          this.clicaVendedor();
      }
      if (event.key === "F6") {
        if (this.empresa != 2)
          this.clicaAbreVenda("C");
      }
      if (event.key === "F7") {
        if (this.empresa != 2)
          this.clicaAbreVenda("R");
      }
    }
  }
  // funções inicial para escolha da empresa


  proxDiaUtil(data) {
    let d = new Date(data)
    if (d.getDay() >= 6) {
      return d
    }
    else {
      d.setDate(d.getDate() + (1 + 7 - d.getDay()) % 7);
      return d
    }
  }

  getEmpresas() {
    this.caixaService.getParam().subscribe(
      res => {
        this.listaEmpresas = res;
        console.log("listaEmpresas", this.listaEmpresas);
      },
      error => console.log(error)
    );
  }
  // função que volta o input
  inputReturn() {
    this.DOM.inputProd.focus();
    console.log("volta o input");
  }
  // funções dos botões
  clicaCliente() {
    this.selectedFunction.text = "Digite o clinte ou Enter para Buscar";
    this.DOM.inputCli.focus();
  }
  clicaProduto() {
    this.selectedFunction.text = "Leia o código do Produto";
    this.DOM.inputProd.focus();
  }
  clicaVendedor() {
    this.selectedFunction.text = "Digite o vendedor ou Enter para Buscar";
    this.DOM.inputVend.focus();
  }
  clicaAbreVenda(tipo) {
    this.venda.PAGAMENTO = [];
    this.venda = new Venda(
      null,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      ""
    );
    this.cliente = {
      CODIGO: null,
      RAZAO: "",
      FANTASIA: "",
      CGC: null,
      INSC: null,
      LIBERAFAT: null,
      LIBERANP: null
    };
    this.vendedor = {
      CODIGO: null,
      NOME: ""
    };
    this.ultimoProduto = {
      CODIGO: null,
      DESCRICAO: "",
      QTD: null,
      VALOR: null,
      UNIDADE: ""
    };
    if (this.empresa) {
      const dialogRef = this.dialog.open(ModalBuscaVendaComponent, {
        width: "70vw",
        height: "100vh",
        hasBackdrop: true,
        disableClose: false,
        data: tipo
      });

      dialogRef.afterClosed().subscribe(res => {
        console.log("retorno", res);
        this.inputReturn();
        this.caixaService.getVenda(res.LCTO).subscribe(
          venda => {
            this.cliente = {
              CODIGO: venda[0].CODCLI,
              RAZAO: venda[0].NOMECLI,
              FANTASIA: venda[0].NOMECLI,
              CGC: venda[0].CGC,
              INSC: venda[0].INSC,
              LIBERAFAT: venda[0].LIBERAFAT,
              LIBERANP: venda[0].LIBERANP
            };
            this.vendedor = {
              CODIGO: venda[0].CODVEND,
              NOME: venda[0].NOMEVEND
            };
            this.venda = new Venda(
              venda[0].LCTO,
              venda[0].DATA,
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
              venda[0].LIBERANP,
              venda[0].TXCELD,
              venda[0].TXPROJ
            );
            this.venda.insereTransporte(
              venda[0].VOLUMES,
              venda[0].PESO,
              venda[0].TIPOFRETE,
              venda[0].TRANSPORTADOR
            );
            for (const item of venda) {
              console.log(item.ID_TRANSITO);
              this.venda.insereLcto({
                TRANSITO: item.ID_TRANSITO,
                EMPRESA: item.EMPRESATRANSITO,
                TIPO: item.TIPO_TRANSITO,
                STATUS: item.TIPO_TRANSITO == 5 ? 8 : item.STATUS,
                CGC: item.CGC,
                INSC: item.INSC,
                EMAIL: item.EMAIL,
                FONE: item.FONE,
                RAZAO: item.RAZAO,
                ENDERECO: item.ENDERECO,
                NUMERO: item.NUMERO,
                BAIRRO: item.BAIRRO,
                CEP: item.CEP,
                CODIBGE: item.CODIBGE,
                CODCIDADE: item.CODCIDADE,
                CIDADE: item.CIDADE,
                ESTADO: item.ESTADO,
                COMPLEMENTO: item.COMPLEMENTO,
                VALOR: new dinheiro(item.VTRANSITO),
                DESCONTO: item.DESCONTO,
                FRETE: item.FRETE,
                SEGURO: item.SEGURO
              });
            }
            this.getProdvenda(this.venda.LCTO);
            console.log(this.venda);
          },
          error => console.log(error)
        );
      });
    }
  }
  // função para geração da NF
  gerarNfe() {
    const dialogRef = this.dialog.open(ModalNfeComponent, {
      width: "100vw",
      height: "100vh",
      hasBackdrop: true,
      disableClose: false,
      data: { venda: this.venda, empresa: this.empresa }
    });

    dialogRef.afterClosed().subscribe(res => {
      console.log("retorno", res);
      // confirma a venda
      if (this.venda.LCTO !== null && res) {
        // altera as contas projeção para as contas fiscais em todos meios de pagamento (tipo 5)
        // for (const pagto of this.venda.PAGAMENTO) {
        //   if (
        //     pagto.CREDITO == this.contasEmpresas[this.empresa].CLIENTES &&
        //     pagto.DOCUMENTO == res
        //   ) {
        //     pagto.CREDITO = this.contasEmpresas[this.empresa].RECEITA;
        //   }
        // }
        this.confirmaVenda();
      }
    });
  }
  // insere um novo produto com pelo id (alterar para codbar)
  getProduto(id: number, qtd: number) {
    console.log("getProduto");
    this.input.codbar = null;
    this.input.qtd = 1;
    this.inputReturn();
    this.caixaService.insereProdvenda(id, qtd, this.venda.LCTO).subscribe(
      produto => {
        // produto.QTD = qtd;
        this.ultimoProduto = {
          CODIGO: produto.CODPRO,
          DESCRICAO: produto.DESCRICAO,
          QTD: produto.QTDFISCAL,
          VALOR: produto.VALOR,
          UNIDADE: produto.UNIDADE
        };
        // this.prodvenda.push(produto);
        this.venda.insereProduto(produto);
      },
      error => console.log(error)
    );
  }
  // insere um novo produto com pelo id (alterar para codbar)
  getCliente(id: number = null) {
    this.input.codbar = null;
    this.input.qtd = 1;
    this.inputReturn();
    if (id) {
      this.caixaService.getParceiro(id).subscribe(
        cliente => {
          this.cliente = cliente;
          this.clicaProduto();
        },
        error => console.log(error)
      );
    } else {
      this.openDialog("C");
    }
  }
  getVendedor(id: number): void {
    console.log("id", id);
    this.input.codbar = null;
    this.input.qtd = 1;
    this.inputReturn();
    console.log("getVendedor", this);
    if (id) {
      this.caixaService.getVendedor(id).subscribe(
        parceiro => {
          console.log("parceiro", parceiro);
          this.vendedor = { NOME: parceiro.FANTASIA, CODIGO: parceiro.CODIGO };
          this.clicaProduto();
        },
        error => console.log(error)
      );
    } else {
      this.openDialog("V");
    }
  }
  getVenda(id: number = null) {
    this.input.codbar = null;
    this.input.qtd = 1;
    this.inputReturn();
    if (id) {
      this.caixaService.getVenda(id).subscribe(
        venda => {
          this.venda = new Venda(
            venda[0].LCTO,
            venda[0].DATA,
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
            venda[0].LIBERANP,
            venda[0].TXCELD,
            venda[0].TXPROJ
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
      this.clicaAbreVenda("C");
    }
  }
  getProdvenda(lcto: number) {
    this.inputReturn();
    this.caixaService.getProdVenda(lcto).subscribe(
      prodVenda => {
        console.log(prodVenda);
        for (const item of prodVenda) {
          if (item.QTDPEDIDO > 0) {
            this.venda.insereProduto(item);
            console.log("inseriu item");
            this.ultimoProduto = {
              CODIGO: item.CODIGO,
              DESCRICAO: item.DESCRICAO,
              QTD: item.QTDPEDIDO,
              VALOR: item.VALOR,
              UNIDADE: item.UNIDADE
            };
          }
          if (item.QTDPEDIDO < 0) {
            this.venda.insereDescontos(item);
            console.log("descontou item");
          }
        }
      },
      error => console.log(error)
    );
  }
  // TODO
  novaVenda() {
    this.input.codbar = null;
    this.input.qtd = 1;

    this.venda = new Venda(
      null,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      ""
    );

    if (!this.cliente.CODIGO) {
      this.openDialog("C");
    } else {
      console.log("else nova venda");
      console.log("cliente", this.cliente);
      console.log("vendedor", this.vendedor);
      this.caixaService.novaVenda(this.cliente.CODIGO, 1).subscribe(
        venda => {
          console.log("retornou venda", venda);
          this.venda = new Venda(
            venda[0].LCTO,
            venda[0].DATA,
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
            venda[0].LIBERANP,
            venda[0].TXCELD,
            venda[0].TXPROJ
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
    }
  }
  // abre modal de busca genérico
  openDialog(busca: string) {
    const dialogRef = this.dialog.open(ModalBuscaGenericoComponent, {
      width: "70vw",
      height: "79vh",
      hasBackdrop: true,
      disableClose: true,
      data: { tipoParc: busca }
    });

    dialogRef.afterClosed().subscribe(res => {
      this.inputReturn();
      console.log("retorno", res);
      if (busca === "V") {
        this.getVendedor(res[0].CODIGO);
      }
      if (busca === "C") {
        this.getCliente(res[0].CODIGO);
      }
    });
  }
  // funções de Pagamento


  // Pagamento com Cartão
  inserePagtoCartao(pagto) {
    const dialogRef = this.dialog.open(ModalPagtoCartaoComponent, {
      width: "50vw",
      height: "80vh",
      hasBackdrop: true,
      disableClose: false,
      data: {
        tipopag: pagto,
        valor: this.venda.PAGAR.valor,
        empresa: this.empresa
      }
    });
    dialogRef.afterClosed().subscribe(res => {
      this.inputReturn();
      if (res) {
        console.log("entrou pagamento", res);
        this.venda.PAGAR.subtrai(res.valor);
        console.log(this.venda);
        console.log("pagar", this.venda.PAGAR);
        const dataemissao = new Date();
        const percentceld = this.venda.TXCELD / this.venda.TOTAL.valor;

        const valorTarifa: number = this.venda.TXCELD > 0 ? 0 : Number(
          ((res.valor * res.fPagto.TARIFA) / 100).toFixed(2));

        let cartao = [];
        if (res.fPagto.PARCELAS == 0) {
          cartao.push({
            ID: null,
            ESTABELECIMENTO: res.fPagto.ESTABELECIMENTO,
            ADQUIRENTE: res.fPagto.ADQUIRENTE,
            BANDEIRA: res.fPagto.BANDEIRA,
            PARCELAS: 0,
            TID: null,
            TARIFA: res.fPagto.TARIFA,
            VALOR: (res.valor).toFixed(2),
            AUTORIZACAO: null
          })
        }
        if (res.fPagto.PARCELAS > 0) {
          for (let i = 0; i < res.fPagto.PARCELAS; i++) {
            console.log('cartao', i)
            cartao.push({
              ID: null,
              ESTABELECIMENTO: res.fPagto.ESTABELECIMENTO,
              ADQUIRENTE: res.fPagto.ADQUIRENTE,
              BANDEIRA: res.fPagto.BANDEIRA,
              PARCELAS: i + 1,
              TID: null,
              TARIFA: res.fPagto.TARIFA,
              VALOR: (res.valor / res.fPagto.PARCELAS).toFixed(2),
              AUTORIZACAO: null
            })
          }
        }
        this.venda.PAGAMENTO.push({
          CODIGO: null,
          CODDEC: null,
          EMPRESA: this.empresa,
          CODPARC: this.cliente.CODIGO,
          LCTO: this.venda.LCTO,
          TIPOLCTO: "V",
          DOCUMENTO: this.venda.LCTO,
          DATAEMISSAO: dataemissao,
          DATAVCTO: dataemissao,
          DATALIQUID: null,
          DEBITO: this.contasEmpresas[this.empresa].CARTAO,
          CREDITO: this.contasEmpresas[this.empresa].CLIENTES,
          VALOR: percentceld ? new dinheiro(res.valor) : new dinheiro(res.valor),
          PROJECAO: 0,
          OBS: "",
          PERMITEAPAGA: null,
          TIPOOPERACAO: res.fPagto.TIPOOPERACAO,
          TRAVACREDITO: null,
          TARIFA: new dinheiro(0),
          CARTAO: cartao
          //informações do cartão

        });

        // if (percentceld) {
        //   this.venda.PAGAMENTO.push({
        //     CODIGO: null,
        //     CODDEC: null,
        //     EMPRESA: this.empresa,
        //     CODPARC: this.cliente.CODIGO,
        //     LCTO: this.venda.LCTO,
        //     TIPOLCTO: "V",
        //     DOCUMENTO: this.venda.LCTO,
        //     DATAEMISSAO: dataemissao,
        //     DATAVCTO: dataemissao,
        //     DATALIQUID: dataemissao,
        //     DEBITO: this.contasEmpresas[this.empresa].CARTAO,
        //     CREDITO: this.contasEmpresas[this.empresa].CELD,
        //     VALOR: new dinheiro(res.valor * percentceld),
        //     PROJECAO: 0,
        //     OBS: "",
        //     PERMITEAPAGA: null,
        //     TIPOOPERACAO: res.fPagto.TIPOOPERACAO,
        //     TRAVACREDITO: null,
        //     TARIFA: new dinheiro(0),
        //     //informações do cartão
        //     ID: null,
        //     ESTABELECIMENTO: null,
        //     ADQUIRENTE: null,
        //     BANDEIRA: null,
        //     PARCELAS: null,
        //     TID: null,
        //     AUTORIZACAO: null
        //   });
        // }

        const datacartao = new Date()
        let datavencto = new Date(
          datacartao.setDate(datacartao.getDate() + res.fPagto.PERIODO)
        )
        for (const transito of this.venda.TRANSITO) {
          const percent = transito.VALOR.valor / this.venda.TOTAL.valor;
        //   console.log(transito);
        //   this.venda.PAGAMENTO.push(
        //     //débito na conta cliente e crédito na compensação, liquidado no ato
        //     {
        //       CODIGO: null,
        //       CODDEC: null,
        //       EMPRESA: this.empresa,
        //       CODPARC: this.cliente.CODIGO,
        //       LCTO: this.venda.LCTO,
        //       TIPOLCTO: "V",
        //       DOCUMENTO: transito.TRANSITO,
        //       DATAEMISSAO: dataemissao,
        //       DATAVCTO: dataemissao,
        //       DATALIQUID: dataemissao,
        //       DEBITO: this.contasEmpresas[this.empresa].CLIENTES,
        //       CREDITO: this.contasEmpresas[this.empresa].COMPENSACAOCARTAO,
        //       VALOR: new dinheiro(res.valor * percent),
        //       PROJECAO: 0,
        //       OBS: "",
        //       PERMITEAPAGA: null,
        //       TIPOOPERACAO: 23,
        //       TRAVACREDITO: null,
        //       TARIFA: new dinheiro(0),
        //       //informações do cartão
        //       ID: null,
        //       ESTABELECIMENTO: null,
        //       ADQUIRENTE: null,
        //       BANDEIRA: null,
        //       PARCELAS: null,
        //       TID: null,
        //       AUTORIZACAO: null
        //     },
        //     //débito na compensação, crédito á definir
        //     {
        //       CODIGO: null,
        //       CODDEC: null,
        //       EMPRESA: this.empresa,
        //       CODPARC: this.contasEmpresas[transito.EMPRESA].CODPARC,
        //       LCTO: this.venda.LCTO,
        //       TIPOLCTO: "D",
        //       DOCUMENTO: transito.TRANSITO,
        //       DATAEMISSAO: this.venda.DATA,
        //       DATAVCTO: this.proxDiaUtil(datavencto),
        //       DATALIQUID: null,
        //       DEBITO: this.contasEmpresas[this.empresa].COMPENSACAOCARTAO,
        //       CREDITO: null,
        //       VALOR: new dinheiro((res.valor * percent) - valorTarifa),
        //       PROJECAO: 0,
        //       OBS: "",
        //       PERMITEAPAGA: null,
        //       TIPOOPERACAO: 23,
        //       TRAVACREDITO: null,
        //       TARIFA: new dinheiro(valorTarifa),
        //       //informações do cartão
        //       ID: null,
        //       ESTABELECIMENTO: null,
        //       ADQUIRENTE: null,
        //       BANDEIRA: null,
        //       PARCELAS: null,
        //       TID: null,
        //       AUTORIZACAO: null
        //     },
        //     // operação na empresa que vai receber o valor
        this.venda.PAGAMENTO.push(
            {
              CODIGO: null,
              CODDEC: null,
              EMPRESA: transito.EMPRESA,
              CODPARC: this.cliente.CODIGO,
              LCTO: this.venda.LCTO,
              TIPOLCTO: "V",
              DOCUMENTO: transito.TRANSITO,
              DATAEMISSAO: dataemissao,
              DATAVCTO: dataemissao,
              DATALIQUID: dataemissao,
              DEBITO: this.contasEmpresas[transito.EMPRESA].CAIXACARTAO,
              CREDITO: this.contasEmpresas[transito.EMPRESA].CLIENTES,
              VALOR: new dinheiro(res.valor - res.valor*percentceld),
              PROJECAO: 0,
              OBS: "",
              PERMITEAPAGA: null,
              TIPOOPERACAO: 5,
              TRAVACREDITO: null,
              TARIFA: new dinheiro(valorTarifa),
              //informações do cartão
              ID: null,
              ESTABELECIMENTO: null,
              ADQUIRENTE: null,
              BANDEIRA: null,
              PARCELAS: null,
              TID: null,
              AUTORIZACAO: null
            });



        }
        console.log(this.venda.PAGAMENTO);
      }
    });
  }


  // Pagamento com Dinheiro
  inserePagtoDi(pagto) {
    const dialogRef = this.dialog.open(ModalPagtoDiComponent, {
      width: "40vw",
      height: "70vh",
      hasBackdrop: true,
      disableClose: false,
      data: { tipopag: pagto, valor: this.venda.PAGAR.valor }
    });
    dialogRef.afterClosed().subscribe(res => {
      this.inputReturn();
      if (res) {

        const percentceld = this.venda.TXCELD / this.venda.TOTAL.valor;

        console.log("entrou pagamento", res);
        this.venda.PAGAR.subtrai(res.valor);
        console.log(this.venda);
        console.log("pagar", this.venda.PAGAR);
        const dataemissao = new Date();
        this.venda.PAGAMENTO.push({
          CODIGO: null,
          CODDEC: null,
          EMPRESA: this.empresa,
          CODPARC: this.cliente.CODIGO,
          LCTO: this.venda.LCTO,
          TIPOLCTO: "V",
          DOCUMENTO: this.venda.LCTO,
          DATAEMISSAO: dataemissao,
          DATAVCTO: dataemissao,
          DATALIQUID: null,
          DEBITO: this.contasEmpresas[this.empresa].CAIXATERMINAL,
          CREDITO: this.contasEmpresas[this.empresa].CLIENTES,
          VALOR: percentceld ? new dinheiro(res.valor) : new dinheiro(res.valor),
          PROJECAO: 0,
          OBS: "",
          PERMITEAPAGA: null,
          TIPOOPERACAO: 6,
          TRAVACREDITO: null,
          TARIFA: new dinheiro(0),
          //informações do cartão
          ID: null,
          ESTABELECIMENTO: null,
          ADQUIRENTE: null,
          BANDEIRA: null,
          PARCELAS: null,
          TID: null,
          AUTORIZACAO: null
        });

        // if (percentceld) {

        //   this.venda.PAGAMENTO.push({
        //     CODIGO: null,
        //     CODDEC: null,
        //     EMPRESA: this.empresa,
        //     CODPARC: this.cliente.CODIGO,
        //     LCTO: this.venda.LCTO,
        //     TIPOLCTO: "V",
        //     DOCUMENTO: this.venda.LCTO,
        //     DATAEMISSAO: dataemissao,
        //     DATAVCTO: dataemissao,
        //     DATALIQUID: dataemissao,
        //     DEBITO: this.contasEmpresas[this.empresa].CAIXATERMINAL,
        //     CREDITO: this.contasEmpresas[this.empresa].CELD,
        //     VALOR: new dinheiro(res.valor * percentceld),
        //     PROJECAO: 0,
        //     OBS: "",
        //     PERMITEAPAGA: null,
        //     TIPOOPERACAO: 6,
        //     TRAVACREDITO: null,
        //     TARIFA: new dinheiro(0),

        //     //informações do cartão
        //     ID: null,
        //     ESTABELECIMENTO: null,
        //     ADQUIRENTE: null,
        //     BANDEIRA: null,
        //     PARCELAS: null,
        //     TID: null,
        //     AUTORIZACAO: null
        //   });


        // }
        for (const transito of this.venda.TRANSITO) {
        //   console.log(transito);
        //   const percent = transito.VALOR.valor / this.venda.TOTAL.valor;
        //   console.log(percent)
        //   //operação de débito no adiantamento cliente e crdito na compensacao
          this.venda.PAGAMENTO.push({
        //     CODIGO: null,
        //     CODDEC: null,
        //     EMPRESA: this.empresa,
        //     CODPARC: this.cliente.CODIGO,
        //     LCTO: this.venda.LCTO,
        //     TIPOLCTO: "V",
        //     DOCUMENTO: transito.TRANSITO,
        //     DATAEMISSAO: dataemissao,
        //     DATAVCTO: dataemissao,
        //     DATALIQUID: dataemissao,
        //     DEBITO: this.contasEmpresas[this.empresa].CLIENTES,
        //     CREDITO: this.contasEmpresas[this.empresa].COMPENSACAODINHEIRO,
        //     VALOR: new dinheiro(res.valor * percent),
        //     PROJECAO: 0,
        //     OBS: "",
        //     PERMITEAPAGA: null,
        //     TIPOOPERACAO: 23,
        //     TRAVACREDITO: null,
        //     TARIFA: new dinheiro(0),

        //     //informações do cartão
        //     ID: null,
        //     ESTABELECIMENTO: null,
        //     ADQUIRENTE: null,
        //     BANDEIRA: null,
        //     PARCELAS: null,
        //     TID: null,
        //     AUTORIZACAO: null
        //   },
        //     //operacç~eo de dédito na compensação e credito no caixa geral
        //     {
        //       CODIGO: null,
        //       CODDEC: null,
        //       EMPRESA: this.empresa,
        //       CODPARC: this.contasEmpresas[transito.EMPRESA].CODPARC,
        //       LCTO: this.venda.LCTO,
        //       TIPOLCTO: "D",
        //       DOCUMENTO: transito.TRANSITO,
        //       DATAEMISSAO: dataemissao,
        //       DATAVCTO: dataemissao,
        //       DATALIQUID: null,
        //       DEBITO: this.contasEmpresas[this.empresa].COMPENSACAODINHEIRO,
        //       CREDITO: this.contasEmpresas[this.empresa].CAIXAGERAL,
        //       VALOR: new dinheiro(res.valor * percent),
        //       PROJECAO: 0,
        //       OBS: "",
        //       PERMITEAPAGA: null,
        //       TIPOOPERACAO: 23,
        //       TRAVACREDITO: null,
        //       TARIFA: new dinheiro(0),

        //       //informações do cartão
        //       ID: null,
        //       ESTABELECIMENTO: null,
        //       ADQUIRENTE: null,
        //       BANDEIRA: null,
        //       PARCELAS: null,
        //       TID: null,
        //       AUTORIZACAO: null
        //     },
        //     //operação na empresa vendedora       
            
              CODIGO: null,
              CODDEC: null,
              EMPRESA: transito.EMPRESA,
              CODPARC: this.cliente.CODIGO,
              LCTO: this.venda.LCTO,
              TIPOLCTO: "V",
              DOCUMENTO: transito.TRANSITO,
              DATAEMISSAO: dataemissao,
              DATAVCTO: dataemissao,
              DATALIQUID: dataemissao,
              DEBITO: this.contasEmpresas[transito.EMPRESA].CAIXATERMINAL,
              CREDITO: this.contasEmpresas[transito.EMPRESA].CLIENTES,
              VALOR: new dinheiro(res.valor- res.valor*percentceld),
              PROJECAO: 0,
              OBS: "",
              PERMITEAPAGA: null,
              TIPOOPERACAO: 5,
              TRAVACREDITO: null,
              TARIFA: new dinheiro(0),

              //informações do cartão
              ID: null,
              ESTABELECIMENTO: null,
              ADQUIRENTE: null,
              BANDEIRA: null,
              PARCELAS: null,
              TID: null,
              AUTORIZACAO: null
            });


        }

        console.log(this.venda.PAGAMENTO);
      }
    });
  }
  inserePagtoNP(pagto) {
    const dialogRef = this.dialog.open(ModalPagtoDiComponent, {
      width: "40vw",
      height: "70vh",
      hasBackdrop: true,
      disableClose: false,
      data: { tipopag: pagto, valor: this.venda.PAGAR.valor }
    });
    dialogRef.afterClosed().subscribe(res => {
      this.inputReturn();
      if (res) {

        console.log("entrou pagamento", res);
        this.venda.PAGAR.subtrai(res.valor);
        console.log(this.venda);
        console.log("pagar", this.venda.PAGAR);
        const dataemissao = new Date();

        const percentceld = this.venda.TXCELD / this.venda.TOTAL.valor;

        //CRIA O PRIMEIRO REGISTO DE PAGAMENTO, TIPO V, VALOR TOTAL, LIQUIDADO
        this.venda.PAGAMENTO.push({
          CODIGO: null,
          CODDEC: null,
          EMPRESA: this.empresa,
          CODPARC: this.cliente.CODIGO,
          LCTO: this.venda.LCTO,
          TIPOLCTO: "V",
          DOCUMENTO: this.venda.LCTO.toString(),
          DATAEMISSAO: dataemissao,
          DATAVCTO: dataemissao,
          DATALIQUID: null,
          DEBITO: this.contasEmpresas[this.empresa].CAIXANP,
          CREDITO: this.contasEmpresas[this.empresa].CLIENTES,
          VALOR: percentceld ? new dinheiro(res.valor) : new dinheiro(res.valor),
          PROJECAO: 0,
          OBS: "",
          PERMITEAPAGA: null,
          TIPOOPERACAO: 6,
          TRAVACREDITO: null,
          TARIFA: new dinheiro(0),

          //informações do cartão
          ID: null,
          ESTABELECIMENTO: null,
          ADQUIRENTE: null,
          BANDEIRA: null,
          PARCELAS: null,
          TID: null,
          AUTORIZACAO: null
        });

        // if (percentceld) {
        //   this.venda.PAGAMENTO.push({
        //     CODIGO: null,
        //     CODDEC: null,
        //     EMPRESA: this.empresa,
        //     CODPARC: this.cliente.CODIGO,
        //     LCTO: this.venda.LCTO,
        //     TIPOLCTO: "V",
        //     DOCUMENTO: this.venda.LCTO.toString(),
        //     DATAEMISSAO: dataemissao,
        //     DATAVCTO: dataemissao,
        //     DATALIQUID: dataemissao,
        //     DEBITO: this.contasEmpresas[this.empresa].CAIXANP,
        //     CREDITO: this.contasEmpresas[this.empresa].CELD,
        //     VALOR: new dinheiro(res.valor * percentceld),
        //     PROJECAO: 0,
        //     OBS: "",
        //     PERMITEAPAGA: null,
        //     TIPOOPERACAO: 6,
        //     TRAVACREDITO: null,
        //     TARIFA: new dinheiro(0),

        //     //informações do cartão
        //     ID: null,
        //     ESTABELECIMENTO: null,
        //     ADQUIRENTE: null,
        //     BANDEIRA: null,
        //     PARCELAS: null,
        //     TID: null,
        //     AUTORIZACAO: null
        //   });
        // }

        for (const transito of this.venda.TRANSITO) {
        //   console.log(transito);
        //   const percent = transito.VALOR.valor / this.venda.TOTAL.valor;
          this.venda.PAGAMENTO.push({
        //     CODIGO: null,
        //     CODDEC: null,
        //     EMPRESA: this.empresa,
        //     CODPARC: this.cliente.CODIGO,
        //     LCTO: this.venda.LCTO,
        //     TIPOLCTO: "V",
        //     DOCUMENTO: transito.TRANSITO,
        //     DATAEMISSAO: dataemissao,
        //     DATAVCTO: dataemissao,
        //     DATALIQUID: dataemissao,
        //     DEBITO: this.contasEmpresas[this.empresa].CLIENTES,
        //     CREDITO: this.contasEmpresas[this.empresa].COMPENSACAONP,
        //     VALOR: new dinheiro(res.valor * percent),
        //     PROJECAO: 0,
        //     OBS: "",
        //     PERMITEAPAGA: null,
        //     TIPOOPERACAO: 23,
        //     TRAVACREDITO: null,
        //     TARIFA: new dinheiro(0),

        //     //informações do cartão
        //     ID: null,
        //     ESTABELECIMENTO: null,
        //     ADQUIRENTE: null,
        //     BANDEIRA: null,
        //     PARCELAS: null,
        //     TID: null,
        //     AUTORIZACAO: null
        //   },

        //     {
        //       CODIGO: null,
        //       CODDEC: null,
        //       EMPRESA: this.empresa,
        //       CODPARC: this.contasEmpresas[transito.EMPRESA].CODPARC,
        //       LCTO: this.venda.LCTO,
        //       TIPOLCTO: "D",
        //       DOCUMENTO: transito.TRANSITO,
        //       DATAEMISSAO: dataemissao,
        //       DATAVCTO: dataemissao,
        //       DATALIQUID: null,
        //       DEBITO: this.contasEmpresas[this.empresa].COMPENSACAONP,
        //       CREDITO: null,
        //       VALOR: new dinheiro(res.valor * percent),
        //       PROJECAO: 0,
        //       OBS: "",
        //       PERMITEAPAGA: null,
        //       TIPOOPERACAO: 23,
        //       TRAVACREDITO: null,
        //       TARIFA: new dinheiro(0),

        //       //informações do cartão
        //       ID: null,
        //       ESTABELECIMENTO: null,
        //       ADQUIRENTE: null,
        //       BANDEIRA: null,
        //       PARCELAS: null,
        //       TID: null,
        //       AUTORIZACAO: null
        //     }
        //     ,
        //     {
              CODIGO: null,
              CODDEC: null,
              EMPRESA: transito.EMPRESA,
              CODPARC: this.cliente.CODIGO,
              LCTO: this.venda.LCTO,
              TIPOLCTO: "V",
              DOCUMENTO: transito.TRANSITO,
              DATAEMISSAO: dataemissao,
              DATAVCTO: dataemissao,
              DATALIQUID: dataemissao,
              DEBITO: this.contasEmpresas[transito.EMPRESA].CAIXANP,
              CREDITO: this.contasEmpresas[transito.EMPRESA].CLIENTES,
              VALOR: new dinheiro(res.valor-res.valor*percentceld),
              PROJECAO: 0,
              OBS: "",
              PERMITEAPAGA: null,
              TIPOOPERACAO: 5,
              TRAVACREDITO: null,
              TARIFA: new dinheiro(0),

              //informações do cartão
              ID: null,
              ESTABELECIMENTO: null,
              ADQUIRENTE: null,
              BANDEIRA: null,
              PARCELAS: null,
              TID: null,
              AUTORIZACAO: null
            });



        }

        console.log(this.venda.PAGAMENTO);
      }
    });
  }
  // Pagamento com Dinheiro
  inserePagtoDeposito(pagto) {
    const dialogRef = this.dialog.open(ModalPagtoDiComponent, {
      width: "40vw",
      height: "70vh",
      hasBackdrop: true,
      disableClose: false,
      data: { tipopag: pagto, valor: this.venda.PAGAR.valor }
    });
    dialogRef.afterClosed().subscribe(res => {
      this.inputReturn();
      if (res) {

        console.log("entrou pagamento", res);
        this.venda.PAGAR.subtrai(res.valor);
        console.log(this.venda);
        console.log("pagar", this.venda.PAGAR);
        const dataemissao = new Date();

        const percentceld = this.venda.TXCELD / this.venda.TOTAL.valor;

        //CRIA O PRIMEIRO REGISTO DE PAGAMENTO, TIPO V, VALOR TOTAL, LIQUIDADO
        this.venda.PAGAMENTO.push({
          CODIGO: null,
          CODDEC: null,
          EMPRESA: this.empresa,
          CODPARC: this.cliente.CODIGO,
          LCTO: this.venda.LCTO,
          TIPOLCTO: "V",
          DOCUMENTO: this.venda.LCTO.toString(),
          DATAEMISSAO: dataemissao,
          DATAVCTO: dataemissao,
          DATALIQUID: null,
          DEBITO: this.contasEmpresas[this.empresa].CAIXADEPOSITO,
          CREDITO: this.contasEmpresas[this.empresa].CLIENTES,
          VALOR: percentceld ? new dinheiro(res.valor) : new dinheiro(res.valor),
          PROJECAO: 0,
          OBS: "",
          PERMITEAPAGA: null,
          TIPOOPERACAO: 6,
          TRAVACREDITO: null,
          TARIFA: new dinheiro(0),

          //informações do cartão
          ID: null,
          ESTABELECIMENTO: null,
          ADQUIRENTE: null,
          BANDEIRA: null,
          PARCELAS: null,
          TID: null,
          AUTORIZACAO: null
        });

        // if (percentceld) {
        //   this.venda.PAGAMENTO.push({
        //     CODIGO: null,
        //     CODDEC: null,
        //     EMPRESA: this.empresa,
        //     CODPARC: this.cliente.CODIGO,
        //     LCTO: this.venda.LCTO,
        //     TIPOLCTO: "V",
        //     DOCUMENTO: this.venda.LCTO.toString(),
        //     DATAEMISSAO: dataemissao,
        //     DATAVCTO: dataemissao,
        //     DATALIQUID: dataemissao,
        //     DEBITO: this.contasEmpresas[this.empresa].CAIXADEPOSITO,
        //     CREDITO: this.contasEmpresas[this.empresa].CELD,
        //     VALOR: new dinheiro(res.valor * percentceld),
        //     PROJECAO: 0,
        //     OBS: "",
        //     PERMITEAPAGA: null,
        //     TIPOOPERACAO: 6,
        //     TRAVACREDITO: null,
        //     TARIFA: new dinheiro(0),

        //     //informações do cartão
        //     ID: null,
        //     ESTABELECIMENTO: null,
        //     ADQUIRENTE: null,
        //     BANDEIRA: null,
        //     PARCELAS: null,
        //     TID: null,
        //     AUTORIZACAO: null
        //   });
        // }

        for (const transito of this.venda.TRANSITO) {
        //   console.log(transito);
        //   const percent = transito.VALOR.valor / this.venda.TOTAL.valor;
          this.venda.PAGAMENTO.push({
        //     CODIGO: null,
        //     CODDEC: null,
        //     EMPRESA: this.empresa,
        //     CODPARC: this.cliente.CODIGO,
        //     LCTO: this.venda.LCTO,
        //     TIPOLCTO: "V",
        //     DOCUMENTO: transito.TRANSITO,
        //     DATAEMISSAO: dataemissao,
        //     DATAVCTO: dataemissao,
        //     DATALIQUID: dataemissao,
        //     DEBITO: this.contasEmpresas[this.empresa].CLIENTES,
        //     CREDITO: this.contasEmpresas[this.empresa].COMPENSACAODEPOSITO,
        //     VALOR: new dinheiro(res.valor * percent),
        //     PROJECAO: 0,
        //     OBS: "",
        //     PERMITEAPAGA: null,
        //     TIPOOPERACAO: 23,
        //     TRAVACREDITO: null,
        //     TARIFA: new dinheiro(0),

        //     //informações do cartão
        //     ID: null,
        //     ESTABELECIMENTO: null,
        //     ADQUIRENTE: null,
        //     BANDEIRA: null,
        //     PARCELAS: null,
        //     TID: null,
        //     AUTORIZACAO: null
        //   },

        //     {
        //       CODIGO: null,
        //       CODDEC: null,
        //       EMPRESA: this.empresa,
        //       CODPARC: this.contasEmpresas[transito.EMPRESA].CODPARC,
        //       LCTO: this.venda.LCTO,
        //       TIPOLCTO: "D",
        //       DOCUMENTO: transito.TRANSITO,
        //       DATAEMISSAO: dataemissao,
        //       DATAVCTO: dataemissao,
        //       DATALIQUID: null,
        //       DEBITO: this.contasEmpresas[this.empresa].COMPENSACAODEPOSITO,
        //       CREDITO: null,
        //       VALOR: new dinheiro(res.valor * percent),
        //       PROJECAO: 0,
        //       OBS: "",
        //       PERMITEAPAGA: null,
        //       TIPOOPERACAO: 23,
        //       TRAVACREDITO: null,
        //       TARIFA: new dinheiro(0),

        //       //informações do cartão
        //       ID: null,
        //       ESTABELECIMENTO: null,
        //       ADQUIRENTE: null,
        //       BANDEIRA: null,
        //       PARCELAS: null,
        //       TID: null,
        //       AUTORIZACAO: null
        //     }
        //     ,
        //     {
              CODIGO: null,
              CODDEC: null,
              EMPRESA: transito.EMPRESA,
              CODPARC: this.cliente.CODIGO,
              LCTO: this.venda.LCTO,
              TIPOLCTO: "V",
              DOCUMENTO: transito.TRANSITO,
              DATAEMISSAO: dataemissao,
              DATAVCTO: dataemissao,
              DATALIQUID: dataemissao,
              DEBITO: this.contasEmpresas[transito.EMPRESA].CAIXADEPOSITO,
              CREDITO: this.contasEmpresas[transito.EMPRESA].CLIENTES,
              VALOR: new dinheiro(res.valor-res.valor*percentceld),
              PROJECAO: 0,
              OBS: "",
              PERMITEAPAGA: null,
              TIPOOPERACAO: 5,
              TRAVACREDITO: null,
              TARIFA: new dinheiro(0),

              //informações do cartão
              ID: null,
              ESTABELECIMENTO: null,
              ADQUIRENTE: null,
              BANDEIRA: null,
              PARCELAS: null,
              TID: null,
              AUTORIZACAO: null
            });



        }

        console.log(this.venda.PAGAMENTO);
      }
    });
  }

  inserePagtoMercadoPago(pagto) {
    const dialogRef = this.dialog.open(ModalPagtoDiComponent, {
      width: "40vw",
      height: "70vh",
      hasBackdrop: true,
      disableClose: false,
      data: { tipopag: pagto, valor: this.venda.PAGAR.valor }
    });
    dialogRef.afterClosed().subscribe(res => {
      this.inputReturn();
      if (res) {
        console.log("entrou pagamento", res);
        this.venda.PAGAR.subtrai(res.valor);
        console.log(this.venda);
        console.log("pagar", this.venda.PAGAR);
        const dataemissao = new Date();
        const percentceld = this.venda.TXCELD / this.venda.TOTAL.valor;
        //CRIA O PRIMEIRO REGISTO DE PAGAMENTO, TIPO V, VALOR TOTAL, LIQUIDADO
        this.venda.PAGAMENTO.push({
          CODIGO: null,
          CODDEC: null,
          EMPRESA: this.empresa,
          CODPARC: this.cliente.CODIGO,
          LCTO: this.venda.LCTO,
          TIPOLCTO: "V",
          DOCUMENTO: this.venda.LCTO.toString(),
          DATAEMISSAO: dataemissao,
          DATAVCTO: dataemissao,
          DATALIQUID: null,
          DEBITO: this.contasEmpresas[this.empresa].CAIXAMERCADOPAGO,
          CREDITO: this.contasEmpresas[this.empresa].CLIENTES,
          VALOR: percentceld ? new dinheiro(res.valor) : new dinheiro(res.valor),
          PROJECAO: 0,
          OBS: "",
          PERMITEAPAGA: null,
          TIPOOPERACAO: 6,
          TRAVACREDITO: null,
          //informações do cartão
          ID: null,
          ESTABELECIMENTO: null,
          ADQUIRENTE: null,
          BANDEIRA: null,
          PARCELAS: null,
          TID: null,
          AUTORIZACAO: null
        });

        // if (percentceld) {
        //   this.venda.PAGAMENTO.push({
        //     CODIGO: null,
        //     CODDEC: null,
        //     EMPRESA: this.empresa,
        //     CODPARC: this.cliente.CODIGO,
        //     LCTO: this.venda.LCTO,
        //     TIPOLCTO: "V",
        //     DOCUMENTO: this.venda.LCTO.toString(),
        //     DATAEMISSAO: dataemissao,
        //     DATAVCTO: dataemissao,
        //     DATALIQUID: dataemissao,
        //     DEBITO: this.contasEmpresas[this.empresa].CAIXAMERCADOPAGO,
        //     CREDITO: this.contasEmpresas[this.empresa].CELD,
        //     VALOR: new dinheiro(res.valor * percentceld),
        //     PROJECAO: 0,
        //     OBS: "",
        //     PERMITEAPAGA: null,
        //     TIPOOPERACAO: 6,
        //     TRAVACREDITO: null,
        //     //informações do cartão
        //     ID: null,
        //     ESTABELECIMENTO: null,
        //     ADQUIRENTE: null,
        //     BANDEIRA: null,
        //     PARCELAS: null,
        //     TID: null,
        //     AUTORIZACAO: null
        //   });
        // }
        for (const transito of this.venda.TRANSITO) {
        //   console.log(transito);
        //   const percent = transito.VALOR.valor / this.venda.TOTAL.valor;
          this.venda.PAGAMENTO.push({
        //     CODIGO: null,
        //     CODDEC: null,
        //     EMPRESA: this.empresa,
        //     CODPARC: this.cliente.CODIGO,
        //     LCTO: this.venda.LCTO,
        //     TIPOLCTO: "V",
        //     DOCUMENTO: transito.TRANSITO,
        //     DATAEMISSAO: dataemissao,
        //     DATAVCTO: dataemissao,
        //     DATALIQUID: dataemissao,
        //     DEBITO: this.contasEmpresas[this.empresa].CLIENTES,
        //     CREDITO: this.contasEmpresas[this.empresa].COMPENSACAOMERCADOPAGO,
        //     VALOR: new dinheiro(res.valor * percent),
        //     PROJECAO: 0,
        //     OBS: "",
        //     PERMITEAPAGA: null,
        //     TIPOOPERACAO: 23,
        //     TRAVACREDITO: null,
        //     //informações do cartão
        //     ID: null,
        //     ESTABELECIMENTO: null,
        //     ADQUIRENTE: null,
        //     BANDEIRA: null,
        //     PARCELAS: null,
        //     TID: null,
        //     AUTORIZACAO: null
        //   },

        //     {
        //       CODIGO: null,
        //       CODDEC: null,
        //       EMPRESA: this.empresa,
        //       CODPARC: this.contasEmpresas[transito.EMPRESA].CODPARC,
        //       LCTO: this.venda.LCTO,
        //       TIPOLCTO: "D",
        //       DOCUMENTO: transito.TRANSITO,
        //       DATAEMISSAO: dataemissao,
        //       DATAVCTO: dataemissao,
        //       DATALIQUID: null,
        //       DEBITO: this.contasEmpresas[this.empresa].COMPENSACAOMERCADOPAGO,
        //       CREDITO: null,
        //       VALOR: new dinheiro(res.valor * percent),
        //       PROJECAO: 0,
        //       OBS: "",
        //       PERMITEAPAGA: null,
        //       TIPOOPERACAO: 23,
        //       TRAVACREDITO: null,
        //       //informações do cartão
        //       ID: null,
        //       ESTABELECIMENTO: null,
        //       ADQUIRENTE: null,
        //       BANDEIRA: null,
        //       PARCELAS: null,
        //       TID: null,
        //       AUTORIZACAO: null
        //     }
        //     ,
        //     {
              CODIGO: null,
              CODDEC: null,
              EMPRESA: transito.EMPRESA,
              CODPARC: this.cliente.CODIGO,
              LCTO: this.venda.LCTO,
              TIPOLCTO: "V",
              DOCUMENTO: transito.TRANSITO,
              DATAEMISSAO: dataemissao,
              DATAVCTO: dataemissao,
              DATALIQUID: dataemissao,
              DEBITO: this.contasEmpresas[transito.EMPRESA].CAIXADEPOSITO,
              CREDITO: this.contasEmpresas[transito.EMPRESA].CLIENTES,
              VALOR: new dinheiro(res.valor-res.valor*percentceld),
              PROJECAO: 0,
              OBS: "",
              PERMITEAPAGA: null,
              TIPOOPERACAO: 5,
              TRAVACREDITO: null,
              //informações do cartão
              ID: null,
              ESTABELECIMENTO: null,
              ADQUIRENTE: null,
              BANDEIRA: null,
              PARCELAS: null,
              TID: null,
              AUTORIZACAO: null
            });

        }

        console.log(this.venda.PAGAMENTO);
      }
    });
  }

  // Cancela Pagamentos Inseridos
  cancelaPagto() {
    this.venda.PAGAMENTO = [];
    this.cartao = [];
    this.boleto = [];
    this.venda.PAGAR = new dinheiro(this.venda.TOTAL);
    this.inputReturn();
  }

  clicaCupom() {
    const dialogRef = this.dialog.open(ModalSelectTransitoComponent, {
      width: "40vw",
      height: "70vh",
      hasBackdrop: true,
      disableClose: false,
      data: { transitos: this.venda.TRANSITO, tipo: "CPF" }
    });

    dialogRef.afterClosed().subscribe(res => {
      console.log("retorno", res);
      this.confirmaCupom(res.CPF, res.TRANSITO);
    });
  }

  confirmaCupom(cpfcupom: string, trSelecionado) {
    // confirma a venda
    const caixaService = this.caixaService;
    const confirmaVenda = this.confirmaVenda;
    const transito = this.venda.TRANSITO.find(
      element => element.TRANSITO === trSelecionado
    );
    const comandos = [];
    comandos.push(`ECF.AbreCupom("${cpfcupom}","","")\r\n.\r\n`);
    comandos.push(`ECF.NumCupom\r\n.\r\n`);
    for (const item of this.venda.PRODUTOS) {
      if (item.TRANSITO === transito.TRANSITO) {
        if (item.SITTRIB == "060") {
          item.ALIQ = "FF";
        } else if (!item.ALIQ) {
          item.ALIQ = "FF";
        } else {
          item.ALIQ = item.ALIQ;
        }
        let descr = item.DESCRICAO;
        if (descr.length > 29) {
          descr = descr.slice(0, 28);
        }
        comandos.push(
          `ECF.VendeItem
          ("${item.CODPROFISCAL.toString()}",
          "${descr}", "${item.ALIQ.toString()}",
          ${item.QTDFISCAL.toString()},
          ${item.VALORUNITFISCAL.valueStr()})\r\n.\r\n`
        );
      }
    }
    comandos.push(`ECF.SubtotalizaCupom\r\n.\r\n`);
    comandos.push(
      `ECF.EfetuaPagamento("01", ${transito.VALOR.valor})\r\n.\r\n`
    );
    comandos.push(`ECF.FechaCupom\r\n.\r\n`);
    const socketClient = net.connect({ host: "localhost", port: 3434 }, () => {
      console.log(comandos);
      let contador = 0;
      let cupom = "";
      const venda = this.venda;
      const contasEmpresas = this.contasEmpresas;
      const empresa = this.empresa;
      function executaComandos() {
        console.log("executa comando");
        if (contador <= comandos.length) {
          console.log(comandos[contador]);
          socketClient.write(comandos[contador]);
          socketClient.on("data", data => {
            if (contador == 1) {
              cupom = data.toString().slice(3);
            }
            console.log(data.toString());
            contador++;
            executaComandos();
          });
        } else {
          socketClient.destroy();
          // if (venda.LCTO !== null) {
          //   altera as contas projeção para as contas fiscais em todos meios de pagamento (tipo 5)
          //   for (const pagto of venda.PAGAMENTO) {
          //     if (
          //       pagto.CREDITO == contasEmpresas[empresa].CLIENTES &&
          //       pagto.DOCUMENTO == trSelecionado
          //     ) {
          //       pagto.CREDITO = contasEmpresas[empresa].RECEITA;
          //     }
          //   }
          // }
          caixaService
            .gravaCupom({ transito: trSelecionado, cupom: cupom })
            .subscribe(ok => console.log(ok));
          confirmaVenda();
        }
      }
      executaComandos();
    });
  }

  // Confirma a Venda
  confirmaVenda() {
    this.caixaService
      .confirmaVenda(
        this.venda,
        this.venda.PAGAMENTO,
        this.cartao,
        this.boleto,
        this.venda.TRANSITO[0].EMPRESA //teste, confirma sempre na empresa
      )
      .subscribe(rest => {
        console.log(rest);
        this.imprime(this.venda).then(res => {
          this.inputReturn();
          this.venda.PAGAMENTO = [];
          this.cartao = [];
          this.boleto = [];
          this.venda = new Venda(
            null,
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            ""
          );
          this.cliente = {
            CODIGO: null,
            RAZAO: "",
            FANTASIA: "",
            CGC: null,
            INSC: null,
            LIBERAFAT: null,
            LIBERANP: null
          };
          this.vendedor = {
            CODIGO: null,
            NOME: ""
          };
          this.ultimoProduto = {
            CODIGO: null,
            DESCRICAO: "",
            QTD: null,
            VALOR: null,
            UNIDADE: ""
          };
        });
      });
  }
  // Imprime a via da venda
  imprime = async function (venda) {
    let html = `<html>
      <head>
      <style>
      @page { size: portrait;margin: 1%; }
      table,td,tr,span{font-size:8pt;font-family:Arial;}
      table {width:80mm;}
      td {min-width:2mm;}
      hr{border-top:1pt dashed #000;}
      </style>
      </head>
      <body>`;
    let conteudo = `<div>
      <span>DOCUMENTO SEM VALOR FISCAL</span><hr>
      <span>${this.contasEmpresas[this.venda.TRANSITO[0].EMPRESA].FANTASIA}</span><hr>
      <span class='pull-left'></span>
      <br>
      <span class='pull-left'>Pedido: ${
      venda.LCTO
      }  -  Emissão: ${new Date().toLocaleDateString()}</span>
      <br>
      <span>Cliente: ${venda.NOMECLI}</span>
      <br>
      <span>Cod. Cliente ${venda.CODCLI}</span>
      <br>
      <span>Vendedor:${venda.NOMEVEND}</span>
      <br>
      <span>Forma de Pagamento--------------------------------</span><br>
    <table>
    ${venda.PAGAMENTO.filter(
        item => item.TIPOLCTO == 'V' && item.EMPRESA == 3 && item.TIPOOPERACAO !== 23
      )
        .map(
          (item, i) => `<tr>
        <td colspan='3'>${item.DATAVCTO.toLocaleDateString()}</td>
        <td>${item.VALOR.toString()}</td>
        <td colspan='3'>${
            this.tipoOperacao.find(x => item.TIPOOPERACAO == x.CODIGO).SIGLA
            }</td>
        </tr>`
        )
        .join("")}
    `;
    conteudo += `</table><hr><table>
      <tr><td colspan='8'>Descricao<td></tr>
      <tr><td></td><td>Qtd</td><td>UN</td><td colspan='3'>Código</td><td>Vl. Unit.</td><td>Subtotal</td>`;
    for (const x of venda.PRODUTOS) {
      if (!x.QTDRESERVA) {
        conteudo += `<tr>
          <td colspan='8'>${x.DESCRICAO}</td>
          </tr>
          <tr>
          <td></td>
          <td>${x.QTD}</td>
          <td>${x.UNIDADE}</td>
          <td colspan='3'>${x.CODPRO}</td>
          <td>${x.VALOR.toString()}</td>
          <td>${x.TOTAL.toString()}</td>
          </tr>`;
      }
    }
    venda.PRODUTOS.every(function (element, index) {
      if (element.QTDRESERVA) {
        conteudo += `<tr><td colspan='8'>ITENS DE ENCOMENDA</td</tr>`;
        return false;
      } else {
        return true;
      }
    });
    for (const x of venda.PRODUTOS) {
      if (x.QTDRESERVA) {
        conteudo += `<tr>
          <td colspan='8'>${x.DESCRICAO}</td>
          </tr>
          <tr>
          <td></td>
          <td>${x.QTD}</td>
          <td>${x.UNIDADE}</td>
          <td colspan='3'>${x.CODPRO}</td>
          <td>${x.VALOR.toString()}</td>
          <td>${x.TOTAL.toString()}</td>
          </tr>`;
      }
    }
    conteudo += `</table><br>
      <span class='pull-right'>Total Produtos: ${venda.TOTALDESC.toString()}</span>
      <br><br>
      <span>CONFERENTE.________________________________</span>
      <br><br><br>
      <span>ASS._______________________________________</span></div>
      </br>
      <hr>`;
    conteudo += conteudo;
    html += conteudo + `</body></html>`;
    const janela = await this.electron.fs.writeFile(
      "c:/temp/teste.html",
      html,
      err => {
        if (err) {
          throw err;
        }
        const modal = window.open("", "impressao");
        console.log("The file has been saved!");
        return "ok";
      }
    );
    return "ok";
  };
  // funcção de Inicialização
  ngOnInit() {
    this._clockService.time.subscribe((now: Date) =>
      // console.log("time:", now.toISOString())
      this.clock = now
    );
    const socketClient = net.connect({ host: "localhost", port: 3434 }, () => {
      let contador = 0;
      function testaCupom() {
        console.log("testa cupom");
        socketClient.write("ECF.TestaPodeAbrirCupom\r\n.\r\n");
      }
      socketClient.on("data", data => {
        testaCupom();
        console.log(data.toString());
        const retorno = ini.parse(data.toString());
        console.log(retorno);
        contador++;
        if (contador === 10) {
          socketClient.destroy();
        }
      });
      socketClient.on("end", data => {
        console.log("end", data.toString());
        // socketClient.destroy();
      });
      socketClient.on("error", data => {
        console.log("erros", data);
        // socketClient.destroy();
      });
      socketClient.on("close", () => {
        console.log("conexão terminada");
        // socketClient.destroy();
      });
    });
    this.getEmpresas();
    this.caixaService
      .getTipoOperacao()
      .subscribe(tipos => (this.tipoOperacao = tipos));
  }
}
