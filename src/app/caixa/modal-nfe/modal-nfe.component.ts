import { Component, OnInit, Inject } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { SelectionModel } from "@angular/cdk/collections";
import { config, Observable } from "rxjs";
import { Venda } from "../../shared/models/venda";
import { CaixaService } from "../../caixa/caixa.service";
import { Deus } from "../../shared/models/deus";
import { remote } from 'electron';
import * as dinheiro from "../../shared/models/dinheiro";
import * as nfe from "node-nfe";
import * as ini from "ini";
// import * as fs from "fs";
import * as net from "net";

var configSat = require('../../../configs/sat.json');

import { ModalSelectTransitoComponent } from "../modal-select-transito/modal-select-transito.component";
import { ModalErrorComponent } from "../modal-error/modal-error.component";
import { rejects } from "assert";
import { resourcesPath } from "process";

function zeroEsq(valor, comprimento, digito) {
  const length = comprimento - valor.toString().length + 1;
  return Array(length).join(digito || "0") + valor;
}
function converteData(texto) {
  if (texto instanceof Date) {
    return texto;
  }
  const data = texto
    .match(/(\d{2,4})(\/|-|\.)(\d{2})\2(\d{2,4})/)
    .filter(function (elem, index, array) {
      return Number(elem);
    });
  if (data[2].length === 4) {
    data.reverse();
  }
  console.log(data);
  return new Date(data);
}
function dataFirebird(datainput) {
  console.log(datainput);
  if (!datainput) {
    return null;
  }
  const data = converteData(datainput);
  return (
    "'" +
    data.getDate() +
    "." +
    (data.getMonth() + 1) +
    "." +
    data.getFullYear() +
    "'"
  );
}
const NFe = nfe.NFe,
  Gerador = nfe.Gerador,
  Danfe = nfe.Danfe,
  Emitente = nfe.Emitente,
  Destinatario = nfe.Destinatario,
  Transportador = nfe.Transportador,
  Endereco = nfe.Endereco,
  Protocolo = nfe.Protocolo,
  Impostos = nfe.Impostos,
  Volumes = nfe.Volumes,
  Duplicata = nfe.Duplicata,
  Fatura = nfe.Fatura,
  Item = nfe.Item,
  Icms = nfe.Icms,
  GravaBanco = nfe.Gravabanco,
  Pagamento = nfe.Pagamento;
  
  

@Component({
  selector: "app-my-modal",
  templateUrl: "./modal-nfe.component.html",
  styleUrls: ["./modal-nfe.component.scss"]
})
export class ModalNfeComponent implements OnInit {
  danfe = new NFe(); // variável que contem os dados da NF
  contasEmpresas = {
    "1": {
      ICMSVENDA: 229,
      ICMSRECOLHER: 104
    },
    "2": {
      ICMSVENDA: 278,
      ICMSRECOLHER: 104
    }
  };

