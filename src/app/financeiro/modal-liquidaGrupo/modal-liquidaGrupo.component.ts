import { Component, OnInit, Inject, ɵConsole } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { FinanceiroService } from '../financeiro.service';
import { Deus } from '../../shared/models/deus';
import { NULL_EXPR } from '@angular/compiler/src/output/output_ast';


@Component({
  selector: 'app-modal-registro-deus',
  templateUrl: './modal-LiquidaGrupo.component.html',
  styleUrls: ['./modal-LiquidaGrupo.component.scss']
})

export class ModalLiquidaGrupoComponent implements OnInit {
  CREDITO: number;
  RegistroDeus: any[] = [];
  dataLiquid: Date;
  hoje: Date;
  total: number;
  totaltaxa: number;
  mostraContasDespesas: number;
  listaContasDespesas: any[] = [];
  dadosDespesaInsert: Deus[] = [];
  DESPESA: number;
  valorDespesa: number;
  dataInicio: Date;
  saldoFinal: number;
  saldoTravaNegativo: number;
  liberaBtnLiquidar: number;
  travaSelectConta: number;
  editaPagamento: number;
  valorParcial: number;
  novoVcto: Date;
  param: number;
  paramAlteraPagto: number;
  conta: string;
  Parceiros: any[];
  ContaCaixa: number;
  camposTabela = ['DOCUMENTO', 'DATAVCTO', 'CODPARC', 'FANTASIA', 'VALOR', 'TARIFA', 'TAXACELD'];
  camposTabelaResumo = ['PARCEIRO', 'BRUTO', 'TARIFA', 'TAXACELD','LIQUIDO'];

