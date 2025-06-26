import { Component, ElementRef, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'content-editable-table',
  imports: [],
  templateUrl: './content-editable-table.component.html',
  styleUrl: './content-editable-table.component.scss'
})
export class ContentEditableTableComponent {
  @Input() headers:
  
  @ViewChild('table') tableRef: ElementRef;


}
