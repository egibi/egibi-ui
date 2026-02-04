import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbNavModule, NgbProgressbarModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import {
  StorageService, StorageStatus, StorageConfig,
  QuestDbPartition, ArchivedPartition, BackupInfo,
  ArchiveLogEntry, OperationResult, CleanupResult
} from './storage.service';

@Component({
  selector: 'app-storage',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbNavModule, NgbProgressbarModule, NgbTooltipModule],
  templateUrl: './storage.component.html',
  styleUrl: './storage.component.scss'
})
export class StorageComponent implements OnInit {
  private storageSvc = inject(StorageService);

  activeTab = 'overview';
  loading = true;
  operationInProgress = false;

  // Data
  status: StorageStatus | null = null;
  config: StorageConfig = {
    externalDiskPath: '/mnt/egibi-external',
    thresholdPercent: 75,
    keepMonths: 6,
    autoArchiveEnabled: true,
    autoArchiveIntervalHours: 6,
    maxPostgresBackups: 10
  };
  hotPartitions: QuestDbPartition[] = [];
  archivedPartitions: ArchivedPartition[] = [];
  backups: BackupInfo[] = [];
  logEntries: ArchiveLogEntry[] = [];

  // UI state
  configSaved = false;
  configError = '';
  operationMessage = '';
  operationSuccess = true;
  selectedPartitions = new Set<string>();

  ngOnInit() {
    this.loadStatus();
    this.loadPartitions();
    this.loadBackups();
    this.loadLog();
  }

  // --- Data Loading ---

  loadStatus() {
    this.loading = true;
    this.storageSvc.getStatus().subscribe({
      next: (status) => {
        this.status = status;
        this.config = { ...status.config };
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadPartitions() {
    this.storageSvc.getPartitions().subscribe({
      next: (data) => {
        this.hotPartitions = data.hotPartitions;
        this.archivedPartitions = data.archivedPartitions;
      }
    });
  }

  loadBackups() {
    this.storageSvc.getBackups().subscribe({
      next: (data) => this.backups = data
    });
  }

  loadLog() {
    this.storageSvc.getLog(50).subscribe({
      next: (data) => this.logEntries = data
    });
  }

  refreshAll() {
    this.loadStatus();
    this.loadPartitions();
    this.loadBackups();
    this.loadLog();
  }

  // --- Config ---

  saveConfig() {
    this.configSaved = false;
    this.configError = '';
    this.storageSvc.updateConfig(this.config).subscribe({
      next: (saved) => {
        this.config = saved;
        this.configSaved = true;
        setTimeout(() => this.configSaved = false, 3000);
      },
      error: (err) => {
        this.configError = err.error?.message || err.error || 'Failed to save configuration';
      }
    });
  }

  // --- Archive Operations ---

  togglePartitionSelection(name: string) {
    if (this.selectedPartitions.has(name)) {
      this.selectedPartitions.delete(name);
    } else {
      this.selectedPartitions.add(name);
    }
  }

  selectAllEligible() {
    this.hotPartitions
      .filter(p => p.isArchiveEligible)
      .forEach(p => this.selectedPartitions.add(p.name));
  }

  clearSelection() {
    this.selectedPartitions.clear();
  }

  archiveSelected() {
    if (this.selectedPartitions.size === 0) return;
    this.runOperation(
      this.storageSvc.archivePartitions(false, Array.from(this.selectedPartitions)),
      'Archiving partitions...'
    );
  }

  archiveAll() {
    this.runOperation(
      this.storageSvc.archivePartitions(false),
      'Archiving eligible partitions...'
    );
  }

  restorePartition(name: string) {
    this.runOperation(
      this.storageSvc.restorePartition(name),
      `Restoring partition ${name}...`
    );
  }

  cleanupTokens() {
    this.operationInProgress = true;
    this.operationMessage = 'Cleaning up expired tokens...';
    this.storageSvc.cleanupTokens().subscribe({
      next: (result: CleanupResult) => {
        this.operationInProgress = false;
        this.operationSuccess = true;
        this.operationMessage = result.message;
        this.loadLog();
        setTimeout(() => this.operationMessage = '', 5000);
      },
      error: (err) => {
        this.operationInProgress = false;
        this.operationSuccess = false;
        this.operationMessage = err.error?.message || 'Cleanup failed';
      }
    });
  }

  createBackup() {
    this.runOperation(
      this.storageSvc.createBackup(),
      'Creating PostgreSQL backup...',
      () => this.loadBackups()
    );
  }

  private runOperation(observable: any, loadingMsg: string, afterSuccess?: () => void) {
    this.operationInProgress = true;
    this.operationMessage = loadingMsg;
    observable.subscribe({
      next: (result: OperationResult) => {
        this.operationInProgress = false;
        this.operationSuccess = result.success;
        this.operationMessage = result.message;
        this.selectedPartitions.clear();
        this.loadPartitions();
        this.loadStatus();
        this.loadLog();
        afterSuccess?.();
        setTimeout(() => this.operationMessage = '', 5000);
      },
      error: (err: any) => {
        this.operationInProgress = false;
        this.operationSuccess = false;
        this.operationMessage = err.error?.message || 'Operation failed';
      }
    });
  }

  // --- Helpers ---

  formatBytes(bytes: number): string {
    if (bytes >= 1_073_741_824) return (bytes / 1_073_741_824).toFixed(1) + ' GB';
    if (bytes >= 1_048_576) return (bytes / 1_048_576).toFixed(1) + ' MB';
    if (bytes >= 1_024) return (bytes / 1_024).toFixed(0) + ' KB';
    return bytes + ' B';
  }

  getProgressType(percent: number): string {
    if (percent >= 90) return 'danger';
    if (percent >= 75) return 'warning';
    return 'success';
  }

  get eligibleCount(): number {
    return this.hotPartitions.filter(p => p.isArchiveEligible).length;
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString();
  }
}
