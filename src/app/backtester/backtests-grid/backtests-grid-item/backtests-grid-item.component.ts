import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Backtest, BacktestStatus } from '../../backtester.models';
import { Strategy } from '../../../_models/strategy.model';

@Component({
  selector: 'backtests-grid-item',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbDatepickerModule],
  templateUrl: './backtests-grid-item.component.html',
  styleUrl: './backtests-grid-item.component.scss',
})
export class BacktestsGridItemComponent implements OnInit {
  @Input() backtest: Backtest | null = null;
  @Input() strategies: Strategy[] = [];

  public form: FormGroup;
  public statuses = Object.values(BacktestStatus);

  constructor(private fb: FormBuilder) {}

  public ngOnInit(): void {
    this.form = this.fb.group({
      name: [this.backtest?.name || '', [Validators.required, Validators.maxLength(100)]],
      description: [this.backtest?.description || '', [Validators.maxLength(500)]],
      startDate: [this.toNgbDate(this.backtest?.start) || null, [Validators.required]],
      endDate: [this.toNgbDate(this.backtest?.end) || null, [Validators.required]],
      strategyId: [this.backtest?.strategyId || null, [Validators.required]],
      status: [this.backtest?.status || BacktestStatus.Draft, [Validators.required]],
    });
  }

  public isValid(): boolean {
    this.form.markAllAsTouched();
    return this.form.valid;
  }

  public getValue(): Partial<Backtest> {
    const val = this.form.value;
    return {
      ...(this.backtest?.id ? { id: this.backtest.id } : {}),
      name: val.name,
      description: val.description,
      start: this.fromNgbDate(val.startDate),
      end: this.fromNgbDate(val.endDate),
      strategyId: val.strategyId ? Number(val.strategyId) : null,
      status: val.status,
    };
  }

  private toNgbDate(dateStr: string | undefined): NgbDateStruct | null {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
  }

  private fromNgbDate(ngbDate: NgbDateStruct | null): string {
    if (!ngbDate) return '';
    const month = String(ngbDate.month).padStart(2, '0');
    const day = String(ngbDate.day).padStart(2, '0');
    return `${ngbDate.year}-${month}-${day}`;
  }
}
