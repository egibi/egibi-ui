import { Component, OnInit, ViewChild, inject, signal, WritableSignal, TemplateRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ApiTesterService } from "./api-tester.service";
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule, FormsModule } from "@angular/forms";

@Component({
  selector: "api-tester",
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: "./api-tester.component.html",
  styleUrl: "./api-tester.component.scss",
})
export class ApiTesterComponent implements OnInit {
  public apiTesterForm: FormGroup;

  constructor(private fb: FormBuilder, private apiTesterService: ApiTesterService) {}

  public ngOnInit(): void {
    this.apiTesterForm = this.fb.group({
      result: [""],
    });
  }

  public testConnection(): void {

    console.log('api-tester.component => testConnection()');

    this.apiTesterService.testConnection().subscribe((res) => {
      console.log("connection test result....");
      console.log(res);
      this.apiTesterForm.get('result')?.setValue(res.responseData);
    });
  }
}
