import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { FileSystemFileEntry, NgxFileDropEntry } from "ngx-file-drop";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class FileDropService {
  private apiBaseUrl: string = "https://localhost:7182/DataManager";
  constructor(private http: HttpClient) {}

  public dropFile(file: FormData): Observable<any> {
    return this.http.post(`${this.apiBaseUrl}/drop-file`, file);
  }
}
