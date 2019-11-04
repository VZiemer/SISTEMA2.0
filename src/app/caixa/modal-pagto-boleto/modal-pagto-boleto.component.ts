import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { ModalData } from '../../modal-data';
import { CaixaService } from '../caixa.service';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-modal-pagto-boleto',
  templateUrl: './modal-pagto-boleto.component.html',
  styleUrls: ['./modal-pagto-boleto.component.scss']
})
export class ModalPagtoBoletoComponent implements OnInit {
  Boleto: any[];
  Bancos: any[];
  titulo: string;
  boletoSelecionado: any[] = [];
  Pagar: number;
  Total: number;
  selecionado = '';
  // displayedColumns: string[] = ['select', 'CODIGO', 'RAZAO'];
  // dataSource = new MatTableDataSource<any[]>(this.Clientes);
  // selection = new SelectionModel<any[]>(false, []);

  constructor(
    public dialogRef: MatDialogRef<ModalPagtoBoletoComponent>,
    private caixaService: CaixaService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(data);
    this.titulo = data.tipopag;
    this.Pagar = data.valor;
    this.Total = data.valor;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    this.caixaService.getBoleto(1).subscribe(
      boleto => {
        this.Boleto = boleto;
        this.Bancos = this.filtraCartao(boleto);
        console.log(boleto);
      },
      error => console.log(error)
    );
  }
  limpa() {
    this.boletoSelecionado = [];
  }

  filtraCartao(boletos) {
    const distinct = [];
    for (let i = 0; i < boletos.length; i++) {
      if (distinct.indexOf(boletos[i].NOME_BANCO) === -1) {
        distinct.push(boletos[i].NOME_BANCO);
        console.log(distinct);
      }
    }
    return distinct;
  }

  escolheCartao(boleto) {
    this.boletoSelecionado = [];
    for (let i = 0; i < this.Boleto.length; i++) {
      console.log('dentro do for I');
      if (this.Boleto[i].NOME_BANCO === boleto) {
        const maxParcela = Math.floor(this.Pagar / this.Boleto[i].MINIMO);
        for (let j = 1; j <= maxParcela; j++) {
          let vencimentos = '';
          console.log('dentro do for j');
          for (let k = 1; k <= j; k++) {
            console.log ('k',k);
            console.log('periodo', this.Boleto[i].PERIODO);
            vencimentos += (this.Boleto[i].PERIODO * k) + (k !== j ? '/' : '');
          }
          this.boletoSelecionado.push({
            PARCELAS: j,
            PERIODO: this.Boleto[i].PERIODO,
            NOME_BANCO: this.Boleto[i].NOME_BANCO,
            CARTEIRA: this.Boleto[i].CARTEIRA,
            DOMICILIO_BANCARIO: this.Boleto[i].DOMICILIO_BANCARIO,
            BANCO: this.Boleto[i].BANCO,
            VENCIMENTOS: vencimentos
          });
        }
      }
    }
    console.log('boletoselect', this.boletoSelecionado);
  }
}
