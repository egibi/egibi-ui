import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ConfigurationService } from "../../configuration.service";

@Component({
  selector: "entity-types",
  imports: [],
  templateUrl: "./entity-types.component.html",
  styleUrl: "./entity-types.component.scss",
})
export class EntityTypesComponent implements OnInit {
  entityTypes: string[] = [];

  constructor(private configurationService: ConfigurationService) {}

  ngOnInit(): void {
    this.getEntityTypeTables();
  }

  public getEntityTypeTables(): void {
    this.configurationService.getEntityTypeTables().subscribe((res) => {
      this.entityTypes = res.responseData;
    });
  }

  public getEntityTypeRecords(tableName: string): void {
    this.configurationService.getEntityTypeRecords(tableName).subscribe((res) => {
      console.log("table records response");
      console.log(res);
    });
  }

  public tableSelectionChanged(selected: any) {
    const selectedValue = (selected.target as HTMLSelectElement).value;

    if (selectedValue != "null") {
      this.configurationService.getEntityTypeRecords(selectedValue).subscribe((res) => {        
        console.log(res);
      });
    }
  }
}
