import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';


import { CaixaService } from '../../../caixa/caixa.service';


@Component({
  selector: 'app-my-modal',
  templateUrl: './busca-generico.component.html',
  styleUrls: ['./busca-generico.component.scss']
})
export class ModalBuscaGenericoComponent implements OnInit {
  Clientes: any[];
  busca = {
    codigo: '',
    razao: ''
  };
  titulo: string;

  displayedColumns: string[] = ['select', 'CODIGO', 'RAZAO'];
  dataSource = new MatTableDataSource<any[]>(this.Clientes);
  selection = new SelectionModel<any[]>(false, []);

  constructor(
    public dialogRef: MatDialogRef<ModalBuscaGenericoComponent>,
    private caixaService: CaixaService,
    @Inject(MAT_DIALOG_DATA) public data: string) {

    this.titulo = data;

  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
  }


  buscaGenerico(codigo, razao): void {

    if (this.data === 'cliente') {
      this.caixaService.getClientes(codigo, razao)
        .subscribe(cliente => {
          this.Clientes = cliente;
          console.log(cliente);
          this.dataSource = new MatTableDataSource<any[]>(this.Clientes);
          this.selection = new SelectionModel<any[]>(false, []);
        }, error => (console.log(error)));
    }

    if (this.data === 'vendedor') {
      this.caixaService.getVendedores(codigo, razao)
        .subscribe(cliente => {
          this.Clientes = cliente;
          console.log(cliente);
          this.dataSource = new MatTableDataSource<any[]>(this.Clientes);
          this.selection = new SelectionModel<any[]>(false, []);
        }, error => (console.log(error)));
    }
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
    console.log('row', row);
    console.log('select', this.selection.selected);
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.CODIGO}`;
  }










}
