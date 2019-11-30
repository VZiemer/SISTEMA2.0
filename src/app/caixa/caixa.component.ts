import { Component, OnInit, Renderer2 } from "@angular/core";
import { CaixaService } from "./caixa.service";
import { ElectronService } from "../core/services/electron/electron.service";
import { MatDialog } from "@angular/material";
import { ModalPagtoCartaoComponent } from "./modal-pagto-cartao/modal-pagto-cartao.component";
import { ModalPagtoBoletoComponent } from "./modal-pagto-boleto/modal-pagto-boleto.component";
import { ModalPagtoDiComponent } from "./modal-pagto-di/modal-pagto-di.component";
import { ModalBuscaVendaComponent } from "./modal-busca-venda/busca-venda.component";
import { ModalBuscaGenericoComponent } from "../shared/components/modal-busca-generico/busca-generico.component";
import { ModalNfeComponent } from "./modal-nfe/modal-nfe.component";

import { Produto } from "../shared/models/produto";
import { Cliente } from "../shared/models/Cliente";
import { Vendedor } from "../shared/models/Vendedor";
import { Venda } from "../shared/models/venda";
import { Deus } from "../shared/models/deus";

import * as dinheiro from "../shared/models/dinheiro";

// import * as bemafi from '../../Bemafi32';
let escopo = this;
@Component({
  selector: "app-caixa",
  templateUrl: "./caixa.component.html",
  styleUrls: ["./caixa.component.scss"]
})
export class CaixaComponent implements OnInit {
  empresa = {
    CODIGO: 1,
    NOME: "FLORESTAL FERRAGENS"
  };
  name: string;
  color: string;
  input = {
    codbar: null,
    qtd: 1
  };
  venda: Venda = new Venda(
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
  cartao = [];
  boleto = [];
  pagamento: Deus[] = [];
  prodvenda: Produto[] = [];
  cliente: Cliente = {
    CODIGO: null,
    RAZAO: "",
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
    public dialog: MatDialog,
    private renderer: Renderer2,
    public electron: ElectronService
  ) {}

  // tslint:disable-next-line: use-lifecycle-interface
  ngAfterViewInit() {
    this.DOM.inputProd = this.renderer.selectRootElement("#codbar");
    this.DOM.inputCli = this.renderer.selectRootElement("#inputCli");
    this.DOM.inputVend = this.renderer.selectRootElement("#inputVend");
    this.DOM.inputQtd = this.renderer.selectRootElement("#multqtd");
  }

  // função que volta o input
  inputReturn() {
    this.DOM.inputProd.focus();
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
  clicaAbreVenda() {
    const dialogRef = this.dialog.open(ModalBuscaVendaComponent, {
      width: "70vw",
      height: "60vh",
      hasBackdrop: true,
      disableClose: true,
      data: "venda"
    });

    dialogRef.afterClosed().subscribe(res => {
      console.log("retorno", res);
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
      width: "100vw",
      height: "100vh",
      hasBackdrop: true,
      disableClose: false,
      data: this.venda
    });

    dialogRef.afterClosed().subscribe(res => {
      console.log("retorno", res);
    });
  }

  // insere um novo produto com pelo id (alterar para codbar)
  getProduto(id: number, qtd: number) {
    console.log('getProduto');
    this.input.codbar = null;
    this.input.qtd = 1;
    this.caixaService.insereProdvenda(id, qtd, this.venda.LCTO).subscribe(
      produto => {
        // produto.QTD = qtd;
        this.ultimoProduto = produto;
        this.prodvenda.push(produto);
        this.venda.insereProduto(produto);
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
      this.openDialog("cliente", this.getCliente);
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
      this.openDialog("vendedor", this.getVendedor);
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
      this.clicaAbreVenda();
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
    this.venda.PAGAR = this.venda.TOTAL;
  }

  openDialog(busca, callback) {
    const dialogRef = this.dialog.open(ModalBuscaGenericoComponent, {
      width: "70vw",
      height: "79vh",
      hasBackdrop: true,
      disableClose: true,
      data: busca
    });

    dialogRef.afterClosed().subscribe(res => {
      console.log("retorno", res);
      callback(res);
    });
  }

  inserePagtoCartao(pagto) {
    const dialogRef = this.dialog.open(ModalPagtoCartaoComponent, {
      width: "50vw",
      height: "80vh",
      hasBackdrop: true,
      disableClose: true,
      data: { tipopag: pagto, valor: this.venda.PAGAR.valor }
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.venda.PAGAR.subtrai(res.valor);
        console.log("pagar", this.venda.PAGAR);
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
        console.log("cartao", this.cartao);
        if (res.fPagto.PARCELAS === 0) {
          const pgto: Deus = {

            CODIGO: null,
            CODDEC: null,
            EMPRESA: this.empresa.CODIGO,
            CODPARC: this.cliente.CODIGO,
            LCTO: this.venda.LCTO,
            TIPOLCTO: "V",
            DOCUMENTO: this.venda.LCTO.toString() + "-0/0",
            DATAEMISSAO: this.venda.DATA,
            DATAVCTO: new Date(
              data.setDate(data.getDate() + res.fPagto.PERIODO)
            ),
            DATALIQUID: null,
            DEBITO: res.fPagto.DOMICILIO_BANCARIO,
            CREDITO: 173,
            VALOR: res.valor,
            PROJECAO: 0,
            OBS: "",
            PERMITEAPAGA: null,
            TIPOOPERACAO: null,
            TRAVACREDITO: null
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
              TIPOLCTO: "V",
              DOCUMENTO: this.venda.LCTO.toString() + "-0/0",
              DATAEMISSAO: this.venda.DATA,
              DATAVCTO: data,
              DATALIQUID: null,
              DEBITO: res.fPagto.CONTA_DESPESA,
              CREDITO: res.fPagto.DOMICILIO_BANCARIO,
              VALOR: valorTarifa,
              PROJECAO: 0,
              OBS: "",
              PERMITEAPAGA: null,
              TIPOOPERACAO: null,
              TRAVACREDITO: null
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
              TIPOLCTO: "V",
              DOCUMENTO:
                this.venda.LCTO.toString() +
                "-" +
                (index + 1) +
                "/" +
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
              OBS: "",
              PERMITEAPAGA: null,
              TIPOOPERACAO: null,
              TRAVACREDITO: null
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
                TIPOLCTO: "V",
                DOCUMENTO:
                  this.venda.LCTO.toString() +
                  "-" +
                  (index + 1) +
                  "/" +
                  res.fPagto.PARCELAS,
                DATAEMISSAO: this.venda.DATA,
                DATAVCTO: new Date(newDate),
                DATALIQUID: null,
                DEBITO: res.fPagto.CONTA_DESPESA,
                CREDITO: res.fPagto.DOMICILIO_BANCARIO,
                VALOR: valorTarifa,
                PROJECAO: 0,
                OBS: "",
                PERMITEAPAGA: null,
                TIPOOPERACAO: null,
                TRAVACREDITO: null
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
      width: "50vw",
      height: "80vh",
      hasBackdrop: true,
      disableClose: true,
      data: { tipopag: pagto, valor: this.venda.PAGAR.valor }
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.venda.PAGAR.subtrai(res.valor);
        console.log("pagar", this.venda.PAGAR);
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
            TIPOLCTO: "V",
            DOCUMENTO:
              this.venda.LCTO.toString() +
              "-" +
              (index + 1) +
              "/" +
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
            OBS: "",
            PERMITEAPAGA: null,
            TIPOOPERACAO: null,
            TRAVACREDITO: null
          };
          this.venda.PAGAMENTO.push(pgto);
        }

        console.log(this.venda.PAGAMENTO);
      }
    });
  }

  inserePagtoDi(pagto) {
    const dialogRef = this.dialog.open(ModalPagtoDiComponent, {
      width: "40vw",
      height: "70vh",
      hasBackdrop: true,
      disableClose: true,
      data: { tipopag: pagto, valor: this.venda.PAGAR.valor }
    });
    dialogRef.afterClosed().subscribe(res => {
      this.venda.PAGAR.subtrai(res.pagar);
      console.log("pagar", this.venda.PAGAR);
      const data = new Date(this.venda.DATA);
      const pgto: Deus = {
        CODIGO: null,
        CODDEC: null,
        EMPRESA: this.empresa.CODIGO,
        CODPARC: this.cliente.CODIGO,
        LCTO: this.venda.LCTO,
        TIPOLCTO: "V",
        DOCUMENTO: this.venda.LCTO.toString() + "-0/0",
        DATAEMISSAO: this.venda.DATA,
        DATAVCTO: this.venda.DATA,
        DATALIQUID: null,
        DEBITO: 159,
        CREDITO: 173,
        VALOR: res.pagar,
        PROJECAO: 0,
        OBS: "",
        PERMITEAPAGA: null,
        TIPOOPERACAO: null,
        TRAVACREDITO: null
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
      TIPOLCTO: "V",
      DOCUMENTO: this.venda.LCTO.toString(),
      DATAEMISSAO: this.venda.DATA,
      DATAVCTO: this.venda.DATA,
      DATALIQUID: this.venda.DATA,
      DEBITO: 173,
      CREDITO: 126,
      VALOR: this.venda.TOTAL,
      PROJECAO: 0,
      OBS: ""
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
        let ultimo: any;
        console.log(prodVenda);
        prodVenda.forEach(function(item) {
          if (item.QTDPEDIDO > 0) {
            ultimo = item;
            venda.insereProduto(item);
            console.log("inseriu item");
          }
          if (item.QTDPEDIDO < 0) {
            venda.insereDescontos(item);
            console.log("descontou item");
          }
          console.log(ultimo);
        });
        // this.prodvenda = prodVenda;
      },
      error => console.log(error)
    );
  }

  imprime = async function(venda) {
    var html =
      "<html><head><style>@page { size: portrait;margin: 1%; }table,td,tr,span{font-size:8pt;font-family:Arial;}table {width:80mm;}td {min-width:2mm;}hr{border-top:1pt dashed #000;} </style></head><body ng-controller='BaixaController'>";
    var conteudo =
      "<div><span>DOCUMENTO SEM VALOR FISCAL</span><hr><span class='pull-left'>" +
      "</span><br><span class='pull-left'>Pedido: " +
      venda.LCTO +
      "   Emissão: " +
      new Date().toLocaleDateString() +
      "</span><br><span>Cliente: " +
      venda.NOMECLI +
      "</span><br><span>Cod. Cliente" +
      venda.CODCLI +
      "</span><br><span>Vendedor: " +
      venda.NOMEVEND +
      "</span><br>";
    conteudo +=
      "<span>Forma de Pagamento--------------------------------</span><br>";
    conteudo += "<table>";
    for (let x of venda.PAGAMENTO) {
      conteudo +=
        "<tr><td colspan='3'>" +
        x.vencimento.toLocaleDateString() +
        "</td><td>" +
        x.valor.toString() +
        "</td><td>" +
        x.tipo +
        "</td><td colspan='3'> </td></tr>";
    }
    conteudo +=
      "</table><hr><table><tr><td colspan='8'>Descricao<td></tr><tr><td></td><td>Qtd</td><td>UN</td><td colspan='3'>Código</td><td>Vl. Unit.</td><td>Subtotal</td>";
    for (let x of venda.PRODUTOS) {
      let emb = "";
      if (x.CODPRO != x.CODPROFISCAL) {
        emb = " emb. c/" + x.MULTQTD;
      }
      if (!x.QTDRESERVA)
        conteudo +=
          "<tr><td colspan='8'>" +
          x.DESCRICAO +
          "</td></tr><tr><td></td><td>" +
          x.QTD +
          emb +
          "</td><td>" +
          x.UNIDADE +
          "</td><td colspan='3'>" +
          x.CODPRO +
          "</td><td>" +
          x.VALOR.toString() +
          "</td><td>" +
          x.TOTAL.toString() +
          "</td></tr>";
    }
    venda.PRODUTOS.every(function(element, index) {
      if (element.QTDRESERVA) {
        conteudo += "<tr><td colspan='8'>ITENS DE ENCOMENDA</td</tr>";
        return false;
      } else return true;
    });
    for (let x of venda.PRODUTOS) {
      let emb = "";
      if (x.CODPRO != x.CODPROFISCAL) {
        emb = " emb. c/" + x.MULTQTD;
      }
      if (x.QTDRESERVA)
        conteudo +=
          "<tr><td colspan='8'>" +
          x.DESCRICAO +
          "</td></tr><tr><td></td><td>" +
          x.QTD +
          emb +
          "</td><td>" +
          x.UNIDADE +
          "</td><td colspan='3'>" +
          x.CODPRO +
          "</td><td>" +
          x.VALOR.toString() +
          "</td><td>" +
          x.TOTAL.toString() +
          "</td></tr>";
    }
    conteudo +=
      "</table><br><span class='pull-right'>Total Produtos: " +
      venda.TOTALDESC.toString() +
      "</span>";
    conteudo +=
      "<br><br><span>CONFERENTE.________________________________</span><br>";
    conteudo +=
      "<br><br><span>ASS._______________________________________</span></div></br><hr>";
    conteudo += conteudo;
    html += conteudo + "</body></html>";
    const janela = await this.electron.fs.writeFile(
      "c:/temp/teste.html",
      html,
      err => {
        if (err) throw err;
        let modal = window.open("", "impressao");
        console.log("The file has been saved!");
      }
    );
  };

  ngOnInit() {
    // console.log(bemafi.leituraX());
    this.getVenda(1425697);
  }
}
