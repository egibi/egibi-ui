import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { FileSystemFileEntry, NgxFileDropEntry } from "ngx-file-drop";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class FileDropService {
  private apiBaseUrl: string = `${environment.apiUrl}/DataManager`;
  constructor(private http: HttpClient) {}

  public dropFile(file: FormData): Observable<any> {
    return this.http.post(`${this.apiBaseUrl}/drop-file`, file);
  }
}