  constructor(private financeiroService: FinanceiroService,
    public dialogRef: MatDialogRef<ModalLiquidaGrupoComponent>,
    @Inject(MAT_DIALOG_DATA) public dados: any) {
  }
  contas: any[] = this.dados.listaContas;
  ngOnInit() {

    this.conta = this.dados.conta;
    this.hoje = new Date();
    this.total = 0;
    this.DESPESA = 0;
    this.valorDespesa = 0;
    this.RegistroDeus = [];
    this.hoje = new Date();
    this.travaSelectConta = null;
    this.editaPagamento = null;
    this.param = this.dados.param;


    if (this.param == 5) {
      this.ContaCaixa = this.dados.listaLctoDeus[0].DEBITO;
      this.RegistroDeus = this.dados.listaLctoDeus;
      this.financeiroService.gettaxasVendas(this.RegistroDeus.map(item => item.LCTO)).subscribe(response => {
        console.log('taxasvendas', response)
        let totalTarifaPrevista = response.reduce((acc, item) => acc + item.VALOR * item.TARIFA / 100, 0);
        this.RegistroDeus.map(item => {
          item.PESOTARIFA = response.filter(taxa => taxa.LCTO == item.LCTO).reduce((acc, taxa) => acc + (taxa.TXCELD ? 0 : taxa.VALOR * taxa.TARIFA / 100) / totalTarifaPrevista, 0);
          item.TAXACELD = response.filter(taxa => taxa.LCTO == item.LCTO).reduce((acc, taxa,index,arr) => acc + (taxa.TXCELD / arr.length), 0);
          item.LOJAVENDA = response.filter(taxa => taxa.LCTO == item.LCTO).map(x => x.EMPRESA)[0];
          item.TARIFA = 0;
          item.LIQUIDO = item.VALOR;
        })
        this.Parceiros = this.RegistroDeus.map(item => item.LOJAVENDA).filter((v, i, a) => a.indexOf(v) === i).map(item => ({ 'EMPRESA': item, 'BRUTO': this.RegistroDeus.filter(valor => valor.LOJAVENDA == item).map(valor => valor.VALOR).reduce((a, b) => a + b, 0), 'LIQUIDO': this.RegistroDeus.filter(valor => valor.LOJAVENDA == item).map(valor => (valor.VALOR - valor.TARIFA)).reduce((a, b) => a + b, 0), 'TARIFA': this.RegistroDeus.filter(valor => valor.LOJAVENDA == item).map(valor => valor.TARIFA).reduce((a, b) => a + b, 0), 'TAXACELD': this.RegistroDeus.filter(valor => valor.LOJAVENDA == item).map(valor => valor.TAXACELD).reduce((a, b) => a + b, 0) }));
        console.log('parceiros', this.Parceiros)
        console.log('parceiros', this.Parceiros)
        console.log('tarifaprevista', totalTarifaPrevista)
        console.log('registroDeus', this.RegistroDeus)
        this.total = this.RegistroDeus.map(item => item.VALOR).reduce((ac, vl) => ac + vl, 0)
      })
    }

    if (this.param == 6) {

      this.Parceiros = this.dados.listaLctoDeus.map(item => item.CODPARC).filter((v, i, a) => a.indexOf(v) === i).map(item => ({ 'CODPARC': item, 'BRUTO': this.dados.listaLctoDeus.filter(valor => valor.CODPARC == item).map(valor => valor.VLBRUTO).reduce((a, b) => a + b, 0), 'LIQUIDO': this.dados.listaLctoDeus.filter(valor => valor.CODPARC == item).map(valor => valor.VLLIQUIDO).reduce((a, b) => a + b, 0), 'TARIFA': this.dados.listaLctoDeus.filter(valor => valor.CODPARC == item).map(valor => valor.TARIFA).reduce((a, b) => a + b, 0),'TAXACELD': this.dados.listaLctoDeus.filter(valor => valor.CODPARC == item).map(valor => valor.TAXACELD).reduce((a, b) => a + b, 0) }));
      this.Parceiros.map(item => {
        this.RegistroDeus.push({
          'CODDEC': null,
          'CODIGO': null,
          'CODPARC': item.CODPARC,
          'CREDITO': 307,
          'DATAEMISSAO': this.hoje,
          'DATALIQUID': this.hoje,
          'DATAVCTO': this.hoje,
          'DEBITO': 285,
          'DOCUMENTO': '',
          'EMPRESA': 3,
          'LCTO': null,
          'OBS': `Valor bruto ${item.BRUTO} com tarifa de ${item.TARIFA}`,
          'PROJECAO': 0,
          'TIPOLCTO': 'M',
          'VALOR': item.LIQUIDO,
          'PERMITEAPAGA': 1,
          'TIPOOPERACAO': 23,
          'TRAVACREDITO': null,
          'REGISTROSCOMPENSACAO': this.dados.listaLctoDeus.filter(x => x.CODPARC == item.CODPARC ).map(xx => xx.CODIGO)
        })
      })
      this.total = this.RegistroDeus.map(item => item.VALOR).reduce((ac, vl) => ac + vl, 0)
      this.totaltaxa = this.dados.listaLctoDeus.map(item => item.TARIFA).reduce((ac, vl) => ac + vl, 0)
      console.log('registroDeus', this.RegistroDeus)
      console.log('total', this.total)

    }



    // this.CREDITO = this.RegistroDeus.map(item => item.CREDITO).filter(item => !!item)[0]
    // this.travaSelectConta = this.CREDITO ? 1 : 0;
    // if (this.RegistroDeus[0].CREDITO != null) { this.CREDITO = this.RegistroDeus[0].CREDITO; this.travaSelectConta = 1; }
    // console.log('dados', this.dados);
    // console.log('total', this.total);
    // console.log('credito', this.CREDITO);
    this.verificaliberaBtnLiquidar();
    this.apresentaDespesaRegistroDeus();
  }

  atualizaTela() {

    console.log('this.dados.listaLctoDeus[0].CODDEC', this.dados.listaLctoDeus[0].CODDEC)

    this.financeiroService.getLctoDeus(this.dados.listaLctoDeus[0].CODDEC)
      .subscribe(reslcto => {
        console.log('reslcto', reslcto)

        if (reslcto.length) {
          this.dados.listaLctoDeus = reslcto;
          this.ngOnInit();
        } else {
          this.FechaModal();
        }

      }, error => { console.log(error); });


  }