  transito: {
    TRANSITO: number;
    TIPO: string;
    CGC: string;
    INSC: string;
    EMAIL: string;
    FONE: string;
    RAZAO: string;
    ENDERECO: string;
    NUMERO: string;
    BAIRRO: string;
    CEP: string;
    CODIBGE: string;
    CODCIDADE: string;
    CIDADE: string;
    ESTADO: string;
    COMPLEMENTO: string;
    VALOR: dinheiro;
    DESCONTO: number;
    FRETE: number;
    SEGURO: number;
  };
  emitente = new Emitente();
  destinatario = new Destinatario();
  transportador = new Transportador();
  volumes = new Volumes();
  empresa: number;
  INDIEDEST: "";
  tributos: Deus[] = [];
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
  novaNota: Number = null;
  operacao: Number;
  tabSelect = 0;
  nota = new NFe();
  busca = {
    codigo: "",
    razao: ""
  };
  titulo: string;
  tipoOperacao: any[];
  permiteNfe: boolean = true;
  cfpSAT: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<ModalNfeComponent>,
    private caixaService: CaixaService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: { venda: Venda; empresa: number }
  ) {
    this.venda = data.venda;
    if (data.venda.LCTO) {
      this.novaNota = data.venda.LCTO;
    }
    this.empresa = data.empresa;
    this.operacao = 1;
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
  onConfirm(): void {
    this.dialogRef.close(this.transito);
  }
  zeroEsq(valor, comprimento, digito) {
    const length = comprimento - valor.toString().length + 1;
    return Array(length).join(digito || "0") + valor;
  }

  ngOnInit() {
    this.caixaService
      .getTipoOperacao()
      .subscribe(tipos => (this.tipoOperacao = tipos));
  }

  carregaVenda(novaNota) {
    this.caixaService.getVenda(novaNota).subscribe(
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
        for (const item of venda) {
          console.log(item.ID_TRANSITO);
          this.venda.insereLcto({
            TRANSITO: item.ID_TRANSITO,
            TIPO: item.TIPO_TRANSITO,
            STATUS: item.STATUS,
            CGC: venda[0].CGC,
            INSC: venda[0].INSC,
            EMAIL: venda[0].EMAIL,
            FONE: venda[0].FONE,
            RAZAO: venda[0].RAZAO,
            ENDERECO: venda[0].ENDERECO,
            NUMERO: venda[0].NUMERO,
            BAIRRO: venda[0].BAIRRO,
            CEP: venda[0].CEP,
            CODIBGE: venda[0].CODIBGE,
            CODCIDADE: venda[0].CODCIDADE,
            CIDADE: venda[0].CIDADE,
            ESTADO: venda[0].ESTADO,
            COMPLEMENTO: venda[0].COMPLEMENTO,
            VALOR: new dinheiro(venda[0].VTRANSITO),
            DESCONTO: venda[0].DESCONTO,
            FRETE: venda[0].FRETE,
            SEGURO: venda[0].SEGURO,
            NFE: venda[0].NFE,
            CUPOM: venda[0].CUPOM
          });
        }
        this.venda.insereTransporte(
          venda[0].VOLUMES,
          venda[0].PESO,
          venda[0].TIPOFRETE,
          venda[0].TRANSPORTADOR
        );
        this.getProdvenda(this.venda.LCTO);
        this.getPagamentos(this.venda.LCTO);
        console.log(this.venda);
      },
      error => console.log(error)
    );
  }
  getPagamentos(lcto) {
    console.log('getpagtos')
    this.caixaService
      .getPagamentosVenda(lcto)
      .subscribe(pagamentos => (this.venda.PAGAMENTO = pagamentos));
  }
  getProdvenda(lcto: number) {
    this.caixaService.getProdVenda(lcto).subscribe(
      prodVenda => {
        let ultimo: any;
        console.log(prodVenda);
        for (const item of prodVenda) {
          if (item.QTDPEDIDO > 0) {
            ultimo = item;
            this.venda.insereProduto(item);
            console.log("inseriu item");
          }
          if (item.QTDPEDIDO < 0) {
            this.venda.insereDescontos(item);
            console.log("descontou item");
          }
          console.log(ultimo);
        }
        // this.prodvenda = prodVenda;
      },
      error => console.log(error)
    );
  }

  geraNota() { //bre o modal que indica o transito 
    const dialogRef = this.dialog.open(ModalSelectTransitoComponent, {
      width: "40vw",
      height: "70vh",
      hasBackdrop: true,
      disableClose: false,
      data: { transitos: this.venda.TRANSITO }
    });

    dialogRef.afterClosed().subscribe(res => {
      console.log("retorno", res);
      this.transito = res;
      this.geraNfe(this.empresa, this.venda, res.TRANSITO).subscribe(danfe => {
        console.log("danfe", danfe);
        this.nota = danfe;
        this.tabSelect = 1;
      }, error => {
        console.log(error);
        const dialogRef = this.dialog.open(ModalErrorComponent, {
          width: "40vw",
          height: "70vh",
          hasBackdrop: true,
          disableClose: false,
          data: { error: error }
        });

        dialogRef.afterClosed().subscribe(res => { })
      });
    });
  }

  geraNfe(empresa, venda, trSelecionado): Observable<any> { // cria o modelo da danfe
    console.log("dados remetente");
    console.log(trSelecionado);
    const transito = venda.TRANSITO.find(
      element => element.TRANSITO === trSelecionado
    );
    console.log(transito);
    return new Observable(observable => {
      this.caixaService.getEmitente(empresa).subscribe(
        dadosEmpresa => {
          this.emitente
            .comNome(dadosEmpresa.RAZAO)
            .comRegistroNacional(dadosEmpresa.CGC)
            .comInscricaoEstadual(dadosEmpresa.INSC)
            .comTelefone(dadosEmpresa.FONE)
            .comEmail(dadosEmpresa.EMAIL)
            .comCrt(dadosEmpresa.CRT)
            // .comIcmsSimples(dadosEmpresa.ICMS_SIMPLES)
            .comEndereco(
              new Endereco()
                .comLogradouro(dadosEmpresa.ENDERECO)
                .comNumero(dadosEmpresa.NUMERO)
                .comComplemento("")
                .comCep(dadosEmpresa.CEP)
                .comBairro(dadosEmpresa.BAIRRO)
                .comMunicipio(dadosEmpresa.CIDADE)
                .comCidade(dadosEmpresa.CIDADE)
                .comCodMunicipio(dadosEmpresa.CODIBGE)
                .comUf(dadosEmpresa.ESTADO)
            );
          if(venda.CODCLI != 1) {

            try {
              this.destinatario
                .comNome(venda.RAZAO)
                .comCodigo(venda.CODCLI)
                .comRegistroNacional(venda.CGC)
                .comInscricaoEstadual(venda.INSC)
                .comTelefone(venda.FONE)
                .comEmail(venda.EMAIL)
                .comEndereco(
                  new Endereco()
                    .comLogradouro(transito.ENDERECO)
                    .comNumero(transito.NUMERO)
                    .comComplemento(transito.COMPLEMENTO)
                    .comCep(transito.CEP)
                    .comBairro(transito.BAIRRO)
                    .comMunicipio(transito.CIDADE)
                    .comCidade(transito.CIDADE)
                    .comUf(transito.ESTADO)
                    .comCodMunicipio(transito.CODIBGE)
                );
            }
            catch (error) {
              observable.error(error);
            }

          }
          else {
            


            this.permiteNfe = false;

            try {
              this.destinatario
                .comNome(venda.RAZAO)
                .comCodigo(venda.CODCLI)
                //.comRegistroNacional(venda.CGC)
                //.comInscricaoEstadual(venda.INSC)
                //.comTelefone(venda.FONE)
                //.comEmail(venda.EMAIL)
                .comEndereco(
                  new Endereco()
                    //.comLogradouro(transito.ENDERECO)
                    //.comNumero(transito.NUMERO)
                    //.comComplemento(transito.COMPLEMENTO)
                    //.comCep(transito.CEP)
                    //.comBairro(transito.BAIRRO)
                    //.comMunicipio(transito.CIDADE)
                    //.comCidade(transito.CIDADE)
                    .comUf("SP")
                    //.comCodMunicipio(transito.CODIBGE)
                );
            }
            catch (error) {
              observable.error(error);
            }


          }



          this.transportador
            .comNome(venda.TRANSPORTE.TRANSPORTADOR)
            .comCodigo(venda.TRANSPORTE.TRANSPORTADOR)
            .comEndereco(new Endereco());
          this.volumes.comQuantidade(venda.TRANSPORTE.VOLUMES);
          this.volumes.comEspecie("CX");
          this.volumes.comMarca("");
          this.volumes.comNumeracao("");
          this.volumes.comPesoBruto(venda.TRANSPORTE.PESO);

          this.danfe = new NFe();
          let tipoFrete = "";
          switch (this.venda.TRANSPORTE.TIPOFRETE) {
            case "0":
              tipoFrete = "porContaDoEmitente";
              break;
            case "1":
              tipoFrete = "porContaDoDestinatarioRemetente";
              break;
            case "2":
              tipoFrete = "porContaDeTerceiros";
              break;
            case "3":
              tipoFrete = "porContaProprioRemetente";
              break;
            case "4":
              tipoFrete = "porContaProprioDestinatario";
              break;
            default:
              tipoFrete = "semFrete";
          }
          this.danfe.comEmitente(this.emitente);
          this.danfe.comDestinatario(this.destinatario);
          this.danfe.comTransportador(this.transportador);
          this.danfe.comVolumes(this.volumes);
          this.danfe.comTipo("saida");
          this.danfe.comFinalidade("normal");
          let naturezaOperacao = "VENDA DE MERCADORIA NO ESTADO";
          if (this.operacao === 2) {
            naturezaOperacao = "VENDA DE ATIVO";
          }
          if (
            this.operacao === 3 &&
            this.danfe
              .getDestinatario()
              .getEndereco()
              .getUf() !==
            this.danfe
              .getEmitente()
              .getEndereco()
              .getUf()
          ) {
            naturezaOperacao =
              " Devolução de venda de mercadoria fora do estado";
            this.danfe.comFinalidade("devolução");
          }
          if (this.operacao === 4) {
            naturezaOperacao = "REMESSA DE MERCADORIA OU BEM PARA REPARO";
          }
          if (
            this.operacao === 5 &&
            this.danfe
              .getDestinatario()
              .getEndereco()
              .getUf() !==
            this.danfe
              .getEmitente()
              .getEndereco()
              .getUf()
          ) {
            naturezaOperacao = " AMOSTRA GRÁTIS";
          }
          if (
            this.operacao === 6 &&
            this.danfe
              .getDestinatario()
              .getEndereco()
              .getUf() !==
            this.danfe
              .getEmitente()
              .getEndereco()
              .getUf()
          ) {
            naturezaOperacao =
              "Retorno de bem recebido por conta de contrato de comodato";
            this.danfe.comFinalidade("devolução");
          }
          if (
            this.operacao === 1 &&
            this.danfe
              .getDestinatario()
              .getEndereco()
              .getUf() !==
            this.danfe
              .getEmitente()
              .getEndereco()
              .getUf()
          ) {
            naturezaOperacao = "VENDA DE MERCADORIA FORA DO ESTADO";
          }
          this.danfe.comNaturezaDaOperacao(naturezaOperacao);
          this.danfe.comSerie("001");
          this.danfe.comDataDaEmissao(new Date());
          this.danfe.comDataDaEntradaOuSaida(new Date());
          this.danfe.comModalidadeDoFrete(tipoFrete);

          console.log("com pagamento");
          let _numDuplicata = 0;
          const _vlFat = new dinheiro(0);
          console.log("entrou no ifpag");
          if (this.operacao !== 3 && this.operacao !== 4) {
            console.log("entrou no inserepag");
            // const pagamento = new Pagamento();
            // pagamento
            //   .comFormaDePagamento("Á Vista")
            //   .comMeioDePagamento("Dinheiro")
            //   .comValor("")
            //   .comIntegracaoDePagamento("Não Integrado")
            //   .comBandeiraDoCartao("")
            //   .comValorDoTroco("")
            //   .comVencimento(new Date());
            // this.danfe._pagamentos.push(pagamento);
            for (const item of venda.PAGAMENTO) {
              if (item.TIPOOPERACAO !== 5 && item.TIPOOPERACAO !== 7 && item.TIPOOPERACAO !== 23) {
                const sigla = this.tipoOperacao.find(
                  x => x.CODIGO == item.TIPOOPERACAO
                );
                console.log(sigla);
                let _formaPagto = "",
                  _meioPagto = "",
                  _integracaoPagto = "",
                  _bandeiraCartao = "",
                  _valorTroco = 0;
                if (sigla.SIGLA === "BL") {
                  _vlFat.soma(item.VALOR);
                  (_formaPagto = "Á Prazo"),
                    (_meioPagto = "Boleto Bancário"),
                    (_integracaoPagto = "Não Integrado"),
                    _numDuplicata++;
                  const duplicata = new Duplicata();
                  duplicata
                    .comNumero(this.zeroEsq(_numDuplicata, 3, 0))
                    .comValor(item.VALOR)
                    .comVencimento(item.DATAVCTO);
                  this.danfe._duplicatas.push(duplicata);
                } else if (sigla.SIGLA === "CV") {
                  (_formaPagto = "Á Prazo"),
                    (_meioPagto = "Cartão de Crédito"),
                    (_integracaoPagto = "Não Integrado"),
                    (_bandeiraCartao = "Visa");
                } else if (sigla.SIGLA === "CH") {
                  (_formaPagto = "Á Prazo"),
                    (_meioPagto = "Cartão de Crédito"),
                    (_integracaoPagto = "Não Integrado"),
                    (_bandeiraCartao = "Visa");
                } else if (sigla.SIGLA === "CV") {
                  (_formaPagto = "Á Prazo"),
                    (_meioPagto = "Cartão de Crédito"),
                    (_integracaoPagto = "Não Integrado"),
                    (_bandeiraCartao = "Visa");
                } else if (sigla.SIGLA === "CV") {
                  (_formaPagto = "Á Prazo"),
                    (_meioPagto = "Cartão de Crédito"),
                    (_integracaoPagto = "Não Integrado"),
                    (_bandeiraCartao = "Visa");
                } else if (sigla.SIGLA === "CV") {
                  (_formaPagto = "Á Prazo"),
                    (_meioPagto = "Cartão de Crédito"),
                    (_integracaoPagto = "Não Integrado"),
                    (_bandeiraCartao = "Visa");
                } else if (sigla.SIGLA === "CM") {
                  (_formaPagto = "Á Prazo"),
                    (_meioPagto = "Cartão de Crédito"),
                    (_integracaoPagto = "Não Integrado"),
                    (_bandeiraCartao = "Mastercard");
                } else if (sigla.SIGLA === "DV") {
                  (_formaPagto = "Á Vista"),
                    (_meioPagto = "Cartão de Débito"),
                    (_integracaoPagto = "Não Integrado"),
                    (_bandeiraCartao = "Visa");
                } else if (sigla.SIGLA === "DM") {
                  (_formaPagto = "Á Vista"),
                    (_meioPagto = "Cartão de Débito"),
                    (_integracaoPagto = "Não Integrado"),
                    (_bandeiraCartao = "Mastercard");
                } else if (sigla.SIGLA === "CH") {
                  (_formaPagto = "Á Vista"),
                    (_meioPagto = "Cartão de Crédito"),
                    (_integracaoPagto = "Não Integrado"),
                    (_bandeiraCartao = "Hipercard");
                } else {
                  // se nenhum atender considerar Dinheiro
                  (_formaPagto = "Á Vista"),
                    (_meioPagto = "Dinheiro"),
                    (_integracaoPagto = "Não Integrado");
                }
                const pagamento = new Pagamento();
                pagamento
                  .comFormaDePagamento(_formaPagto)
                  .comValor(item.VALOR)
                  .comMeioDePagamento(_meioPagto)
                  .comIntegracaoDePagamento(_integracaoPagto)
                  .comBandeiraDoCartao(_bandeiraCartao ? _bandeiraCartao : "")
                  .comValorDoTroco(_valorTroco)
                  .comVencimento(item.DATAVCTO);
                this.danfe._pagamentos.push(pagamento);
              }
            }
            if (_vlFat.valor) {
              const fatura = new Fatura();
              fatura
                .comNumero("0001")
                .comValorOriginal(_vlFat.valor + 0.01)
                .comValorDoDesconto(0.01)
                .comValorLiquido(_vlFat.valor);
              this.danfe.comFatura(fatura);
            }
          } else {
            const pagamento = new Pagamento();
            pagamento
              .comFormaDePagamento("Á Vista")
              .comMeioDePagamento("Sem Pagamento")
              .comValor("")
              .comIntegracaoDePagamento("Não Integrado")
              .comBandeiraDoCartao("")
              .comValorDoTroco("")
              .comVencimento(new Date());
            this.danfe._pagamentos.push(pagamento);
          }



          for (const item of venda.PRODUTOS) {
            if (item.TRANSITO === transito.TRANSITO) {
              console.log(item);
              const prodst = item.SITTRIB === "060" ? true : false;
              const icms = new Icms().CalculaIcms(
                prodst,
                this.danfe.getEmitente().getCodigoRegimeTributario(),
                this.danfe
                  .getEmitente()
                  .getEndereco()
                  .getUf(),
                this.danfe
                  .getDestinatario()
                  .getEndereco()
                  .getUf(),
                this.danfe.getDestinatario().getIdenfificaContribuinteIcms(),
                1,
                item.BASECALC,
                item.ALIQ,
                item.ORIG,
                this.operacao,
                this.danfe.getEmitente().getIcmsSimples()
              );

              // this.caixaService.getTributosIbpt(item.NCM, this.danfe.getDestinatario().getEndereco().getUf().toLowerCase()).subscribe(tributos => {
              // })
              let UF = this.danfe.getDestinatario().getEndereco().getUf() || 'SP'
              this.danfe.adicionarItem(
                new Item()
                  .comCodigo(item.CODPROFISCAL)
                  .comCodProdVenda(item.CODPRODVENDA)
                  .comDescricao(item.DESCRICAO)
                  .comNcmSh(item.NCM)
                  .comIcms(icms)
                  .comTributoAproximado(item.BASECALC,UF,item.NCM,item.ORIG)
                  // .comOCst('020')
                  // .comCfop('6101')
                  .comUnidade(item.UNIDADE)
                  .comQuantidade(item.QTDFISCAL)
                  .comValorDaCofins(item.BASECALC - icms.getValorDoIcms(), 3, '01')
                  .comValorDoPis(item.BASECALC - icms.getValorDoIcms(), 0.65, '01')
                  .comValorUnitario(item.VALORUNITFISCAL)
                  .comValorDoFrete(item.FRETEPROD)
                  .comValorDoIpiDevolucao(
                    this.operacao === 3
                      ? (item.ALIQIPI / 100) * item.BASECALC
                      : 0
                  )
              );

            }
          }

          const impostos = new Impostos();
          impostos.comBaseDeCalculoDoIcms(
            this.danfe.getItens().reduce(function (a, item) {
              return a.soma(item.getIcms().getBaseDeCalculoDoIcms());
            }, new dinheiro(0))
          );
          impostos.comValorDoIcms(
            this.danfe.getItens().reduce(function (a, item) {
              return a.soma(item.getIcms().getValorDoIcms());
            }, new dinheiro(0))
          );
          impostos.comBaseDeCalculoDoIcmsSt(
            this.danfe.getItens().reduce(function (a, item) {
              return a.soma(item.getIcms().getBaseDeCalculoDoIcmsSt());
            }, new dinheiro(0))
          );
          impostos.comValorDoIcmsSt(
            this.danfe.getItens().reduce(function (a, item) {
              return a.soma(item.getIcms().getValorDoIcmsSt());
            }, new dinheiro(0))
          );
          impostos.comValorDoImpostoDeImportacao(0);
          impostos.comValorDoPis(
            this.danfe.getItens().reduce(function (a, item) {
              return a.soma(item.getValorDoPis());
            }, new dinheiro(0))
          );
          impostos.comValorTotalDoIpi(0);
          impostos.comValorDaCofins(
            this.danfe.getItens().reduce(function (a, item) {
              return a.soma(item.getValorDaCofins());
            }, new dinheiro(0))
          );
          impostos.comValorTotalFundoCombatePobreza(
            this.danfe.getItens().reduce(function (a, item) {
              return a.soma(item.getIcms().getValorFundoCombatePobrezaDestino());
            }, new dinheiro(0))
          );
          impostos.comBaseDeCalculoDoIssqn(0);
          impostos.comValorTotalDoIssqn(0);
          this.danfe.comImpostos(impostos);

          this.danfe.comValorTotalDoIpiDevol(
            this.danfe.getItens().reduce(function (a, item) {
              return a.soma(item.getValorDoIpiDevolucao());
            }, new dinheiro(0))
          );
          this.danfe.comValorTotalDaNota(
            this.danfe.getValorTotalDoIpiDevol().valor +
            this.danfe.getItens().reduce(function (a, item) {
              return a
                .soma(item.getValorDoFrete())
                .soma(item.getValorTotal());
            }, new dinheiro(0))
          );
          this.danfe.comValorTotalDosProdutos(
            this.danfe.getItens().reduce(function (a, item) {
              return a.soma(item.getValorTotal());
            }, new dinheiro(0))
          );
          this.danfe.comValorBaseCalculoDoIpiDevol(
            this.danfe.getItens().reduce(function (a, item) {
              if (item.getPorcentagemDoIpiDevolucao()) {
                return a.soma(item.getValorTotal());
              } else {
                return a.soma(0);
              }
            }, new dinheiro(0))
          );
          this.danfe.comValorTotalDoIcmsSn(
            this.danfe.getItens().reduce(function (a, item) {
              return a.soma(item.getIcms().getvalorCredICMSSN());
            }, new dinheiro(0))
          );
          this.danfe.comValorTotalDosServicos(0);
          this.danfe.comValorDoFrete(
            this.danfe.getItens().reduce(function (a, item) {
              return a.soma(item.getValorDoFrete());
            }, new dinheiro(0))
          );
          this.danfe.comValorDoSeguro(0);
          this.danfe.comDesconto(0);
          this.danfe.comOutrasDespesas(0);

          console.log('informação complementar');
          let impostoFed = this.danfe.getItens().reduce(function (a, item) {
            console.log('reducefed', item.getTributoAproximadoFederal())
            return a.soma(item.getTributoAproximadoFederal());
          }, new dinheiro(0))
          let impostoEst = this.danfe.getItens().reduce(function (a, item) {
            console.log('reduce est', item.getTributoAproximadoEstadual())
            return a.soma(item.getTributoAproximadoEstadual());
          }, new dinheiro(0))
          let impostoMun = this.danfe.getItens().reduce(function (a, item) {
            console.log('reduce mun', item.getTributoAproximadoMunicipal())
            return a.soma(item.getTributoAproximadoMunicipal());
          }, new dinheiro(0))

          let infoComplementar = `Trib Aprox R$ ${impostoFed} Fed, R$ ${impostoEst} Est e R$ ${impostoMun} Mun. Fonte:IBPT/empresometro.com.br`;
          //   "Documento emitido por ME ou EPP optante pelo simples nacional;";
          // console.log(
          //   "codregime",
          //   this.danfe.getEmitente().getCodigoRegimeTributario()
          // );
          // if (
          //   this.danfe.getEmitente().getCodigoRegimeTributario() === "1" &&
          //   this.operacao == 1
          // ) {
          //   infoComplementar +=
          //     "Valor dos produtos Tributado pelo Simples Nacional R$" +
          //     this.danfe.getItens().reduce(function(a, item) {
          //       return a.soma(item.getValorTotal());
          //     }, new dinheiro(0)) +
          //     ";";
          //   infoComplementar +=
          //     "Valor dos produtos Substituicao Tributaria " +
          //     this.danfe.getImpostos().getBaseDeCalculoDoIcmsStFormatada() +
          //     ";";
          //   if (
          //     this.danfe.getDestinatario().getIdenfificaContribuinteIcms() ==
          //       1 &&
          //     this.operacao == 1
          //   ) {
          //     infoComplementar +=
          //       "PERMITE O APROVEITAMENTO DO CRÉDITO DE ICMS NO VALOR DE R$" +
          //       this.danfe.getValorTotalDoIcmsSn() +
          //       "; CORRESPONDENTE À ALÍQUOTA DE " +
          //       this.danfe.getEmitente().getIcmsSimples() +
          //       "%, NOS TERMOS DO ARTIGO 23 DA LC 123";
          //   }
          // } else if (
          //   this.danfe.getEmitente().getCodigoRegimeTributario() === "2" &&
          //   this.operacao === 1
          // ) {
          //   infoComplementar +=
          //     "Estabelecimento impedido de recolher o ICMS pelo simples nacional no inciso 1 do art. 2 da LC 123/2006;";
          //   infoComplementar +=
          //     "Imposto recolhido por substituição ART 313-Y DO RICMS;";
          //   if (this.operacao === 1) {
          //     infoComplementar +=
          //       "Valor dos produtos Tributado pelo Simples Nacional " +
          //       this.danfe.getImpostos().getBaseDeCalculoDoIcmsFormatada() +
          //       ";";
          //     infoComplementar +=
          //       "Valor dos produtos Substituicao Tributaria " +
          //       this.danfe.getImpostos().getBaseDeCalculoDoIcmsStFormatada() +
          //       ";";
          //   }
          // }
          if (this.operacao === 3) {
            infoComplementar +=
              "Valor da Base de calculo do IPI devolvido R$ " +
              this.danfe.getValorBaseCalculoDoIpiDevol().valor +
              ";";
            infoComplementar +=
              "Valor do IPI Devolvido R$ " +
              this.danfe.getValorTotalDoIpiDevol().valor +
              ";";
          }
          if (this.operacao === 4) {
            infoComplementar +=
              "Material que ora enviamos para conserto, conforme NF de venda Nº XXXX;";
            infoComplementar +=
              "NÃO INCIDÊNCIA DE ICMS Conforme Art.3º, XII Decreto 6080/2012 RICMS- PR;";
            infoComplementar +=
              "NÃO INCIDÊNCIA DE IPI Conforme Inciso XI do Art.5º do Decreto 7.212/2010;";
          }
          if (venda.DESCONTOITEM.valor) {
            infoComplementar +=
              "Valor Pago com crédito na loja " +
              venda.DESCONTOITEM.valor * -1 +
              ";";
          }
          this.danfe.comInformacoesComplementares(infoComplementar);




          console.log("emitente", this.emitente);
          observable.next(this.danfe);
          observable.complete();
        }, () => console.log('finish him')
      );
    });
  }




