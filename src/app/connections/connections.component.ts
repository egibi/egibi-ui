import { Component, OnInit, ViewChild, inject, signal, WritableSignal, TemplateRef } from "@angular/core";
import { ConnectionsService } from "./connections.service";
import { CommonModule } from "@angular/common";
import { ConnectionsGridComponent } from "./connections-grid/connections-grid.component";
import { AgGridModule } from "ag-grid-angular";
import { ModalDismissReasons, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ConnectionComponent } from "./connection/connection.component";
import { ConnectionsGridService } from "./connections-grid/connections-grid.service";
import { Connection } from "../_models/connection.model";
import { ConnectionType } from "../_models/connection-type.model";

@Component({
  selector: "connections",
  standalone: true,
  imports: [CommonModule, AgGridModule, ConnectionsGridComponent, ConnectionComponent],
  templateUrl: "./connections.component.html",
  styleUrl: "./connections.component.scss",
})
export class ConnectionsComponent implements OnInit {
  @ViewChild(ConnectionsGridComponent)
  connectionsGrid: ConnectionsGridComponent;
  @ViewChild(ConnectionComponent) connectionComponent: ConnectionComponent;

  public selectedConnection: Connection;
  public connectionTypes: ConnectionType[] = [];

  public modalService = inject(NgbModal);
  closeResult: WritableSignal<string> = signal("");
  public rowData: Connection[] = [];

  constructor(private connectionsService: ConnectionsService, private connectionsGridService: ConnectionsGridService) {}

  public ngOnInit(): void {
    this.getConnections();
    this.getConnectionTypes();
  }

  public openModal(connection: Connection, content: TemplateRef<any>) {
    this.modalService.open(content).result.then(
      (result) => {
        // ============================================================================================================
        // SAVE VALUES
        //_____________________________________________________________________________________________________________

        switch (result) {
          case "create-save":
          case "edit-save":
            this.saveConnection();
            break;
          case "delete-confirm":
            this.deleteConnection();
            break;
        }
      },
      (reason) => {
        this.closeResult.set(`Dismissed ${this.getModalDismissedReason(reason)}`);
      }
    );
  }

  private getModalDismissedReason(reason: any): string {
    switch (reason) {
      case ModalDismissReasons.ESC:
        return "by pressing ESC";
      case ModalDismissReasons.BACKDROP_CLICK:
        return "by clicking on a backdrop";
      default:
        return `with: ${reason}`;
    }
  }

  public onActionSelect(selectedAction: any, createModal: any, editModal: any, deleteModal: any) {
    this.connectionsService.setSelectedConnection(selectedAction.connection);
    switch (selectedAction.name) {
      case "create":
        this.openModal(new Connection(), createModal);
        break;
      case "edit":
        this.openModal(selectedAction.connection, editModal);
        break;
      case "delete":
        this.openModal(selectedAction.connection, deleteModal);

        break;
    }
  }

  private getConnections(): void {
    this.connectionsService.getConnections().subscribe((res) => {
      this.connectionsGrid.rowData = res.responseData;
    });
  }

  private getConnectionTypes(): void {
    this.connectionsService.getConnectionTypes().subscribe((res) => {
      this.connectionTypes = res.responseData;
    });
  }

  private saveConnection(): void {
    let details = this.connectionComponent.connectionDetailsForm.value;

    if (details.connectionID == "") details.connectionID = 0;
    if (details.connectionTypeID == "") details.connectionTypeID = 0;

    this.connectionsService.saveConnection(details).subscribe((res) => {
      this.getConnections();
    });
  }

  private deleteConnection(): void {
    let selectedConnection = this.connectionsService.getSelectedConnection();
    this.connectionsService.deleteConnection(selectedConnection).subscribe((res) => {
      this.getConnections();
    });
  }
}
