import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";





@Component({
  selector: "app-modal-error",
  templateUrl: "./modal-error.component.html",
  styleUrls: ["./modal-error.component.scss"]
})

export class ModalErrorComponent implements OnInit {
  error: "";
  constructor(
    public dialogRef: MatDialogRef<ModalErrorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.error = data.error;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
  ngOnInit() { }
}
