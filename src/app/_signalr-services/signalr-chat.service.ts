import { Injectable } from "@angular/core";
import * as signalR from "@microsoft/signalr";
import { BehaviorSubject, Observable } from "rxjs";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class signalrChatServiceService {
  private hubConnection: signalR.HubConnection | null = null;
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  public connectionStatus$: Observable<boolean> = this.connectionStatusSubject.asObservable();

  private apiBaseUrl: string = `${environment.apiUrl};`;

  constructor() {}

  // Start connection
  public startConnection(): Promise<void> {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.apiBaseUrl}/notificationHub`, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect() // Automatically reconnect
      .configureLogging(signalR.LogLevel.Information)
      .build();

    return this.hubConnection
      .start()
      .then(() => {
        console.log("SignalR Connected");
        this.connectionStatusSubject.next(true);
      })
      .catch((err) => {
        console.error("Error while starting SignalR connection: " + err);
        this.connectionStatusSubject.next(false);
        throw err;
      });
  }

  // Stop connection
  public stopConnection(): Promise<void> {
    if (this.hubConnection) {
      return this.hubConnection.stop().then(() => {
        console.log("SignalR Disconnected");
        this.connectionStatusSubject.next(false);
      });
    }
    return Promise.resolve();
  }

  // Listen for messages
  public onReceiveMessage(callback: (user: string, message: string) => void): void {
    if (this.hubConnection) {
      this.hubConnection.on("ReceiveMessage", callback);
    }
  }

  // Send message
  public sendMessage(user: string, message: string): Promise<void> {
    if (this.hubConnection) {
      return this.hubConnection.invoke("SendMessage", user, message);
    }
    return Promise.reject("No connection established");
  }

  // Join a group
  public joinGroup(groupName: string): Promise<void> {
    if (this.hubConnection) {
      return this.hubConnection.invoke("JoinGroup", groupName);
    }
    return Promise.reject("No connection established");
  }

  // Leave a group
  public leaveGroup(groupName: string): Promise<void> {
    if (this.hubConnection) {
      return this.hubConnection.invoke("LeaveGroup", groupName);
    }
    return Promise.reject("No connection established");
  }

  // Listen for user connected
  public onUserConnected(callback: (connectionId: string) => void): void {
    if (this.hubConnection) {
      this.hubConnection.on("UserConnected", callback);
    }
  }

  // Listen for user disconnected
  public onUserDisconnected(callback: (connectionId: string) => void): void {
    if (this.hubConnection) {
      this.hubConnection.on("UserDisconnected", callback);
    }
  }

  // Get connection ID
  public getConnectionId(): string | null {
    return this.hubConnection?.connectionId || null;
  }

  // Check if connected
  public isConnected(): boolean {
    return this.hubConnection?.state === signalR.HubConnectionState.Connected;
  }

  // Handle reconnecting
  public onReconnecting(callback: (error?: Error) => void): void {
    if (this.hubConnection) {
      this.hubConnection.onreconnecting(callback);
    }
  }

  // Handle reconnected
  public onReconnected(callback: (connectionId?: string) => void): void {
    if (this.hubConnection) {
      this.hubConnection.onreconnected(callback);
    }
  }

  // Handle close
  public onClose(callback: (error?: Error) => void): void {
    if (this.hubConnection) {
      this.hubConnection.onclose(callback);
    }
  }
}
