import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Connection, SERVICE_CATEGORIES, ALL_CREDENTIAL_FIELDS, CREDENTIAL_FIELD_LABELS } from '../../../_models/connection.model';

@Component({
  selector: 'edit-service-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-service-modal.component.html',
  styleUrl: './edit-service-modal.component.scss',
})
export class EditServiceModalComponent implements OnInit {
  /** If provided, we're editing an existing connection; otherwise creating new */
  @Input() connection: Connection | null = null;

  categories = SERVICE_CATEGORIES;
  allCredentialFields = ALL_CREDENTIAL_FIELDS;
  fieldLabels = CREDENTIAL_FIELD_LABELS;

  // Form fields
  formName = '';
  formDescription = '';
  formCategory = 'crypto_exchange';
  formIconKey = '';
  formColor = '#6C757D';
  formWebsite = '';
  formDefaultBaseUrl = '';
  formRequiredFields: string[] = ['api_key', 'api_secret'];
  formIsDataSource = true;
  formSortOrder = 0;

  saving = false;

  get isNew(): boolean {
    return !this.connection || this.connection.id === 0;
  }

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {
    if (this.connection && this.connection.id) {
      // Editing existing
      this.formName = this.connection.name;
      this.formDescription = this.connection.description || '';
      this.formCategory = this.connection.category || 'other';
      this.formIconKey = this.connection.iconKey || '';
      this.formColor = this.connection.color || '#6C757D';
      this.formWebsite = this.connection.website || '';
      this.formDefaultBaseUrl = this.connection.defaultBaseUrl || '';
      this.formIsDataSource = this.connection.isDataSource ?? true;
      this.formSortOrder = this.connection.sortOrder || 0;
      try {
        this.formRequiredFields = JSON.parse(this.connection.requiredFields || '[]');
      } catch {
        this.formRequiredFields = [];
      }
    }
  }

  toggleField(field: string): void {
    const idx = this.formRequiredFields.indexOf(field);
    if (idx >= 0) {
      this.formRequiredFields.splice(idx, 1);
    } else {
      this.formRequiredFields.push(field);
    }
  }

  isFieldSelected(field: string): boolean {
    return this.formRequiredFields.includes(field);
  }

  get canSave(): boolean {
    return !!this.formName.trim();
  }

  save(): void {
    if (!this.canSave || this.saving) return;
    this.saving = true;

    const conn: any = {
      ...(this.connection || {}),
      name: this.formName.trim(),
      description: this.formDescription.trim(),
      category: this.formCategory,
      iconKey: this.formIconKey.trim(),
      color: this.formColor,
      website: this.formWebsite.trim(),
      defaultBaseUrl: this.formDefaultBaseUrl.trim(),
      requiredFields: JSON.stringify(this.formRequiredFields),
      isDataSource: this.formIsDataSource,
      sortOrder: this.formSortOrder,
      connectionTypeId: 2, // api
      isActive: true,
    };

    if (this.isNew) {
      conn.id = 0;
    }

    this.activeModal.close(conn);
  }

  dismiss(): void {
    this.activeModal.dismiss('cancelled');
  }
}
