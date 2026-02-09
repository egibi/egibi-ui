import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { EgibiTableComponent } from '../_components/egibi-table/egibi-table.component';
import { Account, CreateAccountRequest } from '../_models/account.model';
import { AccountsService } from './accounts.service';
import { TableColumn, SortConfig } from '../_components/egibi-table/egibi-table.models';
import { NgbGlobalModalService, ModalResult } from '../_services/ngb-global-modal.service';
import { AddAccountModalComponent } from './add-account-modal/add-account-modal.component';
import { AccountType } from '../_models/account-type';
import { Connection } from '../_models/connection.model';
import { ConnectionsService } from '../_services/connections.service';

interface AccountTab {
  id: string;
  label: string;
  count: number;
}

@Component({
  selector: 'accounts',
  standalone: true,
  imports: [CommonModule, EgibiTableComponent, FormsModule, NgbNavModule],
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.scss',
})
export class AccountsComponent implements OnInit {
  accounts: Account[] = [];
  accountTypes: AccountType[] = [];
  connections: Connection[] = [];

  // Tab state
  activeTab = 'all';
  tabs: AccountTab[] = [];
  filteredAccounts: Account[] = [];

  // Scroll-to-top
  showScrollTop = false;

  constructor(
    private accountService: AccountsService,
    private connectionsService: ConnectionsService,
    private router: Router,
    private modalService: NgbGlobalModalService
  ) {}

  @HostListener('window:scroll')
  onWindowScroll() {
    this.showScrollTop = window.scrollY > 400;
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

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
      this.accounts = <Account[]>(res.responseData || []);
      this.buildTabs();
      this.applyFilter();
    });
  }

  buildTabs(): void {
    const typeOrder = ['Crypto Exchange', 'Stock Broker', 'Data Provider', 'Funding Provider', 'Custom'];
    const counts = new Map<string, number>();

    for (const account of this.accounts) {
      const typeName = account.accountTypeName || 'Custom';
      counts.set(typeName, (counts.get(typeName) || 0) + 1);
    }

    this.tabs = [
      { id: 'all', label: 'All', count: this.accounts.length },
      ...typeOrder
        .filter(type => counts.has(type))
        .map(type => ({ id: type, label: type, count: counts.get(type)! }))
    ];
  }

  onTabChange(tabId: string): void {
    this.activeTab = tabId;
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.activeTab === 'all') {
      this.filteredAccounts = [...this.accounts].sort((a, b) => a.name.localeCompare(b.name));
    } else {
      this.filteredAccounts = this.accounts
        .filter(a => (a.accountTypeName || 'Custom') === this.activeTab)
        .sort((a, b) => a.name.localeCompare(b.name));
    }
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