  updateRegistroDeus() {


    if (this.param == 5) {
      this.RegistroDeus.map(item => {
        item.DATALIQUID = this.dataLiquid;
        item.OBS = this.RegistroDeus[0].OBS || '';
      })
      console.log('map lojavenda', this.RegistroDeus.map(item => item.LOJAVENDA))
      console.log('filter lojavenda unique', this.RegistroDeus.map(item => item.LOJAVENDA).filter((v, i, a) => a.indexOf(v) === i))
      this.Parceiros = this.RegistroDeus.map(item => item.LOJAVENDA).filter((v, i, a) => a.indexOf(v) === i).map(item => ({ 'EMPRESA': item, 'BRUTO': this.RegistroDeus.filter(valor => valor.LOJAVENDA == item).map(valor => valor.VALOR).reduce((a, b) => a + b, 0), 'LIQUIDO': this.RegistroDeus.filter(valor => valor.LOJAVENDA == item).map(valor => (valor.VALOR - valor.TARIFA)).reduce((a, b) => a + b, 0), 'TARIFA': this.RegistroDeus.filter(valor => valor.LOJAVENDA == item).map(valor => valor.TARIFA).reduce((a, b) => a + b, 0) }));
      console.log('parceiros', this.Parceiros)
      if (this.DESPESA) {
        this.RegistroDeus.unshift({
          'CODDEC': null,
          'CODIGO': null,
          'CODPARC': null,
          'CREDITO': this.dados.listaLctoDeus[0].DEBITO,
          'DATAEMISSAO': this.hoje,
          'DATALIQUID': this.dataLiquid,
          'DATAVCTO': this.hoje,
          'DEBITO': this.DESPESA,
          'DOCUMENTO': '',
          'EMPRESA': this.dados.listaLctoDeus[0].EMPRESA,
          'LCTO': null,
          'OBS': this.dados.listaLctoDeus[0].OBS || '',
          'PROJECAO': 0,
          'TIPOLCTO': "D",
          'VALOR': this.valorDespesa.toFixed(2),
          'PERMITEAPAGA': 1,
          'TIPOOPERACAO': 7,
          'TRAVACREDITO': null,
        }
        );
      }
      this.RegistroDeus.unshift({
        'CODDEC': null,
        'CODIGO': null,
        'CODPARC': null,
        'CREDITO': this.ContaCaixa,
        'DATAEMISSAO': this.hoje,
        'DATALIQUID': this.dataLiquid,
        'DATAVCTO': this.hoje,
        'DEBITO': this.CREDITO,
        'DOCUMENTO': '',
        'EMPRESA': this.dados.listaLctoDeus[0].EMPRESA,
        'LCTO': null,
        'OBS': this.dados.listaLctoDeus[0].OBS || '',
        'PROJECAO': 0,
        'TIPOLCTO': "M",
        'VALOR': (this.total - this.valorDespesa).toFixed(2),
        'PERMITEAPAGA': 1,
        'TIPOOPERACAO': 5,
        'TRAVACREDITO': null,
      }
      );
    }

    //parte 2
    if (this.param == 6) {
      let banco = this.RegistroDeus.map(item => {
        return {
          'CODDEC': null,
          'CODIGO': null,
          'CODPARC': item.CODPARC,
          'CREDITO': this.CREDITO,
          'DATAEMISSAO': this.hoje,
          'DATALIQUID': this.dataLiquid,
          'DATAVCTO': this.hoje,
          'DEBITO': 307,
          'DOCUMENTO': '',
          'EMPRESA': 3,
          'LCTO': null,
          'OBS': '',
          'PROJECAO': 0,
          'TIPOLCTO': 'M',
          'VALOR': item.VALOR,
          'PERMITEAPAGA': 1,
          'TIPOOPERACAO': 23,
          'TRAVACREDITO': null,
        }
      })
      banco.map(item => { this.RegistroDeus.push(item) })
      console.log('banco', banco)
      let registocompensacao = this.dados.listaLctoDeus.map(item => item.CODIGO).join();
      console.log('registrocompensacao', registocompensacao)
      // this.RegistroDeus.push({'CODIGO':'REGCOMP','REGISTROSCOMPENSACAO':registocompensacao})
    }
    ;



    console.log('registros finalizados', this.RegistroDeus)
    this.dialogRef.close(this.RegistroDeus);

  }

  apresentaDespesaRegistroDeus() {
    this.mostraContasDespesas = 1;
    this.listaContasDespesas = [];
    this.financeiroService.getContas(2, this.dados.listaLctoDeus[0].EMPRESA, this.dados.listaLctoDeus[0].PROJECAO, null)
      .subscribe(res => {
        this.listaContasDespesas = res;
      }, error => (console.log(error)));

  }

