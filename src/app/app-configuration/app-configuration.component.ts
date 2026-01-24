import { Component, ViewChild, OnInit } from "@angular/core";
import { NgbNavModule } from "@ng-bootstrap/ng-bootstrap";
import { EntityTypesComponent } from "./sections/entity-types/entity-types.component";
import { AccountUsersComponent } from "./sections/account-users/account-users.component";
import { Account } from "../_models/account.model";
import { GeoDatetimeDataComponent } from "./sections/geo-datetime-data/geo-datetime-data.component";
import { DevToolsComponent } from "./sections/dev-tools/dev-tools.component";

@Component({
  selector: "app-configuration",
  standalone: true,
  imports: [NgbNavModule, EntityTypesComponent, AccountUsersComponent, GeoDatetimeDataComponent, DevToolsComponent],
  templateUrl: "./app-configuration.component.html",
  styleUrl: "./app-configuration.component.scss",
})
export class AppConfigurationComponent implements OnInit {
  @ViewChild(EntityTypesComponent) entityTypes: EntityTypesComponent;
  @ViewChild(AccountUsersComponent) accountUsers: AccountUsersComponent;

  public activeTab = "entity-types";

  constructor() {}
  ngOnInit(): void {}

  public setActiveTab(tabId: string) {
    this.activeTab = tabId;
    console.log("selected tab:::", this.activeTab);
  }
}
