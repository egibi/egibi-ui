import { Injectable, numberAttribute, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { RequestResponse } from "../request-response";
import { DataProvider } from "../_models/data-provider.model";
import { DataProviderType } from "../_models/data-provider-type.model";

@Injectable({
  providedIn: "root",
})
export class DataManagerService {
  private apiBaseUrl: string = "https://localhost:7182/DataManager";

  //--------------------------------------------------------------------------------------------------------------
  // TESTING (DATABASE STUFF)
  //______________________________________________________________________________________________________________

  public createDatabase(): void {
    let response = this.http.post(`${this.apiBaseUrl}/create-questdb-table`, null);
  }

  //********************************************************************************************************* */

  //--------------------------------------------------------------------------------------------------------------
  // STATE MANAGEMENT
  //______________________________________________________________________________________________________________

  //File Drop Return
  public fileDropReturn = signal<any>;

  // Selected Data Provider
  public selectedDataProviderComponent = signal<DataProvider>(new DataProvider());
  getSelectedDataProvider(): DataProvider {
    return this.selectedDataProviderComponent();
  }
  setSelectedDataProvider(dataProvider: DataProvider): void {
    this.selectedDataProviderComponent.update(() => dataProvider);
  }

  // Selected Data Provider Type
  public selectedDataProviderType = signal<DataProviderType>(new DataProviderType());
  getSelectedDataProviderType(): DataProviderType {
    return this.selectedDataProviderType();
  }
  setSelectedDataProviderType(dataProviderType: DataProviderType): void {
    this.selectedDataProviderType.update(() => dataProviderType);
  }

  //********************************************************************************************************* */

  constructor(private http: HttpClient) {}

  public getDataProviders(): Observable<RequestResponse> {
    return this.http.get<RequestResponse>(`${this.apiBaseUrl}/get-data-providers`);
  }

  public getDataProvider(id: number): Observable<RequestResponse> {
    console.log("in service...getting data provider with id: ", id);
    return this.http.get<RequestResponse>(`${this.apiBaseUrl}/get-data-provider?id=${id}`);
  }

  public getDataProviderTypes(): Observable<RequestResponse> {
    return this.http.get<RequestResponse>(`${this.apiBaseUrl}/get-data-provider-types`);
  }

  public getDataFormatTypes(): Observable<RequestResponse> {
    return this.http.get<RequestResponse>(`${this.apiBaseUrl}/get-data-format-types`);
  }

  public getDataFrequencyTypes(): Observable<RequestResponse> {
    return this.http.get<RequestResponse>(`${this.apiBaseUrl}/get-data-frequency-types`);
  }

  public saveDataProvider(dataProvider: DataProvider): Observable<RequestResponse> {
    return this.http.post<RequestResponse>(`${this.apiBaseUrl}/save-data-provider`, dataProvider);
  }

  public deleteDataProvider(dataProvider: DataProvider): Observable<RequestResponse> {
    return this.http.delete<RequestResponse>(`${this.apiBaseUrl}/delete-data-provider` + "?id=" + dataProvider.id);
  }
}