  desapresentaDespesaRegistroDeus() {
    this.mostraContasDespesas = 0;
    this.editaPagamento = 0;


  }

  insertDespesaRegistroDeus() {
    this.RegistroDeus.map(item => {
      item.TARIFA = this.valorDespesa * item.PESOTARIFA
    })
    console.log('registroDeus', this.RegistroDeus)

    this.Parceiros = this.RegistroDeus.map(item => item.LOJAVENDA).filter((v, i, a) => a.indexOf(v) === i).map(item => ({ 'EMPRESA': item, 'BRUTO': this.RegistroDeus.filter(valor => valor.LOJAVENDA == item).map(valor => valor.VALOR).reduce((a, b) => a + b, 0), 'LIQUIDO': this.RegistroDeus.filter(valor => valor.LOJAVENDA == item).map(valor => (valor.VALOR - valor.TARIFA)).reduce((a, b) => a + b, 0).toFixed(2), 'TARIFA': this.RegistroDeus.filter(valor => valor.LOJAVENDA == item).map(valor => valor.TARIFA).reduce((a, b) => a + b, 0).toFixed(2) }));


    // this.mostraContasDespesas = 0;
    // this.dadosDespesaInsert = [];

    // this.dadosDespesaInsert.push({
    //   'CODDEC': this.dados.listaLctoDeus[0].CODDEC,
    //   'CODIGO': null,
    //   'CODPARC': this.dados.listaLctoDeus[0].CODPARC,
    //   'CREDITO': null,
    //   'DATAEMISSAO': this.hoje,
    //   'DATALIQUID': null,
    //   'DATAVCTO': this.hoje,
    //   'DEBITO': this.DESPESA,
    //   'DOCUMENTO': this.dados.listaLctoDeus[0].DOCUMENTO,
    //   'EMPRESA': this.dados.listaLctoDeus[0].EMPRESA,
    //   'LCTO': this.dados.listaLctoDeus[0].LCTO,
    //   'OBS': this.dados.listaLctoDeus[0].OBS || '',
    //   'PROJECAO': this.dados.listaLctoDeus[0].PROJECAO,
    //   'TIPOLCTO': this.dados.listaLctoDeus[0].TIPOLCTO,
    //   'VALOR': this.valorDespesa,
    //   'PERMITEAPAGA': 1,
    //   'TIPOOPERACAO': 3,
    //   'TRAVACREDITO': null,
    // });
    console.log('despesa a inserir', this.dadosDespesaInsert);

    // if (this.valorDespesa > 0) {
    //   this.financeiroService.postInsertDeus(this.dadosDespesaInsert)
    //     .subscribe(res => {

    //       this.atualizaTela();

    //     }, error => (console.log(error)));
    // }
  }

  deletDespesaRegistroDeus(codigo) {
    console.log('codigo deus', codigo);
    this.financeiroService.postDeleteDeus(codigo).
      subscribe(res => {
        console.log('resgistro apagado');
        this.atualizaTela();
      }, error => { console.log(error); });

  }
  calculaSaldo() {
    this.dataInicio = this.hoje;

    for (let i = 0; i < this.contas.length; i++) {
      if (this.contas[i].CODIGO == this.CREDITO) { this.saldoTravaNegativo = this.param != 6 ? this.contas[i].SALDOTRAVANEGATIVO : 0; }
    }
    console.log('saldoTravaNegativo', this.saldoTravaNegativo);


    this.financeiroService.getSaldoConta(this.CREDITO).subscribe(resSaldo => {
      this.saldoFinal = resSaldo[0].SALDO;
      console.log('conta', this.CREDITO);
      console.log('saldo conta', this.saldoFinal);
      this.verificaliberaBtnLiquidar();
    }, error => { console.log(error); });


  }

  verificaliberaBtnLiquidar() {
    this.liberaBtnLiquidar = 0;

    if (this.dataLiquid && this.CREDITO && this.saldoTravaNegativo && this.total <= -this.saldoFinal) { this.liberaBtnLiquidar = 1; }
    if (this.dataLiquid && this.CREDITO && !this.saldoTravaNegativo) { this.liberaBtnLiquidar = 1; }
    if (this.dataLiquid && this.CREDITO && this.param == 5) { this.liberaBtnLiquidar = 1; }

  }

