import { Component, OnInit, Inject, ɵConsole } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { FinanceiroService } from '../financeiro.service';
import { Deus } from '../../shared/models/deus';


@Component({
  selector: 'app-modal-registro-deus',
  templateUrl: './modal-registroDeus.component.html',
  styleUrls: ['./modal-registroDeus.component.scss']
})

export class ModalRegistroDeusComponent implements OnInit {
  CREDITO: number;
  RegistroDeus: any[] = [];
  dataLiquid: Date;
  hoje: Date;
  total: number;
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
  dividePagamento: number;
  valorParcial: number;
  param: number;

  constructor(private financeiroService: FinanceiroService,
    public dialogRef: MatDialogRef<ModalRegistroDeusComponent>,
    @Inject(MAT_DIALOG_DATA) public dados: any) {
  }
  contas: any[] = this.dados.listaContas;
  ngOnInit() {
    this.hoje = new Date();
    this.total = 0;
    this.DESPESA = 0;
    this.valorDespesa = 0;
    this.RegistroDeus = [];
    this.hoje = new Date();
    this.travaSelectConta = null;
    this.dividePagamento = null;
    this.param = this.dados.param;

    for (let i = 0; i < this.dados.listaLctoDeus.length; i++) {
      this.RegistroDeus.push(this.dados.listaLctoDeus[i]);
      this.total += this.dados.listaLctoDeus[i].VALOR;
    }

    if (this.RegistroDeus[0].CREDITO != null) { this.CREDITO = this.RegistroDeus[0].CREDITO; this.travaSelectConta = 1; }
    console.log('dados', this.dados);
    console.log('total', this.total);
    this.verificaliberaBtnLiquidar();
  }

  atualizaTela() {
    this.financeiroService.getLctoDeus(this.dados.listaLctoDeus[0].CODDEC)
      .subscribe(reslcto => {
        this.dados.listaLctoDeus = reslcto;
        this.ngOnInit();
      }, error => { console.log(error); });
  }

  updateRegistroDeus() {

    for (let i = 0; i < this.dados.listaLctoDeus.length; i++) {
      this.dados.listaLctoDeus[i].CREDITO = this.CREDITO || null;
      this.dados.listaLctoDeus[i].DATALIQUID = this.dataLiquid || null;
      this.dados.listaLctoDeus[i].OBS = this.RegistroDeus[0].OBS || '';
    }
    console.log('itemFinal', this.dados.listaLctoDeus);

    this.dialogRef.close(this.dados.listaLctoDeus);
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
    this.dividePagamento = 0;


  }

  insertDespesaRegistroDeus() {
    this.mostraContasDespesas = 0;
    this.dadosDespesaInsert = [];

    this.dadosDespesaInsert.push({
      'CODDEC': this.dados.listaLctoDeus[0].CODDEC,
      'CODIGO': null,
      'CODPARC': this.dados.listaLctoDeus[0].CODPARC,
      'CREDITO': null,
      'DATAEMISSAO': this.hoje,
      'DATALIQUID': null,
      'DATAVCTO': this.hoje,
      'DEBITO': this.DESPESA,
      'DOCUMENTO': this.dados.listaLctoDeus[0].DOCUMENTO,
      'EMPRESA': this.dados.listaLctoDeus[0].EMPRESA,
      'LCTO': this.dados.listaLctoDeus[0].LCTO,
      'OBS': this.dados.listaLctoDeus[0].OBS || '',
      'PROJECAO': this.dados.listaLctoDeus[0].PROJECAO,
      'TIPOLCTO': this.dados.listaLctoDeus[0].TIPOLCTO,
      'VALOR': this.valorDespesa,
      'PERMITEAPAGA': 1,
      'TIPOOPERACAO': 3,
    });
    console.log('despesa a inserir', this.dadosDespesaInsert);

    if (this.valorDespesa > 0) {
      this.financeiroService.postInsertDeus(this.dadosDespesaInsert)
        .subscribe(res => {

          this.atualizaTela();

        }, error => (console.log(error)));
    }
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
      if (this.contas[i].CODIGO == this.CREDITO) { this.saldoTravaNegativo = this.contas[i].SALDOTRAVANEGATIVO; }
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

    if (this.dataLiquid && this.CREDITO && this.saldoTravaNegativo && this.total <= this.saldoFinal) { this.liberaBtnLiquidar = 1; }
    if (this.dataLiquid && this.CREDITO && !this.saldoTravaNegativo) { this.liberaBtnLiquidar = 1; }


  }

  DividePagto() {
    this.mostraContasDespesas = 1;
    this.dividePagamento = 1;

  }

  parcelaPagamento() {

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

  FechaModal() {

    if (this.RegistroDeus[0].CREDITO == null) { this.CREDITO = null; }

     this.dataLiquid = null; 
    this.updateRegistroDeus();
  }
  converteMoeda(valor) {
    return valor.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+\,)/g, '$1.');
  }

}
