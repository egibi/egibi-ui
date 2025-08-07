export class TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
}

export class SortConfig {
  key: string;
  direction: 'asc' | 'desc' | null;
}