import { ChartPropertiesBase, ChartRowDataItem } from "./chart-base.model";

export class AccountsChart implements ChartPropertiesBase{
    chartName: string;
    rowData: ChartRowDataItem[];
}