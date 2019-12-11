import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { FinanceiroService } from '../financeiro.service';
import { Deus } from '../../shared/models/deus';
import { ModalBuscaGenericoComponent } from '../../shared/components/modal-busca-generico/busca-generico.component'



@Component({
  selector: 'app-modal-insere-data',
  templateUrl: './modal-insereData.component.html',
  styleUrls: ['./modal-insereData.component.scss']
})
export class ModalInsereDataComponent implements OnInit {
  codigoConta: number;
  descricaoConta: string;
  codigoContaBase: number;
  descricaoContaBase: string;
  dataFim: Date;
  dataInicio: Date;
  dataMovimento: Date;
  valorMovimento: number;
  empresa: number;
  listaContas: any[] = [];
  liberaBtnConsulta: number;
  param: number;
  parametroBuscaContas: number;
  stringTituloModal: string;
  saldoFinal: number;
  saldoTravaNegativo: number;
  dadosTransferenciaInsert: Deus[] = [];
  projecao: number;
  parceiro: any[] = [];
  hoje: Date;



  constructor(private financeiroService: FinanceiroService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<ModalInsereDataComponent>,
    @Inject(MAT_DIALOG_DATA) public dados: any) {
  }
  ngOnInit() {
    this.hoje = new Date();
    this.dataInicio = this.dados.dataInicio;
    this.dataFim = this.dados.dataFim;
    this.param = this.dados.param;
    this.empresa = this.dados.empresa;
    this.codigoContaBase = this.dados.codigoContaBase;
    this.descricaoContaBase = this.dados.descricaoContaBase;
    this.saldoFinal = this.dados.saldoFinal;
    this.saldoTravaNegativo = this.dados.saldoTravaNegativo;
    console.log('saldoTravaNegativo', this.saldoTravaNegativo)
    this.stringTituloModal = 'DADOS PARA CONSULTA';
    if (this.param == 3) {
      this.stringTituloModal = 'Transferência ' + this.descricaoContaBase + ' p/';

      this.parametroBuscaContas = 1000;
      this.financeiroService.getContas(this.parametroBuscaContas, this.empresa, null, this.codigoContaBase).subscribe(res => {
        if (res.length) {
          this.listaContas = res;
        } else {
          this.parametroBuscaContas = null;
        }
        console.log('listaContas', this.listaContas);


      }, error => { console.log(error); });
    }
    if (this.param == 4) {
      this.stringTituloModal = 'Lançar Despesa';

    }



  }

  buscaParceiro() {
    let tipoparc = 'C';
    if (this.codigoConta == 241 || this.codigoConta == 277) { tipoparc = 'F'; }


    const dialogRef = this.dialog.open(ModalBuscaGenericoComponent, {
      width: '80vw',
      height: '80vh',
      hasBackdrop: true,
      disableClose: false,
      data: { 'tipoParc': tipoparc },
    });

    dialogRef.afterClosed().subscribe(resmodal => {

      this.parceiro = resmodal[0];

      console.log('parceiro', this.parceiro);


    }, error => { console.log(error); });

  }


  verificaliberaBtnConsulta() {
    this.liberaBtnConsulta = 0;

    if (this.param === 1) {
      if (this.dataFim) { this.liberaBtnConsulta = 1; }
    }
    if (this.param === 2) {
      if (this.parametroBuscaContas != 14) {
        if (this.dataInicio && this.codigoConta) { this.liberaBtnConsulta = 1; }

      } else {
        if (this.dataInicio && this.codigoConta && this.parceiro) { this.liberaBtnConsulta = 1; }

      }
    }

    if (this.param === 3) {

      if (this.codigoConta && this.dataMovimento && this.valorMovimento && this.codigoConta != this.codigoContaBase) {
        this.liberaBtnConsulta = 1;
      }

      if (this.saldoTravaNegativo) {
        if (this.saldoFinal < this.valorMovimento) { this.liberaBtnConsulta = 0; }
      }
    }

    if (this.param === 4) {
      if (this.codigoConta && this.dataMovimento && this.valorMovimento && this.codigoConta != this.codigoContaBase && this.projecao) {
        this.liberaBtnConsulta = 1;
      }

      if (this.saldoTravaNegativo) {
        if (this.saldoFinal < this.valorMovimento) { this.liberaBtnConsulta = 0; }
      }
    }
    if (this.param === 5) {
      if (this.dataFim) { this.liberaBtnConsulta = 1; }
    }


  }

