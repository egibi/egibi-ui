import { Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { RequestResponse } from "../request-response";
import { EntityType } from "../_models/entity-type.model";

@Injectable({
  providedIn: "root",
})
export class ConfigurationService {
  private apiBaseUrl: string = "https://localhost:7182/Configuration";

  entityTypes: string[] = [];


  public selectedEntityTypeTable = signal<string>("");

  public setSelectedEntityTypeTable(tableName: string) {
    this.selectedEntityTypeTable.update(() => tableName);
  }

  public getSelectedEntityTypeTable(): string {
    return this.selectedEntityTypeTable();
  }


  constructor(private http: HttpClient) {}

  public getEntityTypeTables(): Observable<RequestResponse> {
    return this.http.get<RequestResponse>(`${this.apiBaseUrl}/get-entity-type-tables`);
  }

  public getEntityTypeRecords(tableName: string): Observable<RequestResponse> {
    return this.http.get<RequestResponse>(`${this.apiBaseUrl}/get-entity-type-records?tableName=${tableName}`);
  }

  public saveEntityType(entityType: EntityType): Observable<RequestResponse> {
    console.log('configuration service should be calling saveEntityType()');
    return this.http.post<RequestResponse>(`${this.apiBaseUrl}/save-entity-type`, entityType);
  }
}
