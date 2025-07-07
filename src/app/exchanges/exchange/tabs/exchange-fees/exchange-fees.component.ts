import { CommonModule } from "@angular/common";
import { Component, Input, Output, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from "@angular/forms";
import { EgibiTableComponent } from "../../../../_components/egibi-table/egibi-table.component";

@Component({
  selector: "exchange-fees",
  standalone: true,
  imports: [EgibiTableComponent, ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: "./exchange-fees.component.html",
  styleUrl: "./exchange-fees.component.scss",
})
export class ExchangeFeesComponent implements OnInit {
  @Input() exchangeFeeStructureForm: FormGroup;
  
  public tableName: string;
  public tableColumns: string[] = [];
  public rowData: any[] = [];

  constructor() {}

  ngOnInit(): void {
    var account = "";
    var exchange = "";

    
  }

  
}