  limpaContas() {
    this.liberaBtnConsulta = 0;
  }

  carregaContas() {
    console.log('estou na função');
    console.log('parametroBuscaContas', this.parametroBuscaContas);
    console.log('codigoConta', this.codigoConta);

    this.codigoConta = null;

    this.financeiroService.getContas(this.parametroBuscaContas, this.empresa, null, this.codigoConta).subscribe(res => {
      this.listaContas = res;
      console.log('listaContas', this.listaContas);


    }, error => { console.log(error); });
    this.verificaliberaBtnConsulta();
  }

  insertTransferenciaRegistroDeus() {
    this.dadosTransferenciaInsert = [];

    this.dadosTransferenciaInsert.push({
      'CODDEC': null,
      'CODIGO': null,
      'CODPARC': null,
      'CREDITO': this.codigoContaBase,
      'DATAEMISSAO': this.hoje,
      'DATALIQUID': this.dataMovimento,
      'DATAVCTO': this.dataMovimento,
      'DEBITO': this.codigoConta,
      'DOCUMENTO': '',
      'EMPRESA': this.empresa,
      'LCTO': null,
      'OBS': '',
      'PROJECAO': 0,
      'TIPOLCTO': 'M',
      'VALOR': this.valorMovimento,
      'PERMITEAPAGA': 1,
      'TIPOOPERACAO': 4,
      'TRAVACREDITO': null,
    });
    console.log('despesa a inserir', this.dadosTransferenciaInsert);


    this.financeiroService.postInsertDeus(this.dadosTransferenciaInsert)
      .subscribe(res => {

        this.FechaModal();

      }, error => (console.log(error)));

  }

  insertDespesaRegistroDeus() {
    this.dadosTransferenciaInsert = [];

    this.dadosTransferenciaInsert.push({
      'CODDEC': null,
      'CODIGO': null,
      'CODPARC': null,
      'CREDITO': null,
      'DATAEMISSAO': this.hoje,
      'DATALIQUID': null,
      'DATAVCTO': this.dataMovimento,
      'DEBITO': this.codigoConta,
      'DOCUMENTO': '',
      'EMPRESA': this.empresa,
      'LCTO': null,
      'OBS': '',
      'PROJECAO': this.projecao,
      'TIPOLCTO': 'D',
      'VALOR': this.valorMovimento,
      'PERMITEAPAGA': 1,
      'TIPOOPERACAO': 3,
      'TRAVACREDITO': null,
    });
    console.log('despesa a inserir', this.dadosTransferenciaInsert);


    this.financeiroService.postInsertDeus(this.dadosTransferenciaInsert)
      .subscribe(res => {

        this.FechaModal();

      }, error => (console.log(error)));

  }


  FechaModal() {
    for (let i = 0; i < this.listaContas.length; i++) {
      if (this.listaContas[i].CODIGO == this.codigoConta) {
        this.descricaoConta = this.listaContas[i].DESCRICAO;
        this.saldoTravaNegativo = this.listaContas[i].SALDOTRAVANEGATIVO;
      }
    }

    let codigoContaEnviada: number;
    let descricaoContaEnviada: string;

    if (this.param != 3) {
      codigoContaEnviada = this.codigoConta;
      descricaoContaEnviada = this.descricaoConta;
    }

    if (this.param == 3) {
      codigoContaEnviada = this.codigoContaBase;
      descricaoContaEnviada = this.descricaoContaBase;
    }


    if (this.liberaBtnConsulta) {

      console.log('fechaModalInsereData');
      console.log('dataFim', this.dataFim);
      console.log('dataInicio', this.dataInicio);
      console.log('codigoConta', codigoContaEnviada);
      console.log('descricaoContaBase', descricaoContaEnviada);
      console.log('saldoTravaNegativo', this.saldoTravaNegativo);

      this.dialogRef.close({
        'dataFim': this.dataFim,
        'dataInicio': this.dataInicio,
        'codigoConta': codigoContaEnviada,
        'descricaoConta': descricaoContaEnviada,
        'saldoTravaNegativo': this.saldoTravaNegativo

      });
    }

  }
}
