import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { ModalData } from '../../modal-data';
import { Cliente } from '../../shared/models/cliente';
import { CaixaService } from '../caixa.service';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

// const ELEMENT_DATA: PeriodicElement[] = [
//   {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
//   {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
//   {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
//   {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
//   {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
//   {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
//   {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
//   {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
//   {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
//   {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
// ];


@Component({
  selector: 'app-my-modal',
  templateUrl: './my-modal.component.html',
  styleUrls: ['./my-modal.component.scss']
})
export class MyModalComponent implements OnInit {
  Clientes: Cliente[];
  busca = {
    codigo: '',
    razao: ''
  };


  displayedColumns: string[] = ['select', 'CODIGO', 'RAZAO'];
  dataSource = new MatTableDataSource<Cliente>(this.Clientes);
  selection = new SelectionModel<Cliente>(false, []);

  constructor(
    public dialogRef: MatDialogRef<MyModalComponent>,
    private caixaService: CaixaService,
    @Inject(MAT_DIALOG_DATA) public data: ModalData) { }

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
        this.dataSource = new MatTableDataSource<Cliente>(this.Clientes);
        this.selection = new SelectionModel<Cliente>(false, []);
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
  checkboxLabel(row?: Cliente): string {
    console.log('row', row);
    console.log('select', this.selection.selected);
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.CODIGO}`;
  }










}
