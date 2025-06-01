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

  public selectedDataProviderComponent = signal<DataProvider>(new DataProvider());

  constructor(private http: HttpClient) {}

  getSelectedDataProvider(): DataProvider{
    return this.selectedDataProviderComponent();
  }

  setSelectedDataProvider(dataProvider:DataProvider):void{
    this.selectedDataProviderComponent.update(() => dataProvider);
  }


  public getDataProviders(): Observable<RequestResponse> {
    return this.http.get<RequestResponse>(`${this.apiBaseUrl}/get-data-providers`);
  }

  public getDataProvider(id: number): Observable<RequestResponse> {

    console.log('in service...getting data provider with id: ', id);
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

    console.log('dataProvider.Id type:');
    console.log(typeof dataProvider.id);

    return this.http.post<RequestResponse>(`${this.apiBaseUrl}/save-data-provider`, dataProvider);
  }

  public deleteDataProvider(dataProvider:DataProvider):Observable<RequestResponse>{
    return this.http.delete<RequestResponse>(`${this.apiBaseUrl}/delete-data-provider` + "?id=" + dataProvider.id);
  }
}
