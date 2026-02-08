import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { ServiceCatalogComponent } from './service-catalog/service-catalog.component';
import { UserManagementComponent } from './user-management/user-management.component';

@Component({
  selector: 'admin',
  imports: [NgbNavModule, ServiceCatalogComponent, UserManagementComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent {
  public active = 1;

  constructor(private router: Router, private route: ActivatedRoute) {}
}
