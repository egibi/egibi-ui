import { Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { RequestResponse } from "../request-response";
import { EntityType } from "../_models/entity-type.model";
import { AccountUser } from "../_models/account-user.model";
@Injectable({
  providedIn: "root",
})
export class AppConfigurationService {
  private apiBaseUrl: string = "https://localhost:7182/AppConfigurations";

  constructor(private http: HttpClient) {}

  //=====================================================================================
  // ENTITY TYPE STATE MANAGEMENT
  //=====================================================================================
  selectedEntityTypeTable = signal<string>("");
  getSelectedEntityTypeTable(): string {
    return this.selectedEntityTypeTable();
  }
  setSelectedEntityTypeTable(table: string) {
    this.selectedEntityTypeTable.update(() => table);
  }

  selectedEntityType = signal<EntityType>(new EntityType());
  getSelectedEntityType(): EntityType {
    return this.selectedEntityType();
  }
  setSelectedEntityType(entityType: EntityType) {
    this.selectedEntityType.update(() => entityType);
  }

  deletedEntityType = signal<EntityType>(new EntityType());
  getDeletedEntityType(): EntityType {
    return this.deletedEntityType();
  }
  setDeletedEntityType(entityType: EntityType): void {
    this.deletedEntityType.update(() => entityType);
  }
  //-------------------------------------------------------------------------------------

  //=====================================================================================
  // ENTITY TYPE OPERATIONS
  //=====================================================================================
  public getEntityTypeTables(): Observable<RequestResponse> {
    return this.http.get<RequestResponse>(`${this.apiBaseUrl}/get-entity-type-tables`);
  }

  public getEntityTypeRecords(tableName: string): Observable<RequestResponse> {
    return this.http.get<RequestResponse>(`${this.apiBaseUrl}/get-entity-type-records?tableName=${tableName}`);
  }

  public saveEntityType(entityType: EntityType): Observable<RequestResponse> {
    return this.http.post<RequestResponse>(`${this.apiBaseUrl}/save-entity-type`, entityType);
  }

  public deleteEntityType(entityType: EntityType): Observable<RequestResponse> {
    return this.http.post<RequestResponse>(`${this.apiBaseUrl}/delete-entity-type`, entityType);
  }

  //=====================================================================================
  // ACCOUNT USER STATE MANAGEMENT
  //===================================================================================== 
  selectedAccountUser = signal<AccountUser>(new AccountUser());
  getSelectedAccountUser(): AccountUser {
    return this.selectedAccountUser();
  }
  setSelectedAccountUser(accountUser: AccountUser) {
    this.selectedAccountUser.update(() => accountUser);
  }

  createdAccountUser = signal<AccountUser>(new AccountUser());
  getCreatedAccountUser():AccountUser{
    return this.createdAccountUser();
  }
  setCreatedAccountUser(accountUser:AccountUser){
    this.createdAccountUser.update(() => accountUser);
  }

  deletedAccountUser = signal<AccountUser>(new AccountUser());
  getDeletedAccountUser(): AccountUser {
    return this.deletedAccountUser();
  }
  setDeletedAccountUser(accountUser: AccountUser): void {
    this.deletedAccountUser.update(() => accountUser);
  }
  //-------------------------------------------------------------------------------------

  //=====================================================================================
  // ACCOUNT USER OPERATIONS
  //=====================================================================================
  public getAccountUsers(): Observable<RequestResponse> {
    return this.http.get<RequestResponse>(`${this.apiBaseUrl}/get-account-users`);
  }

  public saveAccountUser(accountUser: AccountUser): Observable<RequestResponse> {
    return this.http.post<RequestResponse>(`${this.apiBaseUrl}/save-account-user`, accountUser);
  }

  public deleteAccountUser(accountUser:AccountUser): Observable<RequestResponse> {
    return this.http.post<RequestResponse>(`${this.apiBaseUrl}/delete-account-user`, accountUser);
  }
}
