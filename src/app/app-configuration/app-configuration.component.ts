import { Component, ViewChild, OnInit } from "@angular/core";
import { NgbNavModule } from "@ng-bootstrap/ng-bootstrap";
import { EntityTypesComponent } from "./sections/entity-types/entity-types.component";
import { AccountUsersComponent } from "./sections/account-users/account-users.component";

@Component({
  selector: "app-configuration",
  imports: [NgbNavModule, EntityTypesComponent, AccountUsersComponent],
  templateUrl: "./app-configuration.component.html",
  styleUrl: "./app-configuration.component.scss",
})
export class AppConfigurationComponent implements OnInit {
@ViewChild(EntityTypesComponent) entityTypes: EntityTypesComponent;


  public activeTab = "entity-types";

  constructor() {}
  ngOnInit(): void {}

  public setActiveTab(tabId: string) {
    this.activeTab = tabId;
    console.log("selected tab:::", this.activeTab);
  }
}
