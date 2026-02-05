import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EgibiTableComponent } from '../_components/egibi-table/egibi-table.component';
import { Account, CreateAccountRequest } from '../_models/account.model';
import { AccountsService } from './accounts.service';
import { TableColumn, SortConfig } from '../_components/egibi-table/egibi-table.models';
import { NgbGlobalModalService, ModalResult } from '../_services/ngb-global-modal.service';
import { AddAccountModalComponent } from './add-account-modal/add-account-modal.component';
import { AccountType } from '../_models/account-type';
import { Connection } from '../_models/connection.model';
import { ConnectionsService } from '../_services/connections.service';

@Component({
  selector: 'accounts',
  standalone: true,
  imports: [CommonModule, EgibiTableComponent, FormsModule],
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.scss',
})
export class AccountsComponent implements OnInit {
  accounts: Account[] = [];
  accountTypes: AccountType[] = [];
  connections: Connection[] = [];
  tableData: any[] = [];

  constructor(
    private accountService: AccountsService,
    private connectionsService: ConnectionsService,
    private router: Router,
    private modalService: NgbGlobalModalService
  ) {}

  ngOnInit(): void {
    this.loadAccounts();

    this.accountService.getAccountTypes().subscribe((res) => {
      this.accountTypes = res.responseData || [];
    });

    this.connectionsService.getConnections().subscribe((res) => {
      this.connections = (res.responseData || []).filter((c: Connection) => c.isActive);
    });
  }

  loadAccounts(): void {
    this.accountService.getAccounts().subscribe((res) => {
      this.tableData = <Account[]>(res.responseData || []);
    });
  }

  tableColumns: TableColumn[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'connectionName', label: 'Service', sortable: true },
    { key: 'accountTypeName', label: 'Type', sortable: true },
    { key: 'description', label: 'Description', sortable: true },
  ];

  defaultSort: SortConfig = { key: 'name', direction: 'asc' };

  public addNewAccount(): void {
    this.modalService
      .openModal(
        AddAccountModalComponent,
        { size: 'lg', centered: true },
        {
          connections: this.connections,
          accountTypes: this.accountTypes,
        }
      )
      .subscribe((modalResult: ModalResult<CreateAccountRequest>) => {
        if (modalResult.result && !modalResult.dismissed) {
          this.accountService.createAccount(modalResult.result).subscribe({
            next: (res: any) => {
              console.log('Account created:', res);
              this.loadAccounts();
            },
            error: (err) => {
              console.error('Failed to create account:', err);
            },
          });
        }
      });
  }

  public rowClicked(account: Account): void {
    if (account.id) {
      this.router.navigate([`accounts/account/${account.id}`]);
    } else {
      this.router.navigate(['account']);
    }
  }
}