import { Component, Input, OnInit } from "@angular/core";
import { ConnectionType } from "../../_models/connection-type.model";
import { ConnectionsService } from "../connections.service";
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";

@Component({
  selector: "connection",
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: "./connection.component.html",
  styleUrl: "./connection.component.scss",
})
export class ConnectionComponent implements OnInit {
  @Input() connectionTypes: ConnectionType[] = [];
  public connectionDetailsForm: FormGroup;

  constructor(private fb: FormBuilder, private connectionsService: ConnectionsService) {
    this.connectionDetailsForm = this.fb.group({
      connectionId: [""],
      connectionTypeId: [""],
      name: [""],
      description: [""],
      baseUrl: [""],
      apiKey: [""],
      apiSecretKey: [""],
      isDataSource: [""]
    });
  }

  ngOnInit(): void {
    this.connectionDetailsForm.patchValue(this.connectionsService.getSelectedConnection());
  }

  onConnectionTypeChange(event: any): void {

  }
}
