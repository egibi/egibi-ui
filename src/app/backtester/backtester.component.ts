import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { BacktestsGridComponent } from './backtests-grid/backtests-grid.component';
import { BacktestsGridItemComponent } from './backtests-grid/backtests-grid-item/backtests-grid-item.component';
import { BacktesterService } from './backtester.service';
import { Backtest, BacktestStatus } from './backtester.models';
import { BacktestsGridAction } from './backtests-grid/backtests-grid.models';
import { Strategy } from '../_models/strategy.model';
import { StrategiesService } from '../_services/strategies.service';
import { ToastService } from '../_services/toast.service';

@Component({
  selector: 'backtester',
  standalone: true,
  imports: [
    CommonModule,
    NgbModalModule,
    BacktestsGridComponent,
    BacktestsGridItemComponent,
  ],
  templateUrl: './backtester.component.html',
  styleUrl: './backtester.component.scss',
})
export class BacktesterComponent implements OnInit {
  @ViewChild('backtestsGridItem') backtestsGridItem: BacktestsGridItemComponent;

  public rowData: Backtest[] = [];
  public strategies: Strategy[] = [];
  public selectedBacktest: Backtest | null = null;

  constructor(
    private backtesterService: BacktesterService,
    private strategiesService: StrategiesService,
    private modalService: NgbModal,
    private toastService: ToastService,
  ) {}

  public ngOnInit(): void {
    this.loadBacktests();
    this.loadStrategies();
  }

  private loadBacktests(): void {
    this.backtesterService.getBacktests().subscribe({
      next: (response) => {
        this.rowData = response.responseData as Backtest[] || [];
      },
      error: (err) => {
        this.toastService.showError('Failed to load backtests');
        console.error('Error loading backtests:', err);
      }
    });
  }

  private async loadStrategies(): Promise<void> {
    try {
      const response = await this.strategiesService.getAll();
      this.strategies = response.responseData as Strategy[] || [];
    } catch (err) {
      console.error('Error loading strategies:', err);
    }
  }

  public openCreateModal(createModal: any): void {
    this.selectedBacktest = null;
    const modalRef = this.modalService.open(createModal, { size: 'lg', centered: true });

    modalRef.result.then(
      (result) => {
        if (result === 'create-save') {
          this.createBacktest();
        }
      },
      () => {} // dismissed
    );
  }

  public createBacktest(): void {
    if (!this.backtestsGridItem || !this.backtestsGridItem.isValid()) {
      return;
    }

    const backtest = this.backtestsGridItem.getValue() as Backtest;

    this.backtesterService.createBacktest(backtest).subscribe({
      next: (response) => {
        this.toastService.showSuccess('Backtest created successfully');
        this.loadBacktests();
      },
      error: (err) => {
        this.toastService.showError('Failed to create backtest');
        console.error('Error creating backtest:', err);
      }
    });
  }

  public onActionSelect(event: BacktestsGridAction, createModal: any, editModal: any, deleteModal: any): void {
    this.selectedBacktest = event.backtest;

    switch (event.name) {
      case 'edit':
        this.openEditModal(editModal);
        break;
      case 'delete':
        this.openDeleteModal(deleteModal);
        break;
    }
  }

  private openEditModal(editModal: any): void {
    const modalRef = this.modalService.open(editModal, { size: 'lg', centered: true });

    modalRef.result.then(
      (result) => {
        if (result === 'edit-save') {
          this.editBacktest();
        }
      },
      () => {}
    );
  }

  private editBacktest(): void {
    if (!this.backtestsGridItem || !this.backtestsGridItem.isValid()) {
      return;
    }

    const backtest = this.backtestsGridItem.getValue() as Backtest;

    this.backtesterService.updateBacktest(backtest).subscribe({
      next: () => {
        this.toastService.showSuccess('Backtest updated successfully');
        this.loadBacktests();
      },
      error: (err) => {
        this.toastService.showError('Failed to update backtest');
        console.error('Error updating backtest:', err);
      }
    });
  }

  private openDeleteModal(deleteModal: any): void {
    const modalRef = this.modalService.open(deleteModal, { centered: true });

    modalRef.result.then(
      (result) => {
        if (result === 'delete-confirm') {
          this.deleteBacktest();
        }
      },
      () => {}
    );
  }

  private deleteBacktest(): void {
    if (!this.selectedBacktest?.id) return;

    this.backtesterService.deleteBacktest(this.selectedBacktest.id).subscribe({
      next: () => {
        this.toastService.showSuccess('Backtest deleted');
        this.loadBacktests();
      },
      error: (err) => {
        this.toastService.showError('Failed to delete backtest');
        console.error('Error deleting backtest:', err);
      }
    });
  }
}
