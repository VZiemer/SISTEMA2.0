import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { MatTableDataSource } from "@angular/material/table";
import { SelectionModel } from "@angular/cdk/collections";
import { Observable } from "rxjs";
import { Venda } from "../../shared/models/venda";
import { CaixaService } from "../../caixa/caixa.service";
import * as dinheiro from "../../shared/models/dinheiro";
import * as nfe from "node-nfe";

import { ElectronService } from "../../core/services/electron/electron.service";

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
  emitente = new Emitente();
  destinatario = new Destinatario();
  transportador = new Transportador();
  volumes = new Volumes();
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
    '');
  novaNota = "";
  operacao: Number;
  tabSelect = 0;
  nota = new NFe();
  busca = {
    codigo: "",
    razao: ""
  };
  titulo: string;

  // displayedColumns: string[] = ['select', 'LCTO', 'NOMECLI', 'TOTAL'];
  // dataSource = new MatTableDataSource<any>(this.venda);
  // selection = new SelectionModel<any>(false, []);

  constructor(
    public dialogRef: MatDialogRef<ModalNfeComponent>,
    private caixaService: CaixaService,
    @Inject(MAT_DIALOG_DATA) public data: Venda
  ) {
    // this.venda = data;
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
  zeroEsq(valor, comprimento, digito) {
    const length = comprimento - valor.toString().length + 1;
    return Array(length).join(digito || "0") + valor;
  }

  ngOnInit() {}

  carregaVenda(novaNota) {
    this.caixaService.getVenda(novaNota).subscribe(
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

  geraNfe(empresa, venda): Observable<any> {
    console.log("dados remetente");
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
            .comIcmsSimples(dadosEmpresa.ICMS_SIMPLES)
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
          this.destinatario
            .comNome(venda.RAZAO)
            .comCodigo(venda.CODCLI)
            .comRegistroNacional(venda.CGC)
            .comInscricaoEstadual(venda.INSC)
            .comTelefone(venda.FONE)
            .comEmail(venda.EMAIL)
            .comEndereco(
              new Endereco()
                .comLogradouro(venda.ENDERECO)
                .comNumero(venda.NUMERO)
                .comComplemento(venda.COMPLEMENTO)
                .comCep(venda.CEP)
                .comBairro(venda.BAIRRO)
                .comMunicipio(venda.CIDADE)
                .comCidade(venda.CIDADE)
                .comUf(venda.ESTADO)
                .comCodMunicipio(venda.CODIBGE)
            );
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
          let _vlFat = new dinheiro(0);
          console.log("entrou no ifpag");
          if (venda.operacao !== 3 && venda.operacao !== 4) {
            console.log("entrou no inserepag");

            for (const item of venda.PAGAMENTO) {
              console.log(item);
              let _formaPagto = "",
                _meioPagto = "",
                _integracaoPagto = "",
                _bandeiraCartao = "",
                _valorTroco = 0;
              if (item.tipo === "BL") {
                _vlFat.soma(item.valor);
                (_formaPagto = "Á Prazo"),
                  (_meioPagto = "Boleto Bancário"),
                  (_integracaoPagto = "Não Integrado"),
                  _numDuplicata++;
                const duplicata = new Duplicata();
                duplicata
                  .comNumero(this.zeroEsq(_numDuplicata, 3, 0))
                  .comValor(item.valor.valor)
                  .comVencimento(item.vencimento);
                this.danfe._duplicatas.push(duplicata);
              } else if (item.tipo === "CC") {
                (_formaPagto = "Á Prazo"),
                  (_meioPagto = "Cartão de Crédito"),
                  (_integracaoPagto = "Não Integrado"),
                  (_bandeiraCartao = "Visa");
              } else if (item.tipo === "CM") {
                (_formaPagto = "Á Prazo"),
                  (_meioPagto = "Cartão de Crédito"),
                  (_integracaoPagto = "Não Integrado"),
                  (_bandeiraCartao = "Mastercard");
              } else if (item.tipo === "DA") {
                (_formaPagto = "Á Vista"),
                  (_meioPagto = "Cartão de Débito"),
                  (_integracaoPagto = "Não Integrado"),
                  (_bandeiraCartao = "Visa");
              } else if (item.tipo === "DM") {
                (_formaPagto = "Á Vista"),
                  (_meioPagto = "Cartão de Débito"),
                  (_integracaoPagto = "Não Integrado"),
                  (_bandeiraCartao = "Mastercard");
              } else if (item.tipo === "CH") {
                (_formaPagto = "Á Vista"),
                  (_meioPagto = "Cheque"),
                  (_integracaoPagto = "Não Integrado");
              } else {
                // se nenhum atender considerar Dinheiro
                (_formaPagto = "Á Vista"),
                  (_meioPagto = "Dinheiro"),
                  (_integracaoPagto = "Não Integrado");
              }
              const pagamento = new Pagamento();
              pagamento
                .comFormaDePagamento(_formaPagto)
                .comValor(item.valor)
                .comMeioDePagamento(_meioPagto)
                .comIntegracaoDePagamento(_integracaoPagto)
                .comBandeiraDoCartao(_bandeiraCartao ? _bandeiraCartao : "")
                .comValorDoTroco(_valorTroco)
                .comVencimento(item.vencimento);
              this.danfe._pagamentos.push(pagamento);
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
              .comVencimento("");
            this.danfe._pagamentos.push(pagamento);
          }

          for (const item of venda.PRODUTOS) {
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
            this.danfe.adicionarItem(
              new Item()
                .comCodigo(item.CODPROFISCAL)
                .comDescricao(item.DESCRICAO)
                .comNcmSh(item.NCM)
                .comIcms(icms)
                // .comOCst('020')
                // .comCfop('6101')
                .comUnidade(item.UNIDADE)
                .comQuantidade(item.QTDFISCAL)
                .comValorUnitario(item.VALORUNITFISCAL)
                .comValorDoFrete(item.FRETEPROD)
                .comValorDoIpiDevolucao(
                  venda.operacao === 3
                    ? (item.ALIQIPI / 100) * item.BASECALC
                    : 0
                )
            );
          }

          console.log("emitente", this.emitente);
          observable.next(this.danfe);
          observable.complete();
        },
        error => console.log("deu merda", error)
      );
    });
  }

  criaNf(venda): Promise<Venda> {
    console.log("crianf");
    return new Promise((resolve, reject) => {
      // this.danfe = new NFe();
      // let tipoFrete = "";
      // switch (this.venda.TRANSPORTE.TIPOFRETE) {
      //   case "0":
      //     tipoFrete = "porContaDoEmitente";
      //     break;
      //   case "1":
      //     tipoFrete = "porContaDoDestinatarioRemetente";
      //     break;
      //   case "2":
      //     tipoFrete = "porContaDeTerceiros";
      //     break;
      //   case "3":
      //     tipoFrete = "porContaProprioRemetente";
      //     break;
      //   case "4":
      //     tipoFrete = "porContaProprioDestinatario";
      //     break;
      //   default:
      //     tipoFrete = "semFrete";
      // }
      // this.danfe.comEmitente(this.emitente);
      // this.danfe.comDestinatario(this.destinatario);
      // this.danfe.comTransportador(this.transportador);
      // this.danfe.comVolumes(this.volumes);
      // this.danfe.comTipo("saida");
      // this.danfe.comFinalidade("normal");
      // let naturezaOperacao = "VENDA DE MERCADORIA NO ESTADO";
      // if (this.operacao === 2) {
      //   naturezaOperacao = "VENDA DE ATIVO";
      // }
      // if (
      //   this.operacao === 3 &&
      //   this.danfe
      //     .getDestinatario()
      //     .getEndereco()
      //     .getUf() !==
      //     this.danfe
      //       .getEmitente()
      //       .getEndereco()
      //       .getUf()
      // ) {
      //   naturezaOperacao = " Devolução de venda de mercadoria fora do estado";
      //   this.danfe.comFinalidade("devolução");
      // }
      // if (this.operacao === 4) {
      //   naturezaOperacao = "REMESSA DE MERCADORIA OU BEM PARA REPARO";
      // }
      // if (
      //   this.operacao === 5 &&
      //   this.danfe
      //     .getDestinatario()
      //     .getEndereco()
      //     .getUf() !==
      //     this.danfe
      //       .getEmitente()
      //       .getEndereco()
      //       .getUf()
      // ) {
      //   naturezaOperacao = " AMOSTRA GRÁTIS";
      // }
      // if (
      //   this.operacao === 6 &&
      //   this.danfe
      //     .getDestinatario()
      //     .getEndereco()
      //     .getUf() !==
      //     this.danfe
      //       .getEmitente()
      //       .getEndereco()
      //       .getUf()
      // ) {
      //   naturezaOperacao =
      //     "Retorno de bem recebido por conta de contrato de comodato";
      //   this.danfe.comFinalidade("devolução");
      // }
      // if (
      //   this.operacao === 1 &&
      //   this.danfe
      //     .getDestinatario()
      //     .getEndereco()
      //     .getUf() !==
      //     this.danfe
      //       .getEmitente()
      //       .getEndereco()
      //       .getUf()
      // ) {
      //   naturezaOperacao = "VENDA DE MERCADORIA FORA DO ESTADO";
      // }
      // this.danfe.comNaturezaDaOperacao(naturezaOperacao);
      // this.danfe.comSerie("001");
      // this.danfe.comDataDaEmissao(new Date());
      // this.danfe.comDataDaEntradaOuSaida(new Date());
      // this.danfe.comModalidadeDoFrete(tipoFrete);
      resolve(venda);
    });
  }

  pagamentosNota(venda): Promise<Venda> {
    // console.log("com pagamento");
    // let _numDuplicata = 0;
    // let _vlFat = new dinheiro(0);
    return new Promise((resolve, reject) => {
      // console.log("entrou no ifpag");
      // if (venda.operacao !== 3 && venda.operacao !== 4) {
      //   console.log("entrou no inserepag");

      //   for (const item of venda.PAGAMENTO) {
      //     console.log(item);
      //     let _formaPagto = "",
      //       _meioPagto = "",
      //       _integracaoPagto = "",
      //       _bandeiraCartao = "",
      //       _valorTroco = 0;
      //     if (item.tipo === "BL") {
      //       _vlFat.soma(item.valor);
      //       (_formaPagto = "Á Prazo"),
      //         (_meioPagto = "Boleto Bancário"),
      //         (_integracaoPagto = "Não Integrado"),
      //         _numDuplicata++;
      //       const duplicata = new Duplicata();
      //       duplicata
      //         .comNumero(this.zeroEsq(_numDuplicata, 3, 0))
      //         .comValor(item.valor.valor)
      //         .comVencimento(item.vencimento);
      //       this.danfe._duplicatas.push(duplicata);
      //     } else if (item.tipo === "CC") {
      //       (_formaPagto = "Á Prazo"),
      //         (_meioPagto = "Cartão de Crédito"),
      //         (_integracaoPagto = "Não Integrado"),
      //         (_bandeiraCartao = "Visa");
      //     } else if (item.tipo === "CM") {
      //       (_formaPagto = "Á Prazo"),
      //         (_meioPagto = "Cartão de Crédito"),
      //         (_integracaoPagto = "Não Integrado"),
      //         (_bandeiraCartao = "Mastercard");
      //     } else if (item.tipo === "DA") {
      //       (_formaPagto = "Á Vista"),
      //         (_meioPagto = "Cartão de Débito"),
      //         (_integracaoPagto = "Não Integrado"),
      //         (_bandeiraCartao = "Visa");
      //     } else if (item.tipo === "DM") {
      //       (_formaPagto = "Á Vista"),
      //         (_meioPagto = "Cartão de Débito"),
      //         (_integracaoPagto = "Não Integrado"),
      //         (_bandeiraCartao = "Mastercard");
      //     } else if (item.tipo === "CH") {
      //       (_formaPagto = "Á Vista"),
      //         (_meioPagto = "Cheque"),
      //         (_integracaoPagto = "Não Integrado");
      //     } else {
      //       // se nenhum atender considerar Dinheiro
      //       (_formaPagto = "Á Vista"),
      //         (_meioPagto = "Dinheiro"),
      //         (_integracaoPagto = "Não Integrado");
      //     }
      //     const pagamento = new Pagamento();
      //     pagamento
      //       .comFormaDePagamento(_formaPagto)
      //       .comValor(item.valor)
      //       .comMeioDePagamento(_meioPagto)
      //       .comIntegracaoDePagamento(_integracaoPagto)
      //       .comBandeiraDoCartao(_bandeiraCartao ? _bandeiraCartao : "")
      //       .comValorDoTroco(_valorTroco)
      //       .comVencimento(item.vencimento);
      //     this.danfe._pagamentos.push(pagamento);
      //   }
      //   if (_vlFat.valor) {
      //     const fatura = new Fatura();
      //     fatura
      //       .comNumero("0001")
      //       .comValorOriginal(_vlFat.valor + 0.01)
      //       .comValorDoDesconto(0.01)
      //       .comValorLiquido(_vlFat.valor);
      //     this.danfe.comFatura(fatura);
      //   }
      // } else {
      //   const pagamento = new Pagamento();
      //   pagamento
      //     .comFormaDePagamento("Á Vista")
      //     .comMeioDePagamento("Sem Pagamento")
      //     .comValor("")
      //     .comIntegracaoDePagamento("Não Integrado")
      //     .comBandeiraDoCartao("")
      //     .comValorDoTroco("")
      //     .comVencimento("");
      //   this.danfe._pagamentos.push(pagamento);
      // }
      resolve(venda);
    });
  }

  itensNota(venda): Promise<Venda> {
    console.log("itensnota");
    return new Promise((resolve, reject) => {
      // for (const item of venda.PRODUTOS) {
      //   console.log(item);
      //   const prodst = item.SITTRIB === "060" ? true : false;
      //   const icms = new Icms().CalculaIcms(
      //     prodst,
      //     this.danfe.getEmitente().getCodigoRegimeTributario(),
      //     this.danfe
      //       .getEmitente()
      //       .getEndereco()
      //       .getUf(),
      //     this.danfe
      //       .getDestinatario()
      //       .getEndereco()
      //       .getUf(),
      //     this.danfe.getDestinatario().getIdenfificaContribuinteIcms(),
      //     1,
      //     item.BASECALC,
      //     item.ALIQ,
      //     item.ORIG,
      //     venda.operacao,
      //     this.danfe.getEmitente().getIcmsSimples()
      //   );
      //   this.danfe.adicionarItem(
      //     new Item()
      //       .comCodigo(item.CODPROFISCAL)
      //       .comDescricao(item.DESCRICAO)
      //       .comNcmSh(item.NCM)
      //       .comIcms(icms)
      //       // .comOCst('020')
      //       // .comCfop('6101')
      //       .comUnidade(item.UNIDADE)
      //       .comQuantidade(item.QTDFISCAL)
      //       .comValorUnitario(item.VALORUNITFISCAL)
      //       .comValorDoFrete(item.FRETEPROD)
      //       .comValorDoIpiDevolucao(
      //         venda.operacao === 3 ? (item.ALIQIPI / 100) * item.BASECALC : 0
      //       )
      //   );
      // }
      resolve(venda);
    });
  }

  totalizadorNfe(venda): Promise<Venda> {
    console.log("totalizador" + venda);
    return new Promise((resolve, reject) => {
      const impostos = new Impostos();
      impostos.comBaseDeCalculoDoIcms(
        this.danfe.getItens().reduce(function(a, item) {
          return a.soma(item.getIcms().getBaseDeCalculoDoIcms());
        }, new dinheiro(0))
      );
      impostos.comValorDoIcms(
        this.danfe.getItens().reduce(function(a, item) {
          return a.soma(item.getIcms().getValorDoIcms());
        }, new dinheiro(0))
      );
      impostos.comBaseDeCalculoDoIcmsSt(
        this.danfe.getItens().reduce(function(a, item) {
          return a.soma(item.getIcms().getBaseDeCalculoDoIcmsSt());
        }, new dinheiro(0))
      );
      impostos.comValorDoIcmsSt(
        this.danfe.getItens().reduce(function(a, item) {
          return a.soma(item.getIcms().getValorDoIcmsSt());
        }, new dinheiro(0))
      );
      impostos.comValorDoImpostoDeImportacao(0);
      impostos.comValorDoPis(0);
      impostos.comValorTotalDoIpi(0);
      impostos.comValorDaCofins(0);
      impostos.comBaseDeCalculoDoIssqn(0);
      impostos.comValorTotalDoIssqn(0);
      this.danfe.comImpostos(impostos);

      this.danfe.comValorTotalDoIpiDevol(
        this.danfe.getItens().reduce(function(a, item) {
          return a.soma(item.getValorDoIpiDevolucao());
        }, new dinheiro(0))
      );
      this.danfe.comValorTotalDaNota(
        this.danfe.getValorTotalDoIpiDevol().valor +
          this.danfe.getItens().reduce(function(a, item) {
            return a.soma(item.getValorDoFrete()).soma(item.getValorTotal());
          }, new dinheiro(0))
      );
      this.danfe.comValorTotalDosProdutos(
        this.danfe.getItens().reduce(function(a, item) {
          return a.soma(item.getValorTotal());
        }, new dinheiro(0))
      );
      this.danfe.comValorBaseCalculoDoIpiDevol(
        this.danfe.getItens().reduce(function(a, item) {
          if (item.getPorcentagemDoIpiDevolucao()) {
            return a.soma(item.getValorTotal());
          } else {
            return a.soma(0);
          }
        }, new dinheiro(0))
      );
      this.danfe.comValorTotalDoIcmsSn(
        this.danfe.getItens().reduce(function(a, item) {
          return a.soma(item.getIcms().getvalorCredICMSSN());
        }, new dinheiro(0))
      );
      this.danfe.comValorTotalDosServicos(0);
      this.danfe.comValorDoFrete(
        this.danfe.getItens().reduce(function(a, item) {
          return a.soma(item.getValorDoFrete());
        }, new dinheiro(0))
      );
      this.danfe.comValorDoSeguro(0);
      this.danfe.comDesconto(0);
      this.danfe.comOutrasDespesas(0);

      let infoComplementar =
        "Documento emitido por ME ou EPP optante pelo simples nacional;";
      console.log(
        "codregime",
        this.danfe.getEmitente().getCodigoRegimeTributario()
      );
      if (
        this.danfe.getEmitente().getCodigoRegimeTributario() === "1" &&
        venda.operacao == 1
      ) {
        infoComplementar +=
          "Valor dos produtos Tributado pelo Simples Nacional R$" +
          this.danfe.getItens().reduce(function(a, item) {
            return a.soma(item.getValorTotal());
          }, new dinheiro(0)) +
          ";";
        infoComplementar +=
          "Valor dos produtos Substituicao Tributaria " +
          this.danfe.getImpostos().getBaseDeCalculoDoIcmsStFormatada() +
          ";";
        if (
          this.danfe.getDestinatario().getIdenfificaContribuinteIcms() == 1 &&
          venda.operacao == 1
        ) {
          infoComplementar +=
            "PERMITE O APROVEITAMENTO DO CRÉDITO DE ICMS NO VALOR DE R$" +
            this.danfe.getValorTotalDoIcmsSn() +
            "; CORRESPONDENTE À ALÍQUOTA DE " +
            this.danfe.getEmitente().getIcmsSimples() +
            "%, NOS TERMOS DO ARTIGO 23 DA LC 123";
        }
      } else if (
        this.danfe.getEmitente().getCodigoRegimeTributario() === "2" &&
        venda.operacao === 1
      ) {
        infoComplementar +=
          "Estabelecimento impedido de recolher o ICMS pelo simples nacional no inciso 1 do art. 2 da LC 123/2006;";
        infoComplementar +=
          "Imposto recolhido por substituição ART 313-Y DO RICMS;";
        if (venda.operacao === 1) {
          infoComplementar +=
            "Valor dos produtos Tributado pelo Simples Nacional " +
            this.danfe.getImpostos().getBaseDeCalculoDoIcmsFormatada() +
            ";";
          infoComplementar +=
            "Valor dos produtos Substituicao Tributaria " +
            this.danfe.getImpostos().getBaseDeCalculoDoIcmsStFormatada() +
            ";";
        }
      }
      if (venda.operacao === 3) {
        infoComplementar +=
          "Valor da Base de calculo do IPI devolvido R$ " +
          this.danfe.getValorBaseCalculoDoIpiDevol().valor +
          ";";
        infoComplementar +=
          "Valor do IPI Devolvido R$ " +
          this.danfe.getValorTotalDoIpiDevol().valor +
          ";";
      }
      if (venda.operacao === 4) {
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
      resolve(this.danfe);
    });
  }

  geraNota() {
    this.geraNfe(1, this.venda).subscribe(danfe => {
      console.log("danfe", danfe);
      this.nota = danfe;
      this.tabSelect = 1;
    });
  }

  enviaNota(res) {


  }
}
