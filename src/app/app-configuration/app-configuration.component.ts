import { Component, ViewChild, OnInit } from "@angular/core";
import { NgbNavModule } from "@ng-bootstrap/ng-bootstrap";
import { EntityTypesComponent } from "./sections/entity-types/entity-types.component";

@Component({
  selector: "app-configuration",
  imports: [NgbNavModule, EntityTypesComponent],
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
