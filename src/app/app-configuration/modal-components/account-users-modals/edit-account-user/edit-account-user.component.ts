import { Component, Input, Output, OnInit, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ReactiveFormsModule, FormGroup, FormBuilder } from "@angular/forms";
import { AppConfigurationService } from "../../../app-configuration.service";
import { AccountUser } from "../../../../_models/account-user.model";
import { NgbGlobalModalService } from "../../../../_services/ngb-global-modal.service";
import { ConfirmationModalComponent } from "../../../../_components/ngb-global-modal-components/confirmation-modal/confirmation-modal.component";

@Component({
  selector: "edit-account-user",
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./edit-account-user.component.html",
  styleUrl: "./edit-account-user.component.scss",
})
export class EditAccountUserComponent implements OnInit {
  @Input() title?: string;
  @Input() accountUser: AccountUser;

  form: FormGroup;

  wasDeleted: boolean = false;

  constructor(public activeModal: NgbActiveModal, private fb: FormBuilder, private configService: AppConfigurationService, private modalService: NgbGlobalModalService) {}
  ngOnInit(): void {
    this.form = this.fb.group({
      email: [""],
      firstName: [""],
      lastName: [""],
      phoneNumber: [""],
    });

    this.form.patchValue(this.accountUser);
  }

  public deleteAccountUser(): void {
    // Confirmation modal to confirm deletion of AccountUser
    this.modalService.openModal(ConfirmationModalComponent, { size: "sm", centered: true }, { title: "Confirm" }).subscribe((result: any) => {
      if (result && !result.dismissed) {
        this.configService.deleteAccountUser(this.accountUser).subscribe((res) => {
          this.configService.setDeletedAccountUser(res.responseData);
          this.dismiss({ dismissed: true, reason: "delete confirmed" });
          this.wasDeleted = true;
        });
      }
    });
  }

  dismiss(dismissedReason: any): void {
    this.activeModal.dismiss(dismissedReason);
  }

  confirm(closedReason: any): void {
    this.activeModal.close();
  }
}
