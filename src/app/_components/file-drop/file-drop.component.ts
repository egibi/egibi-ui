import { Component, EventEmitter, output, Output } from "@angular/core";
import { NgxFileDropModule, NgxFileDropEntry, FileSystemFileEntry } from "ngx-file-drop";
import { FileDropService } from "../../_services/file-drop.service";

@Component({
  selector: "file-drop",
  standalone: true,
  imports: [NgxFileDropModule],
  templateUrl: "./file-drop.component.html",
  styleUrl: "./file-drop.component.scss",
})
export class FileDropComponent {
  @Output() onFileDropped = new EventEmitter<any>();

  public files: NgxFileDropEntry[] = [];

  constructor(private fileDropService: FileDropService) {}

  public onFileDrop(files: NgxFileDropEntry[]) {
    this.files = files;

    for (const droppedFile of files) {
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          const formData = new FormData();
          formData.append("file", file, file.name);

          this.fileDropService.dropFile(formData).subscribe((res) => {
            console.log("file drop result...");
            console.log(res);
            this.handleFileDrop(res);
          });
        });
      }
    }

    console.log("files dropped...");
  }

  private handleFileDrop(fileDropResult: any): void {
    this.onFileDropped.emit(fileDropResult);
  }
}
