import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { MatTableDataSource } from "@angular/material/table";
import { SelectionModel } from "@angular/cdk/collections";
import { ModalData } from "../../modal-data";
import { CaixaService } from "../caixa.service";
import { FormControl, Validators } from "@angular/forms";

@Component({
  selector: "app-modal-select-transito",
  templateUrl: "./modal-select-transito.component.html",
  styleUrls: ["./modal-select-transito.component.scss"]
})
export class ModalSelectTransitoComponent implements OnInit {
  transitos: [];
  transito: number;
  cpf = "";
  mostraCPF = false;
  constructor(
    public dialogRef: MatDialogRef<ModalSelectTransitoComponent>,
    private caixaService: CaixaService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // if (data.tipo == "CPF") {
    //   this.mostraCPF = true;
    // }
    console.log(
      data.transitos.filter(item => {
        // if (item.STATUS == 8 || item.STATUS == 4 || item.STATUS == 3 && !item.NFE && !item.CUPOM) { return item; }
        return item; 
      })
    );
    this.transitos = data.transitos.filter(item => {
      // if (item.STATUS == 8 || item.STATUS == 4 || item.STATUS == 3 && !item.NFE && !item.CUPOM) { return item; }
      if (!item.NFE && !item.CUPOM) { return item; }
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
  ngOnInit() {}
}
