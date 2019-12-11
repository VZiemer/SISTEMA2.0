import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';


import { CaixaService } from '../../caixa/caixa.service';


@Component({
  selector: 'app-my-modal',
  templateUrl: './busca-venda.component.html',
  styleUrls: ['./busca-venda.component.scss']
})
export class ModalBuscaVendaComponent implements OnInit {
  Vendas: any[];
  busca = {
    codigo: '',
    razao: ''
  };
  titulo = 'Vendas';
  tipo: string;

  displayedColumns: string[] = ['select', 'LCTO', 'NOMECLI', 'TOTAL'];
  dataSource = new MatTableDataSource<any[]>(this.Vendas);
  selection = new SelectionModel<any[]>(false, []);

  constructor(
    public dialogRef: MatDialogRef<ModalBuscaVendaComponent>,
    private caixaService: CaixaService,
    @Inject(MAT_DIALOG_DATA) public data: string) {

    this.tipo = data;

  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    this.buscaVendas(this.tipo);
  }


  buscaVendas(tipo): void {
    console.log('busca vendas')
      this.caixaService.getVendas(tipo)
        .subscribe(vendas => {
          this.Vendas = vendas;
          console.log(vendas);
          this.dataSource = new MatTableDataSource<any[]>(this.Vendas);
          this.selection = new SelectionModel<any[]>(false, []);
        }, error => (console.log(error)));
  }



  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }
  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.CODIGO}`;
  }










}
