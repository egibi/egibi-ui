export class EgibiTable{
    name: string;
    columns: EgibiTableColumn[];
    rowData: any[];
}

export class EgibiTableColumn{
    name: string;
    width: any;
}