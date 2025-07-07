export class ChartPropertiesBase {
    chartName: string;
    rowData: ChartRowDataItem[];
}

export class ChartRowDataItem {
  id: number;
  name: string;
  description: string;
  notes: string;
  createdAt: Date;
  lastModifiedAt: Date;
}


