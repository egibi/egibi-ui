import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SignalrFileUploadService } from "../../_signalr-services/signalr-file-upload.service";
import { Subscription } from "rxjs";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "signalr-file-upload",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./signalr-file-upload.component.html",
  styleUrl: "./signalr-file-upload.component.scss",
})
export class SignalrFileUploadComponent implements OnInit, OnDestroy {
  progressLog: string = "";
  isUploading: boolean = false;
  selectedFile: File | null = null;

  private subscriptions = new Subscription();

  constructor(private signalrFileUploadService: SignalrFileUploadService) {}

  ngOnInit(): void {
    this.initializeSignalR();
  }

  private async initializeSignalR(): Promise<void> {
    try {
      await this.signalrFileUploadService.startConnection();
      this.addToLog("Connected to SignalR hub");

      this.subscriptions.add(
        this.signalrFileUploadService.progressMessage$.subscribe((message) => {
          this.addToLog(message);
        })
      );

      this.subscriptions.add(
        this.signalrFileUploadService.uploadComplete$.subscribe((fileName) => {
          this.addToLog(`✓ Upload completed: ${fileName}`);
          this.isUploading = false;
        })
      );

      this.subscriptions.add(
        this.signalrFileUploadService.uploadError$.subscribe((error) => {
          this.addToLog(`✗ Error: ${error}`);
          this.isUploading = false;
        })
      );
    } catch (error) {
      this.addToLog(`Failed to connect to SignalR: ${error}`);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.addToLog(`File selected: ${this.selectedFile.name}`);
    }
  }

  async uploadFile(): Promise<void> {
    if (!this.selectedFile) {
      this.addToLog("Please select a file first");
      return;
    }

    if (!this.signalrFileUploadService.isConnected()) {
      this.addToLog("Not connected to SignalR hub. Attempting to reconnect...");
      await this.initializeSignalR();
      return;
    }

    this.isUploading = true;
    this.addToLog(`Starting upload: ${this.selectedFile.name}`);

    try {
      const base64 = await this.convertFileToBase64(this.selectedFile);
      await this.signalrFileUploadService.uploadFile(this.selectedFile.name, base64);
    } catch (error) {
      this.addToLog(`Upload failed: ${error}`);
      this.isUploading = false;
    }
  }

  private convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  private addToLog(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    this.progressLog += `[${timestamp}] ${message}\n`;
  }

  clearLog(): void {
    this.progressLog = "";
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.signalrFileUploadService.stopConnection();
  }
}
