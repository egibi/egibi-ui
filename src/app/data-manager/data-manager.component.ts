import { Component } from '@angular/core';
import { FileDropComponent } from "../_components/file-drop/file-drop.component";

@Component({
  selector: 'data-manager',
  imports: [FileDropComponent],
  templateUrl: './data-manager.component.html',
  styleUrl: './data-manager.component.scss'
})
export class DataManagerComponent {

}
