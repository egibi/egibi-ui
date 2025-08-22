import { Component, OnInit } from "@angular/core";
import { NgbNavModule } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-configuration",
  imports: [NgbNavModule],
  templateUrl: "./app-configuration.component.html",
  styleUrl: "./app-configuration.component.scss",
})
export class AppConfigurationComponent implements OnInit {
  public activeTab = "entity-types";

  constructor() {}
  ngOnInit(): void {}

  public setActiveTab(tabId: string) {
    this.activeTab = tabId;
    console.log("selected tab:::", this.activeTab);
  }
}
