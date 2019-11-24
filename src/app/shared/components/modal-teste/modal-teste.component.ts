import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';



export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}



@Component({
  selector: 'app-modal-teste',
  templateUrl: './modal-teste.component.html',
  styleUrls: ['./modal-teste.component.scss']
})
export class ModalTesteComponent implements OnInit {


  ngOnInit() {
  }




}
