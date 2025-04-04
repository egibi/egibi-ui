import { Component, OnInit, ViewChild, inject, signal, WritableSignal, TemplateRef } from "@angular/core";
import { StrategiesService } from "./strategies.service";
import { CommonModule } from "@angular/common";
import { StrategiesGridComponent } from "./strategies-grid/strategies-grid.component";
import { AgGridModule } from "ag-grid-angular";
import { ModalDismissReasons, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { EgibiSharedService } from "../services/egibi-shared.service";
// import { ConnectionComponent } from "./connection/connection.component";
// import { ConnectionType } from "../_models/connection-type.model";
import { StrategiesGridService } from "./strategies-grid/strategies-grid.service";
import { Strategy } from "../_models/strategy.model";

@Component({
  selector: 'strategies',
  imports: [CommonModule, AgGridModule, StrategiesGridComponent],
  templateUrl: './strategies.component.html',
  styleUrl: './strategies.component.scss'
})
export class StrategiesComponent {

  public strategies: Strategy[] = [];

  public onActionSelect():void{
    console.log('strategy action selected...');
  }
}
