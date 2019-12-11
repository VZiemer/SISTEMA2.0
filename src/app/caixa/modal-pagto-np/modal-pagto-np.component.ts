import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { ModalData } from '../../modal-data';
import { CaixaService } from '../caixa.service';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-modal-pagto-np',
  templateUrl: './modal-pagto-np.component.html',
  styleUrls: ['./modal-pagto-np.component.scss']
})
export class ModalPagtoNPComponent implements OnInit {
  titulo: string;
  Pagar: number;
  constructor(
    public dialogRef: MatDialogRef<ModalPagtoNPComponent>,
    private caixaService: CaixaService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    console.log(data);
    this.titulo = data.tipopag;
    this.Pagar = data.valor;
  }

  onNoClick(): void {

    this.dialogRef.close();
  }

  ngOnInit() {

  }
}
