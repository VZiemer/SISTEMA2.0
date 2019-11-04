import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { ModalData } from '../../modal-data';
import { CaixaService } from '../caixa.service';
import { FormControl, Validators } from '@angular/forms';




@Component({
  selector: 'app-modal-pagto-cartao',
  templateUrl: './modal-pagto-cartao.component.html',
  styleUrls: ['./modal-pagto-cartao.component.scss']
})
export class ModalPagtoCartaoComponent implements OnInit {
  Cartao: any[];
  Bandeiras: any[];
  titulo: string;
  cartaoSelecionado: string;
  Pagar: number;
  Total: number;
  selecionado = '';
  // displayedColumns: string[] = ['select', 'CODIGO', 'RAZAO'];
  // dataSource = new MatTableDataSource<any[]>(this.Clientes);
  // selection = new SelectionModel<any[]>(false, []);

  constructor(
    public dialogRef: MatDialogRef<ModalPagtoCartaoComponent>,
    private caixaService: CaixaService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
console.log(data);
    this.titulo = data.tipopag;
    this.Pagar = data.valor;
    this.Total = data.valor;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    this.getCartao(1);
  }
  limpa() {
    this.cartaoSelecionado = '';
  }
  getCartao(estabelecimento: number) {
    this.caixaService.getCartao(estabelecimento)
      .subscribe(cartao => {
        this.Cartao = cartao;
        this.Bandeiras = this.filtraCartao(cartao);
        console.log(cartao);
        // this.dataSource = new MatTableDataSource<any[]>(this.Clientes);
        // this.selection = new SelectionModel<any[]>(false, []);
      }, error => (console.log(error)));
  }

  filtraCartao(cartoes) {
    const distinct = [];
    for (let i = 0; i < cartoes.length; i++) {
      if (distinct.indexOf(cartoes[i].BANDEIRA) === -1) {
        distinct.push(cartoes[i].BANDEIRA);
        console.log(distinct);
      }
    }
    return distinct;
  }

  escolheCartao(cartao) {
    this.cartaoSelecionado = cartao;
  }

  /** Whether the number of selected elements matches the total number of rows. */
  // isAllSelected() {
  //   const numSelected = this.selection.selected.length;
  //   const numRows = this.dataSource.data.length;
  //   return numSelected === numRows;
  // }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  // masterToggle() {
  //   this.isAllSelected() ?
  //     this.selection.clear() :
  //     this.dataSource.data.forEach(row => this.selection.select(row));
  // }

  /** The label for the checkbox on the passed row */
  // checkboxLabel(row?: any): string {
  //   console.log('row', row);
  //   console.log('select', this.selection.selected);
  //   if (!row) {
  //     return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
  //   }
  //   return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.CODIGO}`;
  // }
}
