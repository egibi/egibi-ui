import { Component, OnDestroy, OnInit } from "@angular/core";
import { signalrChatServiceService } from "../../_signalr-services/signalr-chat.service";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";

interface Message {
  user: string;
  text: string;
  timestamp: Date;
}

@Component({
  selector: "signalr-chat",
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: "./signalr-chat.component.html",
  styleUrl: "./signalr-chat.component.scss",
})
export class SignalRChatComponent implements OnInit, OnDestroy {
  messages: Message[] = [];
  messageText = "";
  username = "User";
  isConnected = false;
  connectionId: string | null = null;

  constructor(private signalrChatService:signalrChatServiceService){}

  ngOnInit(): void {
    // Start SignalR connection
    this.signalrChatService.startConnection()
      .then(() => {
        this.setupSignalRListeners();
        this.connectionId = this.signalrChatService.getConnectionId();
      })
      .catch(err => console.error('Failed to connect:', err));

    // Subscribe to connection status
    this.signalrChatService.connectionStatus$.subscribe(status => {
      this.isConnected = status;
    });

    // Handle reconnection
    this.signalrChatService.onReconnected((connectionId) => {
      console.log('Reconnected with ID:', connectionId);
      this.connectionId = connectionId || null;
    });    
  }

    ngOnDestroy(): void {
    this.signalrChatService.stopConnection();
  }

 private setupSignalRListeners(): void {
    // Listen for incoming messages
    this.signalrChatService.onReceiveMessage((user, message) => {
      this.messages.push({
        user,
        text: message,
        timestamp: new Date()
      });
    });

    // Listen for user connections
    this.signalrChatService.onUserConnected((connectionId) => {
      console.log('User connected:', connectionId);
    });

    // Listen for user disconnections
    this.signalrChatService.onUserDisconnected((connectionId) => {
      console.log('User disconnected:', connectionId);
    });
  }

  sendMessage(): void {
    if (this.messageText.trim() && this.username.trim()) {
      this.signalrChatService.sendMessage(this.username, this.messageText)
        .then(() => {
          this.messageText = '';
        })
        .catch(err => console.error('Failed to send message:', err));
    }
  }

}
