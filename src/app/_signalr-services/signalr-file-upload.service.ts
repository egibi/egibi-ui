import { Injectable } from "@angular/core";
import * as signalR from "@microsoft/signalr";
import { Subject } from "rxjs";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class SignalrFileUploadService {
  private hubConnection!: signalR.HubConnection;
  public progressMessage$ = new Subject<string>();
  public uploadComplete$ = new Subject<string>();
  public uploadError$ = new Subject<string>();

  private apiBaseUrl: string = `${environment.apiUrl}`;

  constructor() {}

  public startConnection(): Promise<void> {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.apiBaseUrl}/fileUploadHub`, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect()
      .build();

    return this.hubConnection
      .start()
      .then(() => {
        console.log("SignalR connection started");
        this.registerServerEvents();
      })
      .catch((err) => {
        console.error("Error starting SignalR connection: ", err);
        throw err;
      });
  }

  private registerServerEvents(): void {
    this.hubConnection.on("UploadProgress", (message: string) => {
      this.progressMessage$.next(message);
    });

    this.hubConnection.on("UploadComplete", (fileName: string) => {
      this.uploadComplete$.next(fileName);
    });

    this.hubConnection.on("UploadError", (error: string) => {
      this.uploadError$.next(error);
    });
  }

  public uploadFile(fileName: string, base64Content: string): Promise<void> {
    return this.hubConnection.invoke("UploadFile", fileName, base64Content);
  }

  public stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
  }

  public isConnected(): boolean {
    return this.hubConnection?.state === signalR.HubConnectionState.Connected;
  }
}
