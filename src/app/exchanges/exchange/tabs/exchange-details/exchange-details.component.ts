import { CommonModule } from "@angular/common";
import { Component, Input, Output, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from "@angular/forms";

@Component({
  selector: "exchange-details",
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: "./exchange-details.component.html",
  styleUrl: "./exchange-details.component.scss",
})
export class ExchangeDetailsComponent implements OnInit {
  @Input() exchangeDetailsForm: FormGroup;

  constructor() {}

  ngOnInit(): void {}

  public save():void{
    console.log('saving exchange details....');    
  }

  public cancel():void{
    console.log('canceling....');
  }
}
