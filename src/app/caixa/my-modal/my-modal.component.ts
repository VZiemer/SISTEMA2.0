import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { ModalData } from '../../modal-data';


import { CaixaService } from '../caixa.service';


@Component({
  selector: 'app-my-modal',
  templateUrl: './my-modal.component.html',
  styleUrls: ['./my-modal.component.scss']
})
export class MyModalComponent implements OnInit {
  Clientes: any[];
  // Vendas: Cliente[];
  busca = {
    codigo: '',
    razao: ''
  };
  titulo: string;

  displayedColumns: string[] = ['select', 'CODIGO', 'RAZAO'];
  dataSource = new MatTableDataSource<any[]>(this.Clientes);
  selection = new SelectionModel<any[]>(false, []);

  constructor(
    public dialogRef: MatDialogRef<MyModalComponent>,
    private caixaService: CaixaService,
    @Inject(MAT_DIALOG_DATA) public data: string) {

    this.titulo = data;

  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
  }


  getClientes(codigo, razao): void {
    this.caixaService.getClientes(codigo, razao)
      .subscribe(cliente => {
        this.Clientes = cliente;
        console.log(cliente);
        this.dataSource = new MatTableDataSource<any[]>(this.Clientes);
        this.selection = new SelectionModel<any[]>(false, []);
      }, error => (console.log(error)));
  }
  getVendas(status): void {
    this.caixaService.getVendas(status)
      .subscribe(vendas => {
        this.Clientes = vendas;
        console.log(vendas);
        this.dataSource = new MatTableDataSource<any[]>(this.Clientes);
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
    console.log('row', row);
    console.log('select', this.selection.selected);
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.CODIGO}`;
  }










}