  AlteraPagto(paramAltera) {
    this.paramAlteraPagto = paramAltera;
    this.mostraContasDespesas = 1;
    this.editaPagamento = 1;
  }

  ConcluiAlteraPagto() {

    if (this.paramAlteraPagto == 1) {
      this.financeiroService.getGenDeus().
        subscribe(res => {
          const generatorDeus = res[0].GEN_ID + 1;

          let porcentagemPacial = null;
          const valores1 = [];
          const valores2 = [];

          porcentagemPacial = this.valorParcial / this.total;

          console.log('generatorDeus', generatorDeus);
          console.log('valorParcial', this.valorParcial);
          console.log('listaLctoDeus INICIO', this.dados.listaLctoDeus);
          console.log('porcentagemPacial', porcentagemPacial);

          for (let i = 0; i < this.dados.listaLctoDeus.length; i++) {
            valores1.push({ 'VALOR': this.dados.listaLctoDeus[i].VALOR * porcentagemPacial });
            valores2.push({ 'VALOR': this.dados.listaLctoDeus[i].VALOR - valores1[i].VALOR });
            this.RegistroDeus[i].VALOR = valores2[i].VALOR;
            this.RegistroDeus[i].CODDEC = generatorDeus;
            if (this.RegistroDeus[i].DOCUMENTO.substr(-3, 3) != '(P)') {
              this.RegistroDeus[i].DOCUMENTO = this.RegistroDeus[i].DOCUMENTO + '(P)';
            }
          }

          this.financeiroService.postInsertDeus(this.RegistroDeus).
            subscribe(res => {
              console.log('resgistro INSERIDO');

              for (let i = 0; i < this.dados.listaLctoDeus.length; i++) {
                this.RegistroDeus[i].VALOR = valores1[i].VALOR;

                if (this.RegistroDeus[i].DOCUMENTO.substr(-3, 3) != '(P)') {
                  this.RegistroDeus[i].DOCUMENTO = this.RegistroDeus[i].DOCUMENTO + '(P)';
                }

              }

              this.financeiroService.postLctoDeus(this.RegistroDeus).subscribe(res => {
                console.log('resgistro ALTERADO');

                this.FechaModal();

              }, error => { console.log(error); });


            }, error => { console.log(error); });

          console.log('RegistroDeus', this.RegistroDeus);
          console.log('valores1', valores1);
          console.log('valores2', valores2);

        }, error => { console.log(error); });
    }

    if (this.paramAlteraPagto == 2) {

      console.log('altera vcto')
      console.log('novoVcto', this.novoVcto)

      for (let i of this.RegistroDeus) {
        i.DATAVCTO = this.novoVcto;
      }
      console.log('this.RegistroDeus', this.RegistroDeus);



      this.financeiroService.postLctoDeus(this.RegistroDeus).subscribe(res => {
        console.log('resgistro ALTERADO');
        this.novoVcto = null;
        this.desapresentaDespesaRegistroDeus();

        this.atualizaTela();

      }, error => { console.log(error); });



    }


  }

  Cancelaliquid() {

    for (const item of this.RegistroDeus) {
      item.DATALIQUID = null;
      if (!item.TRAVACREDITO) { item.CREDITO = null; }
    }
    console.log('this.RegistroDeus', this.RegistroDeus);

    if (this.RegistroDeus[0].TIPOLCTO.substr(0, 1) == 'M') {

      this.financeiroService.postDeleteDeus(this.RegistroDeus[0].CODIGO).
        subscribe(res => {
          console.log('resgistro apagado');
          this.FechaModal();
        }, error => { console.log(error); });


    } else {
      this.financeiroService.postLctoDeus(this.RegistroDeus).subscribe(res => {
        console.log('resgistro ALTERADO');
        this.FechaModal();

      }, error => { console.log(error); });

    }
  }

  FechaModal() {

    if (this.RegistroDeus[0].CREDITO == null) { this.CREDITO = null; }

    if (this.param == 1 || this.param == 5) { this.dataLiquid = null; }
    this.updateRegistroDeus();
  }
  converteMoeda(valor) {
    return valor.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+\,)/g, '$1.');
  }

}
