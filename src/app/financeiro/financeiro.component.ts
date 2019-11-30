import { Component, OnInit, ɵConsole } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Deus } from '../shared/models/deus';
import { Contas } from '../shared/models/contas';
import { FinanceiroService } from './financeiro.service';
import { Param } from '../shared/models/param';
import { ModalRegistroDeusComponent } from './modal-registroDeus/modal-registroDeus.component';
import { ModalInsereDataComponent } from './modal-insereData/modal-insereData.component';

// imports necessário para o select
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl } from '@angular/forms';
import { ElectronService } from '../core/services/electron/electron.service';




// tslint:disable-next-line: class-name
export interface tabelaFinanceiro {
  CODIGO: number;
  CODDEC: number;
  EMPRESA: number;
  CODPARC: number;
  LCTO: number;
  TIPOLCTO: string;
  DOCUMENTO: string;
  DATAEMISSAO: Date;
  DATAVCTO: Date;
  DATALIQUID: Date;
  DEBITO: number;
  CREDITO: number;
  VALOR: number;
  PROJECAO: number;
  OBS: string;
  PERMITEAPAGA: number;
  NOMEEMPRESA: string;
  CCREDITO: string;
  CDEBITO: string;
  FANTASIA: string;
  CONTAMOSTRATELA: string;
  SALDO: number;
}

@Component({
  selector: 'app-financeiro',
  templateUrl: './financeiro.component.html',
  styleUrls: ['./financeiro.component.scss']
})
export class FinanceiroComponent implements OnInit {
  busca: number;
  camposTabela: string[] = [];
  contamostratela: string;
  codigoConta: number;
  descricaoConta: string;
  dataInicio: Date;
  dataFim: Date;
  empresa: number;
  lista: any[];
  listaAgrupada = new MatTableDataSource();
  listaSelectProjecao: any[];
  listaSelectParceiro: any[];
  listaSelectConta: any[];
  listaLctoDeus: any[];
  linhaDeus: Deus;
  listaContas: Contas[];
  listaEmpresas: Param[];
  param: number;
  parametroBuscaContas: number;
  saldoDataInicio: number;
  saldoFinal: number;
  saldoTravaNegativo: number;
  tituloPagina: string;
  projecaoSelecionado = 'TODOS';
  fantasiaSelecionado = 'TODOS';
  contaSelecionado = 'TODOS';

  listaParceiro: any[] = [];
  filtroParceiro = new FormControl();

  constructor(private financeiroService: FinanceiroService, public dialog: MatDialog, public electron: ElectronService) {

  }
  ngOnInit() {
    this.codigoConta = null;
    this.getEmpresas();
  }

