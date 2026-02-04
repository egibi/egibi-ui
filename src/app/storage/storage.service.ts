import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StorageConfig {
  externalDiskPath: string;
  thresholdPercent: number;
  keepMonths: number;
  autoArchiveEnabled: boolean;
  autoArchiveIntervalHours: number;
  maxPostgresBackups: number;
}

export interface DiskUsageInfo {
  mountPoint: string;
  totalBytes: number;
  usedBytes: number;
  availableBytes: number;
  usagePercent: number;
}

export interface VolumeInfo {
  name: string;
  sizeBytes: number;
  sizeFormatted: string;
}

export interface StorageStatus {
  dockerVolume: DiskUsageInfo;
  externalDisk: DiskUsageInfo | null;
  postgresVolume: VolumeInfo;
  questDbVolume: VolumeInfo;
  archivedPartitionCount: number;
  thresholdExceeded: boolean;
  config: StorageConfig;
}

export interface QuestDbPartition {
  name: string;
  rowCount: number;
  diskSizeBytes: number;
  diskSizeFormatted: string;
  minTimestamp: string | null;
  maxTimestamp: string | null;
  isActive: boolean;
  isArchiveEligible: boolean;
}

export interface ArchivedPartition {
  name: string;
  sizeBytes: number;
  sizeFormatted: string;
  archivedAt: string;
  rowCount: number;
}

export interface PartitionList {
  hotPartitions: QuestDbPartition[];
  archivedPartitions: ArchivedPartition[];
}

export interface OperationResult {
  success: boolean;
  message: string;
  details: string[];
}

export interface CleanupResult {
  expiredTokensPruned: number;
  staleAuthorizationsPruned: number;
  vacuumCompleted: boolean;
  message: string;
}

export interface BackupInfo {
  fileName: string;
  sizeBytes: number;
  sizeFormatted: string;
  createdAt: string;
}

export interface ArchiveLogEntry {
  action: string;
  target: string;
  timestamp: string;
  success: boolean;
  details: string;
}

@Injectable({ providedIn: 'root' })
export class StorageService {
  private http = inject(HttpClient);
  private baseUrl = 'https://localhost:7182/Storage';

  // --- Config ---
  getConfig(): Observable<StorageConfig> {
    return this.http.get<StorageConfig>(`${this.baseUrl}/config`);
  }

  updateConfig(config: StorageConfig): Observable<StorageConfig> {
    return this.http.put<StorageConfig>(`${this.baseUrl}/config`, config);
  }

  // --- Status ---
  getStatus(): Observable<StorageStatus> {
    return this.http.get<StorageStatus>(`${this.baseUrl}/status`);
  }

  // --- Partitions ---
  getPartitions(): Observable<PartitionList> {
    return this.http.get<PartitionList>(`${this.baseUrl}/partitions`);
  }

  archivePartitions(force = false, specificPartitions?: string[]): Observable<OperationResult> {
    return this.http.post<OperationResult>(`${this.baseUrl}/archive`, { force, specificPartitions });
  }

  restorePartition(partitionName: string): Observable<OperationResult> {
    return this.http.post<OperationResult>(`${this.baseUrl}/restore`, { partitionName });
  }

  // --- Cleanup ---
  cleanupTokens(): Observable<CleanupResult> {
    return this.http.post<CleanupResult>(`${this.baseUrl}/cleanup`, {});
  }

  // --- Backups ---
  getBackups(): Observable<BackupInfo[]> {
    return this.http.get<BackupInfo[]>(`${this.baseUrl}/backups`);
  }

  createBackup(): Observable<OperationResult> {
    return this.http.post<OperationResult>(`${this.baseUrl}/backup`, {});
  }

  // --- Log ---
  getLog(limit = 50): Observable<ArchiveLogEntry[]> {
    return this.http.get<ArchiveLogEntry[]>(`${this.baseUrl}/log`, { params: { limit } });
  }
}