comunicaSat(comando):any {
  return new Promise (function (resolve, reject)  {

    const socketClient = net.connect(
      { host: configSat.host, port: configSat.port },
      () => {
        //console.log("executa comando " + comando);

      })

      socketClient.on("data", data => {
        let retorno = ini.parse(data.toString());
        console.log(retorno)
        if (retorno["Esperando por comandos."] == true) {
          
          console.log("tá esperando maluco")
          socketClient.write(`SAT.${comando}\r\n.\r\n`);
        }
        else if (retorno["OK: Erro|Erro na abertura da porta de comunicacao com o S@T"] == true) {
          reject(retorno);
        }
        else {
          console.log("to no timaout") ;
           resolve(retorno)
           //socketClient.end();
        }

        //console.log( "retornou ", data.toString());
      });
      socketClient.on("error", error => {
        console.log( "erro ", error.toString());
        reject(error.toString());
        //socketClient.end();
      })
  })

}





  

  enviaCFe() { 
    /*/  
      inicializar o SAT
      enviar o documento fical ao sat
      pegar o retorno, e se correto pegar o numero do cupom e chave e gravar os dados
      estando tudo certo fazer a impressão
      desinicializar o SAT
    /*/


    //this.danfe.comNumero(numNota);
    if (this.danfe.getImpostos().getValorDoIcms() > 0) {
      this.tributos.push({
        CODIGO: null,
        CODDEC: null,
        EMPRESA: this.empresa,
        CODPARC: this.venda.CODCLI,
        LCTO: this.venda.LCTO,
        TIPOLCTO: "V",
        DOCUMENTO: this.transito.toString(),
        DATAEMISSAO: this.venda.DATA,
        DATAVCTO: this.venda.DATA,
        DATALIQUID: this.venda.DATA,
        DEBITO: this.contasEmpresas[this.empresa].ICMSVENDA,
        CREDITO: this.contasEmpresas[this.empresa].ICMSRECOLHER,
        VALOR: this.danfe.getImpostos().getValorDoIcms(),
        PROJECAO: 0,
        OBS: "",
        PERMITEAPAGA: null,
        TIPOOPERACAO: 12,
        TRAVACREDITO: null
      });
    }
    const dados = {
      EMPRESA: this.empresa, // EMPRESA
      NOTA: this.danfe.getNumero(), // NOTA
      DATA: dataFirebird(this.danfe.getDataDaEmissao()), // DATA
      CODCLI: this.danfe.getDestinatario().getCodigo() || 1, // CODCLI
      DT_EMISSAO: dataFirebird(this.danfe.getDataDaEmissao()), // DT_EMISSAO
      DT_FISCAL: dataFirebird(this.danfe.getDataDaEmissao()), // DT_FISCAL
      ESPECIE: 1, // ESPECIE
      DESPACES: this.danfe.getOutrasDespesas(), // DESPACES
      DESCONTO: this.danfe.getDesconto(), // DESCONTO
      CODIGODEBARRAS: "", // CODIGODEBARRAS  -  TODO
      FRETENOTA: this.danfe.getValorDoFrete(), // FRETENOTA
      FRETEFOB: 0, // FRETEFOB
      VPROD: this.danfe.getValorTotalDosProdutos(), // VPROD
      BCICMS: this.danfe.getImpostos().getBaseDeCalculoDoIcms(), // BCICMS
      VICMS: this.danfe.getImpostos().getValorDoIcms(), // VICMS
      VICMSST: this.danfe.getImpostos().getValorDoIcmsSt(), // VICMSST
      BCICMSST: this.danfe.getImpostos().getBaseDeCalculoDoIcmsSt(), // BCICMSST
      VNF: this.danfe.getValorTotalDaNota(), // VNF
      UF: this.danfe
        .getDestinatario()
        .getEndereco()
        .getUf(), // UF
      CHAVE: this.danfe.getChaveDeAcesso(), // CHAVE
      TOMADORFRETE: this.danfe.getCodigoModalidadeDoFrete(), // TOMADORFRETE
      MODELO: "58", // MODELO
      SERIE: '', // SERIE
      CODPARC: this.danfe.getDestinatario().getCodigo() || 1, // CODPARC
      PROTOCOLO: this.danfe.getProtocolo().getCodigo(), // PROTOCOLO
      PROTOCOLOCANCELA: "", // PROTOCOLOCANCELA,
      ARQUIVO: "",
      VPIS: this.danfe.getImpostos().getValorDoPis().valor, // VPIS
      VCOFINS: this.danfe.getImpostos().getValorDaCofins().valor // VCOFINS
    };
    const itensx = [];
    
    function sign () {
      return configSat.signAC ;
    };

    for (const item of this.danfe.getItens()) {
      // insert into PRODSAIDA (VBCICMS,PICMSST,VBCICMSST,VICMS,VICMSST,PICMS,CFOP,NCM,ORIG,CEST,SITTRIB)
      itensx.push({
        CODPRODVENDA: item.getCodProdVenda(), // CODPRODVENDA
        VBCICMS: item.getIcms().getBaseDeCalculoDoIcms() || "null", // VBCICMS
        PICMSST: item.getIcms().getAliquotaDoIcmsSt() || "null", // PICMSST
        VBCICMSST: item.getIcms().getBaseDeCalculoDoIcmsSt() || "null", // VBCICMSST
        VICMS: item.getIcms().getValorDoIcms() || "null", // VICMS
        VICMSST: item.getIcms().getValorDoIcmsSt() || "null", // VICMSST
        PICMS: item.getIcms().getAliquotaDoIcms() || "null", // PICMS
        CFOP: item.getIcms().getCfop(), // CFOP
        NCM: item.getNcmSh(), // NCM
        ORIG: item.getIcms().getOrigem(), // ORIG
        CEST: item.getCodigoCest() || "null", // CEST
        SITTRIB: item.getIcms().getSituacaoTributaria(), // SITTRIB
        PPIS: item.getPercentualDoPis(), //PPIS
        CSTPIS: item.getCstDoPis(), //CSTPIS
        VPIS: item.getValorDoPis(), //VPIS
        VBCPIS: item.getBaseDeCalculoDoPis(),// VBCPIS
        PCOFINS: item.getPercentualDaCofins(), //PPIS
        CSTCOFINS: item.getCstDaCofins(), //CSTPIS
        VCOFINS: item.getValorDaCofins(), //VPIS,
        VBCCOFINS: item.getBaseDeCalculoDaCofins() // VBCCOFINS
      });
    }
    console.log("gravaNfe");
    console.log(this.transito);


    let impostoFed = this.danfe.getItens().reduce(function (a, item) {
      console.log('reducefed', item.getTributoAproximadoFederal())
      return a.soma(item.getTributoAproximadoFederal());
    }, new dinheiro(0))
    let impostoEst = this.danfe.getItens().reduce(function (a, item) {
      console.log('reduce est', item.getTributoAproximadoEstadual())
      return a.soma(item.getTributoAproximadoEstadual());
    }, new dinheiro(0))
    let impostoMun = this.danfe.getItens().reduce(function (a, item) {
      console.log('reduce mun', item.getTributoAproximadoMunicipal())
      return a.soma(item.getTributoAproximadoMunicipal());
    }, new dinheiro(0))


    let imposto = impostoFed.soma(impostoEst).soma(impostoMun)

    const Geraini = {
      infCFe: {
        versao: "0.07"
      },
      Identificacao: {
        CNPJ: this.nota.getEmitente().getRegistroNacional(),
        signAC: sign(),
        numeroCaixa: 1
      },

      Emitente: {
        CNPJ: this.nota.getEmitente().getRegistroNacional(),
        // xNome: this.nota.getEmitente().getNome(),
        // xFant: this.nota.getEmitente().getNome(),
        IE: this.nota.getEmitente().getInscricaoEstadual(),
        indRatISSQN: "",
        IM: "",
        cRegTrib: this.nota.getEmitente().getCodigoRegimeTributario(),

      },
      Destinatario: {},
      Total: {
        vICMS: this.nota.getImpostos().getValorDoIcms(),
        vProd: this.nota.getValorTotalDosProdutos(),
        vDesc: this.nota.getDesconto(),
        vPIS: this.nota.getImpostos().getValorDoPis().valor || 0,
        vCOFINS: this.nota.getImpostos().getValorDaCofins().valor || 0,
        vPISST: 0, // ver pis ST
        vCOFINSST: 0, //ver confis ST
        vOutro: this.nota.getOutrasDespesas(),
        vCFe: this.nota.getValorTotalDaNota(),
        vCFeLei12741: imposto.valor ,
        vBC: this.nota.getImpostos().getBaseDeCalculoDoIcms(),
        vISS: 0,
        vAcresSubtot:0,
        vDescSubtot:0,
        vTroco:0
      },
      DadosAdicionais: {
        infCpl: ""
        // pgtoavista +';'+ infoAdic+ '
      }
    };

    if (this.permiteNfe) {
      Geraini.Destinatario = {
          CNPJCPF: this.nota.getDestinatario().getRegistroNacional(),
          xNome: this.nota.getDestinatario().getNome(),
    }
  };


    const pagtos = this.nota.getPagamento();
    if (pagtos.length) {
    for (let i = 0; i < pagtos.length; i++) {
      console.log (pagtos[i])
      Geraini["Pagto" + zeroEsq(i + 1, 3, 0)] = {
        cMP: "01",
        vMP: pagtos[i].getValor(),
        cAdmC: ""
      };
    }
  }
  else {
    Geraini["Pagto001"] = {
      cMP: "01",
      vMP: this.nota.getValorTotalDosProdutos(),
      cAdmC: ""
    }
  }

    const itens = this.nota.getItens();
    for (let i = 0; i < itens.length; i++) {
      Geraini["Produto" + zeroEsq(i + 1, 3, 0)] = {
        cProd: itens[i].getCodigo(),
        infAdProd: "", // ** TODO: criar campo
//          cEAN: itens[i].getCodigoDeBarras(),
        xProd: itens[i].getDescricao(),
        NCM: itens[i].getNcmSh(),
        CEST: "",
        CFOP: itens[i].getIcms().getCfop(),
        uCom: itens[i].getUnidade(),
        Combustivel: 0,
        qCom: itens[i].getQuantidade(),
        vUnCom: itens[i].getValorUnitario(),
        vProd: itens[i].getValorTotal(),
        indRegra: "A",
        vDesc: 0,
        vOutro: 0,
        vItem12741: (itens[i].getTributoAproximadoFederal()+
        itens[i].getTributoAproximadoEstadual()+
        itens[i].getTributoAproximadoMunicipal()).toFixed(2), // ** TODO: pegar o valor dos tributos.
        vItem: itens[i].getValorUnitario(),
        vRatDesc:0,
        vRatAcr:0
      };

      Geraini["ICMS" + zeroEsq(i + 1, 3, 0)] = {
        orig: itens[i].getIcms().getOrigem(),
        CST:  
           this.nota.getEmitente().getCodigoRegimeTributario() === "1"
             ? ""
            : itens[i].getIcms().getSituacaoTributaria(),
        CSOSN:
          this.nota.getEmitente().getCodigoRegimeTributario() === "1"
            ? itens[i].getIcms().getSituacaoTributaria()
            : "",
        pICMS: itens[i].getIcms().getAliquotaDoIcms(),
        //vICMS: itens[i].getIcms().getValorDoIcms()
      };



      Geraini["PIS" + zeroEsq(i + 1, 3, 0)] = {
        CST: itens[i].getCstDoPis(),
        vBC: itens[i].getBaseDeCalculoDoPis(),
        pPIS: itens[i].getPercentualDoPis()/100,
        //vPIS: itens[i].getValorDoPis(),
        qBCProd:"",
        vAliqProd:""
      };



      Geraini["COFINS" + zeroEsq(i + 1, 3, 0)] = {
        CST: itens[i].getCstDaCofins(),
        vBC: itens[i].getBaseDeCalculoDaCofins(),
        pCOFINS: itens[i].getPercentualDaCofins()/100,
        //vCOFINS: itens[i].getValorDaCofins(),
        qBCProd:"",
        vAliqProd:""

      };
    }

    // grava o arquivo ini
    console.log(Geraini)
    const textoini: string = ini.stringify(Geraini);

    let cupomsat = textoini.replace('"','').replace('"','') 
    let arq = 'Arqs\\SAT\\Vendas\\18477591000158\\202103\\AD35210318477591000158590005782210000090809392.xml';

    this.comunicaSat("Inicializar").then(result => {
       console.log(new Date() +" iniciou "  )
       console.log(result)

      return this.comunicaSat(`CriarEnviarCFe(${cupomsat})`)

      }).then(result => {
        let arq = result.ENVIO.Arquivo;
        dados.NOTA = arq.slice( -17,-11);
        dados.MODELO = "59";
        dados.PROTOCOLO = result.ENVIO.NumeroSessao;
        dados.CHAVE = arq.slice( -48,-4);
        dados.SERIE = null,
        console.log("antes de gravar a nota")
        this.caixaService
        .gravaNfe(dados, this.tributos, itensx, this.transito.TRANSITO)
        .subscribe(resposta => {
          console.log(resposta);
          this.comunicaSat(`ImprimirExtratoVenda(${configSat.folder+arq.split("\\").join("\\\\")})`).then(result => {
            console.log(result)
            return this.comunicaSat("Desinicializar")
            //GerarImpressaoFiscalMFe
          }).then(result => {
            console.log("desinicializou")
            alert("cupom emitido com sucesso");
            this.dialogRef.close(this.transito);
          })
        }, error => { alert("erros no processo, cupom cancelado"); return this.comunicaSat(`CancelarCFe(${configSat.folder+arq.split("\\").join("\\\\")})`)})})
      .catch(error => {
        alert(Object.keys(error))
      })
    // const socketClient = net.connect(
    //   { host: "localhost", port: 3434 },
    //   () => {
    //     console.log("executa comando");
    //     socketClient.write(
    //       `SAT.CriarEnviarCFe("${xxx}")\r\n.\r\n`
    //     );
    //     socketClient.on("data", data => {
    //       console.log(data.toString());
    //       this.leituraRetornoSAT(dados,itensx, data.toString());
    //     });

    // });
  }
  leituraRetornoSAT = function (dados, itens, res) {
    console.log("chamou leitura retorno");

    const nota = this.nota.getNumero();
    const retorno = ini.parse(res);

    console.log(retorno);


    if (retorno.ERRO) {
      alert(retorno.ERRO);
    }
    if (retorno.Resultado) {
      console.log(retorno)
    }
    else if (retorno.Retorno) {
      if (retorno.Retorno.XMotivo === "Autorizado o uso da NF-e") {
        this.caixaService
        .gravaNfe(dados, this.tributos, itens, this.transito.TRANSITO)
        .subscribe(resposta => {
          console.log(resposta);
        }).th

      } else {
        alert(retorno.RETORNO.XMotivo);
      }
    }
    console.log(retorno);
    // });
  };
  //  myPromise = new Promise(function(myResolve, myReject) {
  //   // "Producing Code" (May take some time)
    
  //     myResolve(); // when successful
  //     myReject();  // when error
  //   });

  
  imprimeCFe() {

    let caminhopasta = "D:\\ACBrMonitorPLUS\\";

    const socketClient = net.connect(
      
      { host: "localhost", port: 3434 },
      () => {
        console.log("executa comando");
        socketClient.write( `SAT.CancelarCFe(${caminhopasta}Arqs\\SAT\\Vendas\\18477591000158\\202103\\AD35210318477591000158590005782210000247465389.xml)\r\n.\r\n`
        //  `SAT.GerarImpressaoFiscalMFe("D:\\ACBrMonitorPLUS\\Arqs\\SAT\\Vendas\\18477591000158\\202102\\AD35210218477591000158590005782210000035742903.xml")\r\n.\r\n`
        );
        socketClient.on("data", data => {
          console.log(data.toString());
          this.leituraRetorno(data.toString());
        });
      }
    );



  }







  enviaNFe() {
    this.caixaService.getNumNota(this.empresa).subscribe(numNota => {
      console.log("numNota", numNota);
      this.danfe.comNumero(numNota);

      if (this.danfe.getImpostos().getValorDoIcms() > 0) {
        this.tributos.push({
          CODIGO: null,
          CODDEC: null,
          EMPRESA: this.empresa,
          CODPARC: this.venda.CODCLI,
          LCTO: this.venda.LCTO,
          TIPOLCTO: "V",
          DOCUMENTO: this.transito.toString(),
          DATAEMISSAO: this.venda.DATA,
          DATAVCTO: this.venda.DATA,
          DATALIQUID: this.venda.DATA,
          DEBITO: this.contasEmpresas[this.empresa].ICMSVENDA,
          CREDITO: this.contasEmpresas[this.empresa].ICMSRECOLHER,
          VALOR: this.danfe.getImpostos().getValorDoIcms(),
          PROJECAO: 0,
          OBS: "",
          PERMITEAPAGA: null,
          TIPOOPERACAO: 12,
          TRAVACREDITO: null
        });
      }
      const dados = {
        EMPRESA: this.empresa, // EMPRESA
        NOTA: this.danfe.getNumero(), // NOTA
        DATA: dataFirebird(this.danfe.getDataDaEmissao()), // DATA
        CODCLI: this.danfe.getDestinatario().getCodigo(), // CODCLI
        DT_EMISSAO: dataFirebird(this.danfe.getDataDaEmissao()), // DT_EMISSAO
        DT_FISCAL: dataFirebird(this.danfe.getDataDaEmissao()), // DT_FISCAL
        ESPECIE: 1, // ESPECIE
        DESPACES: this.danfe.getOutrasDespesas(), // DESPACES
        DESCONTO: this.danfe.getDesconto(), // DESCONTO
        CODIGODEBARRAS: "", // CODIGODEBARRAS  -  TODO
        FRETENOTA: this.danfe.getValorDoFrete(), // FRETENOTA
        FRETEFOB: 0, // FRETEFOB
        VPROD: this.danfe.getValorTotalDosProdutos(), // VPROD
        BCICMS: this.danfe.getImpostos().getBaseDeCalculoDoIcms(), // BCICMS
        VICMS: this.danfe.getImpostos().getValorDoIcms(), // VICMS
        

        // *****
        VICMSST: this.danfe.getImpostos().getValorDoIcmsSt(), // VICMSST
        BCICMSST: this.danfe.getImpostos().getBaseDeCalculoDoIcmsSt(), // BCICMSST
        VNF: this.danfe.getValorTotalDaNota(), // VNF
        UF: this.danfe
          .getDestinatario()
          .getEndereco()
          .getUf(), // UF
        CHAVE: this.danfe.getChaveDeAcesso(), // CHAVE
        TOMADORFRETE: this.danfe.getCodigoModalidadeDoFrete(), // TOMADORFRETE
        MODELO: "55", // MODELO
        SERIE: this.danfe.getSerie(), // SERIE
        CODPARC: this.danfe.getDestinatario().getCodigo(), // CODPARC
        PROTOCOLO: this.danfe.getProtocolo().getCodigo(), // PROTOCOLO
        PROTOCOLOCANCELA: "", // PROTOCOLOCANCELA
        VPIS: this.danfe.getImpostos().getValorDoIcms(), // VPIS
        VCOFINS: this.danfe.getImpostos().getValorDaCofins().valor // VCOFINS
      };
      const itens = [];
      for (const item of this.danfe.getItens()) {
        // insert into PRODSAIDA (VBCICMS,PICMSST,VBCICMSST,VICMS,VICMSST,PICMS,CFOP,NCM,ORIG,CEST,SITTRIB)
        itens.push({
          CODPRODVENDA: item.getCodProdVenda(), // CODPRODVENDA
          VBCICMS: item.getIcms().getBaseDeCalculoDoIcms() || "null", // VBCICMS
          PICMSST: item.getIcms().getAliquotaDoIcmsSt() || "null", // PICMSST
          VBCICMSST: item.getIcms().getBaseDeCalculoDoIcmsSt() || "null", // VBCICMSST
          VICMS: item.getIcms().getValorDoIcms() || "null", // VICMS
          VICMSST: item.getIcms().getValorDoIcmsSt() || "null", // VICMSST
          PICMS: item.getIcms().getAliquotaDoIcms() || "null", // PICMS
          CFOP: item.getIcms().getCfop(), // CFOP
          NCM: item.getNcmSh(), // NCM
          ORIG: item.getIcms().getOrigem(), // ORIG
          CEST: item.getCodigoCest() || "null", // CEST
          SITTRIB: item.getIcms().getSituacaoTributaria(), // SITTRIB
          PPIS: item.getPercentualDoPis(), //PPIS
          CSTPIS: item.getCstDoPis(), //CSTPIS
          VPIS: item.getValorDoPis(), //VPIS
          PCOFINS: item.getPercentualDaCofins(), //PPIS
          CSTCOFINS: item.getCstDaCofins(), //CSTPIS
          VCOFINS: item.getValorDaCofins() //VPIS
        });
      }
      console.log("gravaNfe");
      console.log(dados);
      console.log(itens);
      console.log(this.transito);
      this.caixaService
        .gravaNfe(dados, this.tributos, itens, this.transito.TRANSITO)
        .subscribe(resposta => {
          console.log(resposta);
          const Geraini = {
            infNFe: {
              versao: "4.0"
            },
            Identificacao: {
              cNF: "",
              natOp: this.nota.getNaturezaDaOperacao(),
              indPag: "",
              mod: "55",
              serie: this.nota.getSerie(),
              nNF: this.nota.getNumero(),
              dhEmi: this.nota.getDataDaEmissaoFormatada(),
              dhSaiEnt: "",
              tpNF: this.nota.getTipoFormatado(),
              idDest:
                this.nota
                  .getEmitente()
                  .getEndereco()
                  .getUf() ===
                  this.nota
                    .getDestinatario()
                    .getEndereco()
                    .getUf()
                  ? "1"
                  : "2",
              tpImp: "1", // 1=DANFE normal, Retrato;
              tpEmis: "1", // normal
              finNFe: this.nota.getCodigoFinalidade(),
              indFinal: "1", // consumidor final
              indPres: "1", // presente no local
              procEmi: "0", // 0 - emissão de NF-e com aplicativo do contribuinte;
              verProc: "1.0.0",
              dhCont: "",
              xJust: ""
            },
            Volume001: {
              qVol: this.nota.getVolumes().getQuantidade(),
              esp: this.nota.getVolumes().getEspecie(),
              Marca: this.nota.getVolumes().getMarca(),
              nVol: this.nota.getVolumes().getNumeracao(),
              pesoL: this.nota.getVolumes().getPesoLiquido(),
              pesoB: this.nota.getVolumes().getPesoBruto()
            },
            Transportador: {
              modFrete: this.nota.getCodigoModalidadeDoFrete(),
              CNPJCPF: this.nota.getTransportador().getRegistroNacional(),
              xNome: this.nota.getTransportador().getNome(),
              IE: this.nota.getTransportador().getInscricaoEstadual(),
              xEnder: this.nota
                .getTransportador()
                .getEndereco()
                .getLogradouro(),
              xMun: this.nota
                .getTransportador()
                .getEndereco()
                .getMunicipio(),
              UF: this.nota
                .getTransportador()
                .getEndereco()
                .getUf(),
              vServ: "",
              vBCRet: "",
              pICMSRet: "",
              vICMSRet: "",
              CFOP: "",
              cMunFG: "",
              Placa: "",
              UFPlaca: "",
              RNTC: "",
              vagao: "",
              balsa: ""
            },
            Emitente: {
              CNPJCPF: this.nota.getEmitente().getRegistroNacional(),
              xNome: this.nota.getEmitente().getNome(),
              xFant: this.nota.getEmitente().getNome(),
              IE: this.nota.getEmitente().getInscricaoEstadual(),
              IEST: "",
              IM: "",
              CNAE: "",
              CRT: this.nota.getEmitente().getCodigoRegimeTributario(),
              xLgr: this.nota
                .getEmitente()
                .getEndereco()
                .getLogradouro(),
              nro: this.nota
                .getEmitente()
                .getEndereco()
                .getNumero(),
              xCpl: this.nota
                .getEmitente()
                .getEndereco()
                .getComplemento(),
              xBairro: this.nota
                .getEmitente()
                .getEndereco()
                .getBairro(),
              cMun: this.nota
                .getEmitente()
                .getEndereco()
                .getCodMunicipio(),
              xMun: this.nota
                .getEmitente()
                .getEndereco()
                .getMunicipio(),
              UF: this.nota
                .getEmitente()
                .getEndereco()
                .getUf(),
              CEP: this.nota
                .getEmitente()
                .getEndereco()
                .getCep(),
              cPais: this.nota
                .getEmitente()
                .getEndereco()
                .getCodPais(),
              xPais: this.nota
                .getEmitente()
                .getEndereco()
                .getPais(),
              Fone: this.nota.getEmitente().getTelefone(),
              cUF: this.nota
                .getEmitente()
                .getEndereco()
                .getUf(),
              cMunFG: ""
            },
            Destinatario: {
              idEstrangeiro: "",
              CNPJCPF: this.nota.getDestinatario().getRegistroNacional(),
              xNome: this.nota.getDestinatario().getNome(),
              indIEDest: this.nota
                .getDestinatario()
                .getIdenfificaContribuinteIcms(),
              IE: this.nota.getDestinatario().getInscricaoEstadual(),
              ISUF: "",
              Email: this.nota.getDestinatario().getEmail(),
              xLgr: this.nota
                .getDestinatario()
                .getEndereco()
                .getLogradouro(),
              nro: this.nota
                .getDestinatario()
                .getEndereco()
                .getNumero(),
              xCpl: this.nota
                .getDestinatario()
                .getEndereco()
                .getComplemento(),
              xBairro: this.nota
                .getDestinatario()
                .getEndereco()
                .getBairro(),
              cMun: this.nota
                .getDestinatario()
                .getEndereco()
                .getCodMunicipio(),
              xMun: this.nota
                .getDestinatario()
                .getEndereco()
                .getMunicipio(),
              UF: this.nota
                .getDestinatario()
                .getEndereco()
                .getUf(),
              CEP: this.nota
                .getDestinatario()
                .getEndereco()
                .getCep(),
              cPais: this.nota
                .getDestinatario()
                .getEndereco()
                .getCodPais(),
              xPais: this.nota
                .getDestinatario()
                .getEndereco()
                .getPais(),
              Fone: this.nota.getDestinatario().getTelefone()
            },
            Total: {
              vBC: this.nota.getImpostos().getBaseDeCalculoDoIcms(),
              vICMS: this.nota.getImpostos().getValorDoIcms(),
              vICMSDeson: "",
              vBCST: this.nota.getImpostos().getBaseDeCalculoDoIcmsSt(),
              vST: this.nota.getImpostos().getValorDoIcmsSt(),
              vProd: this.nota.getValorTotalDosProdutos(),
              vFrete: this.nota.getValorDoFrete(),
              vSeg: this.nota.getValorDoSeguro(),
              vDesc: this.nota.getDesconto(),
              vII: "",
              vIPI: "",
              vIPIDevol: this.nota.getValorTotalDoIpiDevol().valor || 0,
              vPIS: this.nota.getImpostos().getValorDoPis().valor || 0,
              vCOFINS: this.nota.getImpostos().getValorDaCofins().valor || 0,
              vOutro: this.nota.getOutrasDespesas(),
              vNF: this.nota.getValorTotalDaNota(),
              vICMSUFDest: this.danfe.getItens().reduce(function (a, item) {
                return a.soma(item.getIcms().getValorDoIcmsUFDestino());
              }, new dinheiro(0)).valor,
              vICMSUFRemet:0
            },
            DadosAdicionais: {
              infCpl: this.nota.getInformacoesComplementares()
              // pgtoavista +';'+ infoAdic+ '
            },
            Fatura: {}
          };
          const duplic = this.nota.getDuplicatas();
          for (let i = 0; i < duplic.length; i++) {
            Geraini["Duplicata" + zeroEsq(i + 1, 3, 0)] = {
              nDup: duplic[i].getNumero(),
              dVenc: duplic[i].getVencimentoFormatado(),
              vDup: duplic[i].getValor()
            };
          }
          if (this.nota.getFatura()) {
            Geraini.Fatura = {
              nFat: this.nota.getFatura().getNumero(),
              vOrig: this.nota.getFatura().getValorOriginal(),
              vDesc: this.nota.getFatura().getValorDoDesconto(),
              vLiq: this.nota.getFatura().getValorLiquido()
            };
          }
          const pagtos = this.nota.getPagamento();
          for (let i = 0; i < pagtos.length; i++) {
            Geraini["PAG" + zeroEsq(i + 1, 3, 0)] = {
              tpag: pagtos[i].getCodMeioDePagamento(),
              vPag: pagtos[i].getValor(),
              tpIntegra: pagtos[i].getCodIntegracaoDePagamento(),
              CNPJ: pagtos[i].getCnpjDaCredenciadoraDeCartao(),
              tBand: pagtos[i].getCodBandeiraDoCartao(),
              cAut: pagtos[i].getAutorizacaoDeOperacao(),
              vTroco: pagtos[i].getValorDoTroco()
            };
          }

          const nfRef = this.nota.getNfRef();
          for (let i = 0; i < nfRef.length; i++) {
            Geraini["NFRef" + zeroEsq(i + 1, 3, 0)] = {
              Tipo: "",
              refNFe: nfRef[i].refNFe,
              cUF: "",
              AAMM: "",
              CNPJ: "",
              mod: "",
              Serie: "",
              nNF: nfRef[i].nNF,
              CNPJCPF: "",
              IE: "",
              refCTe: "",
              ModECF: "",
              nECF: "",
              nCOO: ""
            };
          }
          const itens = this.nota.getItens();
          for (let i = 0; i < itens.length; i++) {
            Geraini["Produto" + zeroEsq(i + 1, 3, 0)] = {
              cProd: itens[i].getCodigo(),
              cEAN: itens[i].getCodigoDeBarras(),
              xProd: itens[i].getDescricao(),
              NCM: itens[i].getNcmSh(),
              CEST: "",
              EXTIPI: "",
              CFOP: itens[i].getIcms().getCfop(),
              uCom: itens[i].getUnidade(),
              qCom: itens[i].getQuantidade(),
              vUnCom: itens[i].getValorUnitario(),
              vProd: itens[i].getValorTotal(),
              cEANTrib: itens[i].getCodigoDeBarras(),
              uTrib: itens[i].getUnidade(),
              qTrib: itens[i].getQuantidade(),
              vUnTrib: itens[i].getValorUnitario(),
              vFrete: itens[i].getValorDoFrete(),
              vSeg: "",
              vDesc: "",
              vOutro: "",
              indTot: 1,
              xPed: "",
              nItemPed: "",
              nFCI: "",
              nRECOPI: "",
              pDevol: itens[i].getPorcentagemDoIpiDevolucao(),
              vIPIDevol: itens[i].getValorDoIpiDevolucao(),
              vTotTrib: "",
              infAdProd: ""
            };
            Geraini["ICMS" + zeroEsq(i + 1, 3, 0)] = {
              orig: itens[i].getIcms().getOrigem(),
              CST:
                this.nota.getEmitente().getCodigoRegimeTributario() === "1"
                  ? ""
                  : itens[i].getIcms().getSituacaoTributaria(),
              CSOSN:
                this.nota.getEmitente().getCodigoRegimeTributario() === "1"
                  ? itens[i].getIcms().getSituacaoTributaria()
                  : "",
              modBC: 0,
              pRedBC: 0,
              vBC: itens[i].getIcms().getBaseDeCalculoDoIcms(),
              pICMS: itens[i].getIcms().getAliquotaDoIcms(),
              vICMS: itens[i].getIcms().getValorDoIcms(),
              modBCS: "",
              pMVAST: "",
              pRedBCST: "",
              vBCST: itens[i].getIcms().getBaseDeCalculoDoIcmsSt(),
              pICMSST: itens[i].getIcms().getAliquotaDoIcmsSt(),
              vICMSST: itens[i].getIcms().getValorDoIcmsSt(),
              UFST: "",
              pBCOp: "",
              vBCSTRet: "",
              vICMSSTRet: "",
              motDesICMS: "",
              pCredSN: itens[i].getIcms().getAliquotaCredICMSSN(),
              vCredICMSSN: itens[i].getIcms().getvalorCredICMSSN(),
              vBCSTDest: "",
              vICMSSTDest: "",
              vICMSDeson: "",
              vICMSOp: "",
              pDif: "",
              vICMSDif: ""
            };
            Geraini["ICMSUFDEST" + zeroEsq(i + 1, 3, 0)] = {
              vBCUFDest: itens[i].getIcms().getBaseDeCalculoUFDestino().valor,
              pICMSUFDest: itens[i].getIcms().getAliquotaDoIcmsUFDestino(),
              pICMSInter: itens[i].getIcms().getAliquotaDoIcmsInterna(),
              pICMSInterPart: itens[i].getIcms().getPercentualIcmsUFDestino(),
              vICMSUFDest: itens[i].getIcms().getValorDoIcmsUFDestino().valor,
              vICMSUFRemet: 0,
              // pFCPUFDest: itens[i]
              //   .getIcms()
              //   .getPercentualFundoCombatePobrezaDestino(),
              // vFCPUFDest: itens[i]
              //   .getIcms()
              //   .getValorFundoCombatePobrezaDestino().valor,
              // vBCFCPUFDest: itens[i]
              //   .getIcms()
              //   .getBaseDeCalculoFundoCombatePobrezaDestino().valor
            };
            Geraini["IPI" + zeroEsq(i + 1, 3, 0)] = {
              CST: 51,
              clEnq: "",
              CNPJProd: "",
              cSelo: "",
              qSelo: "",
              cEnq: 999,
              vBC: "",
              qUnid: "",
              vUnid: "",
              pIPI: "",
              vIPI: ""
            };
            Geraini["PIS" + zeroEsq(i + 1, 3, 0)] = {
              CST: "01",
              vBC: itens[i].getIcms().getBaseDeCalculoDoIcms(),
              pPIS: 0.65,
              vPIS: itens[i].getValorDoPis()
            };
            Geraini["COFINS" + zeroEsq(i + 1, 3, 0)] = {
              CST: "01",
              vBC: itens[i].getIcms().getBaseDeCalculoDoIcms(),
              pCOFINS: 3,
              vCOFINS: itens[i].getValorDaCofins()
            };
          }

          // grava o arquivo ini
          const textoini = ini.stringify(Geraini);

          const socketClient = net.connect(
            { host: configSat.host, port: configSat.port},
            () => {
              console.log("executa comando");
              socketClient.write(
                `NFe.CriarEnviarNFe("${textoini}",1,1)\r\n.\r\n`
              );
              socketClient.on("data", data => {
                console.log(data.toString());
                this.leituraRetorno(data.toString());
              });
            }
          );

          // fs.writeFile(
          //   "c:\\geral\\ent.tmp",
          //   "NFe.CriarEnviarNFe(\"\n" + textoini + "\n\",1,1)",
          //   err => {
          //     if (err) {
          //       throw err;
          //     }
          //     console.log("arquivo salvo com sucesso");
          //     fs.rename("c:\\geral\\ent.tmp", "c:\\geral\\ent.txt", err => {
          //       if (err) {
          //         throw err;
          //       }
          //       console.log("arquivo renomeado");
          //     });
          //   }
          // );
          // const watcher = fs.watch(
          //   "c:\\geral",
          //   {
          //     persistent: true
          //   },
          //   (eventType, filename) => {
          //     console.log(filename);
          //     console.log(eventType);
          //     if (filename === "sai.txt" && eventType === "change") {
          //       console.log("fechado watcher");
          //       this.leituraRetorno();
          //       watcher.close();

          //     }
          //   }
          // );
        });
    });
  }
  leituraRetorno = function (res) {
    console.log("chamou leitura retorno");
    // fs.readFile("c:\\geral\\sai.txt", "utf-8", (error, res) => {
    // if (error) {
    //   throw error;
    // }
    const nota = this.nota.getNumero();
    const retorno = ini.parse(res);

    console.log(retorno);


    if (retorno.ERRO) {
      alert(retorno.ERRO);
    }
    if (retorno.Resultado) {
      console.log(retorno)
    }
    else if (retorno.Retorno) {
      if (retorno.Retorno.XMotivo === "Autorizado o uso da NF-e") {
        const protocoloretorno = retorno["NFe" + nota].nProt;
        const chave = retorno["NFe" + nota].chNFe;
        const arquivo = ["NFe" + nota];
        const protocolo = new Protocolo();
        protocolo.comCodigo(protocoloretorno);
        protocolo.comData(new Date());
        this.nota.comProtocolo(protocolo);
        this.nota.comChaveDeAcesso(chave);
        const data = {
          EMPRESA: this.empresa, // EMPRESA
          NOTA: this.danfe.getNumero(), // NOTA
          CHAVE: this.danfe.getChaveDeAcesso(), // CHAVE
          PROTOCOLO: this.danfe.getProtocolo().getCodigo(), // PROTOCOLO
          PROTOCOLOCANCELA: "" // PROTOCOLOCANCELA
        };
        this.caixaService.gravaProtocolo(data).subscribe(res => {
          console.log(res);
          this.dialogRef.close(this.transito);
        });
        // fs.writeFile("c:\\geral\\sai.txt", "", err => {
        //   if (err) {
        //     throw err;
        //   }
        //   console.log("arquivo limpo");
        // });
      } else {
        alert(retorno.RETORNO.XMotivo);
      }
    }
    console.log(retorno);
    // });
  };
}