  converteMoeda(valor) {
    return valor.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+\,)/g, '$1.');
  }





  RegistrosFinanceiros(param: number) {
    console.log('empresa selecionada', this.empresa);
    console.log('param', param);
    console.log('dataFim', this.dataFim);
    console.log('dataInicio', this.dataInicio);
    if (param == 4) { param = 1 }
    if (param == 3) { param = 2 }


    this.param = param;


    this.financeiroService.getRegistrosFinanceiros(param, this.empresa, this.dataFim, this.dataInicio, this.codigoConta)
      .subscribe(res => {
        console.log('res', res);
        this.lista = res;
        this.listaAgrupada = new MatTableDataSource(this.agrupaRegistroDeus(this.lista));


      }, error => (console.log(error)));
  }

  agrupaRegistroDeus(lista) {
    const listaAgrupada: any[] = [];
    for (let i = 0; i < lista.length; i++) {
      const linha = listaAgrupada.findIndex(x => x.CODPARC === lista[i].CODPARC && lista[i].CODDEC === x.CODDEC);
      if (linha === -1) {

        if (this.param === 1) {
          this.contamostratela = lista[i].CDEBITO;
          this.camposTabela = ['DOCUMENTO', 'DATAVCTO', 'VALOR', 'CONTAMOSTRATELA', 'CODPARC', 'FANTASIA'];
        }

        if (this.param === 2 || this.param === 3) {
          this.camposTabela = ['DOCUMENTO', 'DATALIQUID', 'VALOR', 'CONTAMOSTRATELA', 'CODPARC', 'FANTASIA', 'SALDO'];


          this.contamostratela = lista[i].CDEBITO;
          // tslint:disable-next-line: triple-equals
          if (lista[i].DEBITO != this.codigoConta) {
            lista[i].VALOR = -lista[i].VALOR;
            this.contamostratela = lista[i].CDEBITO;
          }
          if (lista[i].DEBITO == this.codigoConta) {
            this.contamostratela = lista[i].CCREDITO;
          }
        }


        listaAgrupada.push({
          'CODIGO': lista[i].CODIGO,
          'CODDEC': lista[i].CODDEC,
          'EMPRESA': lista[i].EMPRESA,
          'CODPARC': lista[i].CODPARC,
          'LCTO': lista[i].LCTO,
          'TIPOLCTO': lista[i].TIPOLCTO,
          'DOCUMENTO': lista[i].DOCUMENTO,
          'DATAEMISSAO': lista[i].DATAEMISSAO,
          'DATAVCTO': lista[i].DATAVCTO,
          'DATALIQUID': lista[i].DATALIQUID,
          'DEBITO': lista[i].DEBITO,
          'CREDITO': lista[i].CREDITO,
          'VALOR': lista[i].VALOR,
          'PROJECAO': lista[i].PROJECAO,
          'OBS': lista[i].OBS,
          'PERMITEAPAGA': lista[i].PERMITEAPAGA,
          'NOMEEMPRESA': lista[i].NOMEEMPRESA,
          'CCREDITO': lista[i].CCREDITO,
          'CDEBITO': lista[i].CDEBITO,
          'FANTASIA': lista[i].FANTASIA,
          'CONTAMOSTRATELA': this.contamostratela,
          'SALDO': 0
        });
      } else {

        if (lista[i].DEBITO != this.codigoConta && this.param == 2) {
          lista[i].VALOR = -lista[i].VALOR;
        }
        listaAgrupada[linha].VALOR += lista[i].VALOR;
      }
    }

    if (this.param == 2) {

      this.financeiroService.getSaldoContaDataIni(this.codigoConta, this.dataInicio).subscribe(resSaldo => {
        this.saldoDataInicio = resSaldo[0].SALDO;
        console.log('saldoDataInicio', this.saldoDataInicio);

        this.saldoFinal = this.saldoDataInicio;

        for (let i = 0; i < listaAgrupada.length; i++) {
          listaAgrupada[i].SALDO = this.saldoFinal + listaAgrupada[i].VALOR;
          this.saldoFinal += listaAgrupada[i].VALOR;
        }
        console.log('this.saldoFinal', this.saldoFinal);

      }, error => { console.log(error); });

    }
    if (this.param == 1) {

      this.saldoFinal = 0;

      for (let i = 0; i < listaAgrupada.length; i++) {

        listaAgrupada[i].SALDO = this.saldoFinal + listaAgrupada[i].VALOR;
        this.saldoFinal += listaAgrupada[i].VALOR;

        const linhaProjecao = this.listaSelectProjecao.findIndex(x => x.PROJECAO === listaAgrupada[i].PROJECAO);
        if (linhaProjecao === -1) {
          this.listaSelectProjecao.push({ 'PROJECAO': listaAgrupada[i].PROJECAO, });
        }

        const linhaParceiro = this.listaSelectParceiro.findIndex(x => x.FANTASIA === listaAgrupada[i].FANTASIA);
        if (linhaParceiro === -1 && listaAgrupada[i].FANTASIA != null) {
          this.listaSelectParceiro.push({ 'FANTASIA': listaAgrupada[i].FANTASIA, });
        }

        const linhaConta = this.listaSelectConta.findIndex(x => x.CONTAMOSTRATELA === listaAgrupada[i].CONTAMOSTRATELA);
        if (linhaConta === -1) {
          this.listaSelectConta.push({ 'CONTAMOSTRATELA': listaAgrupada[i].CONTAMOSTRATELA, });
        }

      }
      console.log('listaSelectProjecao', this.listaSelectProjecao)
      console.log('listaSelectParceiro', this.listaSelectParceiro)
      console.log('listaSelectConta', this.listaSelectConta)


    }



    return listaAgrupada;
  }



  getEmpresas() {
    this.financeiroService.getParam()
      .subscribe(res => {
        this.listaEmpresas = res;
        console.log('listaEmpresas', this.listaEmpresas);
      }, error => (console.log(error)));
  }

  ChamaModaInsereData(param: number) {
    if (param == 1 || param == 2) { this.limpaLista(); };

    this.param = param;
    console.log('dados enviados para modal inseredata');
    console.log('param', this.param);
    console.log('empresa', this.empresa);
    console.log('dataInicio', this.dataInicio);
    console.log('dataFim', this.dataFim);
    console.log('codigoConta', this.codigoConta);
    console.log('descricaoConta', this.descricaoConta);
    console.log('saldoFinal', this.saldoFinal);


    const dialogRef = this.dialog.open(ModalInsereDataComponent, {
      width: '25vw',
      height: '75vh',
      hasBackdrop: true,
      disableClose: false,
      data: {
        'param': this.param, 'empresa': this.empresa, 'codigoContaBase': this.codigoConta,
        'descricaoContaBase': this.descricaoConta, 'saldoFinal': this.saldoFinal,
        'dataInicio': this.dataInicio, 'dataFim': this.dataFim, 'saldoTravaNegativo': this.saldoTravaNegativo
      },
    });

    dialogRef.afterClosed().subscribe(resmodal => {

      this.dataFim = resmodal.dataFim;
      this.dataInicio = resmodal.dataInicio;
      this.descricaoConta = resmodal.descricaoConta;
      this.codigoConta = resmodal.codigoConta;
      this.saldoTravaNegativo = resmodal.saldoTravaNegativo;
      this.tituloPagina = this.descricaoConta;


      this.RegistrosFinanceiros(this.param);

    }, error => { console.log(error); });
  }

  ChamaModalRegistroDeus(item: any) {
    this.parametroBuscaContas = 1;
    this.financeiroService.getLctoDeus(item.CODDEC).subscribe(reslcto => {
      console.log('reslcto', reslcto);

      this.listaLctoDeus = reslcto;

      this.financeiroService.getContas(this.parametroBuscaContas, this.empresa, item.PROJECAO, null)

        .subscribe(res => {
          this.listaContas = res;
          console.log('listaContas', this.listaContas);
          console.log('item', item);

          const dialogRef = this.dialog.open(ModalRegistroDeusComponent, {
            width: '60vw',
            height: '80vh',
            hasBackdrop: true,
            disableClose: true,
            data: { 'param': this.param, 'listaLctoDeus': this.listaLctoDeus, 'listaContas': this.listaContas },
          });

          dialogRef.afterClosed().subscribe(resmodal => {

            console.log('modal fechado', resmodal);
            this.projecaoSelecionado = 'TODOS';
            this.fantasiaSelecionado = 'TODOS';
            this.contaSelecionado = 'TODOS';


            if (this.param != 2) {
              this.financeiroService.postLctoDeus(resmodal).subscribe(resposta => {
                console.log(resposta);

                this.RegistrosFinanceiros(1);

              }, error => (console.log(error)));
            }

            if (this.param == 2) {

              this.RegistrosFinanceiros(2);


            }





          });



        }, error => (console.log(error)));


    }, error => (console.log(error)));
  }


  carregaExtrato(param: number) {
    this.param = param;
    this.financeiroService.getRegistrosFinanceiros(param, this.empresa, null, this.dataInicio, this.codigoConta)
      .subscribe(res => {
        console.log('res', res);
        this.lista = res;
        this.listaAgrupada = new MatTableDataSource(this.agrupaRegistroDeus(this.lista));
      }, error => (console.log(error)));

  }


  FiltraLista() {
    let listaBkp = this.agrupaRegistroDeus(this.lista);
    let listaFiltrada1 = [];
    let listaFiltrada2 = [];
    let listaFiltrada3 = [];
    for (let i = 0; i < listaBkp.length; i++) {
      if (listaBkp[i].PROJECAO == this.projecaoSelecionado || this.projecaoSelecionado == 'TODOS') {
        listaFiltrada1.push(listaBkp[i]);
      }
    }
    for (let i = 0; i < listaFiltrada1.length; i++) {
      if (listaFiltrada1[i].FANTASIA == this.fantasiaSelecionado || this.fantasiaSelecionado == 'TODOS') {
        listaFiltrada2.push(listaFiltrada1[i]);
      }
    }
    for (let i = 0; i < listaFiltrada2.length; i++) {
      if (listaFiltrada2[i].CONTAMOSTRATELA == this.contaSelecionado || this.contaSelecionado == 'TODOS') {
        listaFiltrada3.push(listaFiltrada2[i]);
      }
    }

    console.log('listaFiltrada', listaFiltrada3);
    this.listaAgrupada = new MatTableDataSource(listaFiltrada3);

    this.saldoFinal = 0;

    for (let i = 0; i < listaFiltrada3.length; i++) {
      this.saldoFinal += listaFiltrada3[i].VALOR;

    }
  }

  ImprimirlistaAgrupada = async function () {
    let data = new Date(this.dataInicio);
    const dataInicio = data.getDate() + '/' + (data.getMonth() + 1) + '/' + data.getFullYear();

    data = new Date(this.dataFim);
    const dataFim = data.getDate() + '/' + (data.getMonth() + 1) + '/' + data.getFullYear();

    data = new Date();
    const hoje = data.getDate() + '/' + (data.getMonth() + 1) + '/' + data.getFullYear();


    let TituloImpressao = '';
    let htmlCabeca = '';
    if (this.param == 1) {
      TituloImpressao = 'CONTAS A PAGAR ATÉ ' + dataFim;
      htmlCabeca = `<tr><td>DOCUMENTO</td> <td>DATA LIQUID</td> <td>VALOR</td> <td>CONTA</td> <td>PARCEIRO</td> </tr>
                    <tr><td colspan="2"></td><td>${this.converteMoeda(this.saldoFinal)}</td><td colspan="2"></td><tr>
                    <tr><td colspan="5"><hr></td><tr>
                    `;

    }
    if (this.param == 2) {
      TituloImpressao = this.descricaoConta + ' - EXTRATO PERÍODO: ' + dataInicio + ' - ' + hoje;
      htmlCabeca = `<tr><td>DOCUMENTO</td> <td>DATA LIQUID</td> <td>VALOR</td> <td>CONTA</td> <td>PARCEIRO</td> <td>SALDO</td> </tr>
                    <tr><td colspan="5"></td><td>${this.converteMoeda(this.saldoFinal)}</td><tr>
                    <tr><td colspan="6"><hr></td><tr>
                    `;


    }

    console.log('listaAgrupada a imprimir', this.listaAgrupada);


    let html = `<html><head><style>@page { size: portrait;margin: 1%; }
                 table,td,tr,span{font-size:10pt;font-family:Arial;}table
                 {width:200mm;}td  {min-width:2mm; height:8mm};  hr{border-top:1pt dashed #000;}
                  </style></head><body ng-controller='BaixaController'> `;

    let conteudo = `<div><span>${TituloImpressao}</span>
                     <hr>
                     <br>
                     `;
    conteudo += `<table>`;

    conteudo += htmlCabeca;


    if (this.param == 1) {
      for (let i = 0; i < this.listaAgrupada.filteredData.length; i++) {

        data = new Date(this.listaAgrupada.filteredData[i].DATAVCTO);
        const dataVcto = data.getDate() + '/' + (data.getMonth() + 1) + '/' + data.getFullYear();
        let codparc = '';
        if (this.listaAgrupada.filteredData[i].CODPARC) { codparc = this.listaAgrupada.filteredData[i].CODPARC; }
        let fantasia = '';
        if (this.listaAgrupada.filteredData[i].FANTASIA) { fantasia = this.listaAgrupada.filteredData[i].FANTASIA; }

        conteudo += ` <tr>
                           <td>${this.listaAgrupada.filteredData[i].DOCUMENTO}</td>
                           <td>${dataVcto} </td>
                           <td>${this.converteMoeda(this.listaAgrupada.filteredData[i].VALOR)} </td>
                           <td>${this.listaAgrupada.filteredData[i].CONTAMOSTRATELA} </td>
                           <td>${codparc} ${fantasia} </td>

                       </tr>
                        `;
      }
    }

    if (this.param == 2) {
      for (let i = 0; i < this.listaAgrupada.filteredData.length; i++) {

        data = new Date(this.listaAgrupada.filteredData[i].DATALIQUID);
        const dataLiquid = data.getDate() + '/' + (data.getMonth() + 1) + '/' + data.getFullYear();
        let codparc = '';
        if (this.listaAgrupada.filteredData[i].CODPARC) { codparc = this.listaAgrupada.filteredData[i].CODPARC; }
        let fantasia = '';
        if (this.listaAgrupada.filteredData[i].FANTASIA) { fantasia = this.listaAgrupada.filteredData[i].FANTASIA; }

        conteudo += ` <tr>
                           <td>${this.listaAgrupada.filteredData[i].DOCUMENTO}</td>
                           <td>${dataLiquid} </td>
                           <td>${this.converteMoeda(this.listaAgrupada.filteredData[i].VALOR)} </td>
                           <td>${this.listaAgrupada.filteredData[i].CONTAMOSTRATELA} </td>
                           <td>${codparc} ${fantasia} </td>
                           <td>${this.converteMoeda(this.listaAgrupada.filteredData[i].SALDO)} </td>

                       </tr>
                        `;
      }
    }

    conteudo += `</table>`;

    html += conteudo + `</body></html>`;

    const janela = await this.electron.fs.writeFile('c:/temp/teste.html', html, (err) => {
      if (err) throw err;
      let modal = window.open('', 'impressao')
      console.log('The file has been saved!');
    });
  }

  limpaLista() {
    this.codigoConta = null;
    this.descricaoConta = '';
    this.tituloPagina = '';
    this.param = null;
    this.saldoDataInicio = null;
    this.saldoFinal = null;
    this.dataInicio = null;
    this.dataFim = null;
    this.listaSelectProjecao = [];
    this.listaSelectParceiro = [];
    this.listaSelectConta = [];
    this.projecaoSelecionado = 'TODOS';
    this.fantasiaSelecionado = 'TODOS';
    this.contaSelecionado = 'TODOS';





    console.log('listaAgrupada');
    this.listaAgrupada = new MatTableDataSource();

  }


}
